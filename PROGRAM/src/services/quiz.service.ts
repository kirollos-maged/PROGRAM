import { RepositoryError } from '../repositories/errors';
import { InstructorRepository } from '../repositories/instructor.repository';
import { CourseRepository } from '../repositories/course.repository';
import { QuizRepository } from '../repositories/quiz.repository';
import { QuestionRepository, type QuestionType } from '../repositories/question.repository';
import { AnswerRepository } from '../repositories/answer.repository';
import { StudentRepository } from '../repositories/student.repository';
import { QuizAttemptRepository } from '../repositories/quiz_attempt.repository';
import { QuizAttemptAnswerRepository } from '../repositories/quiz_attempt_answer.repository';
import { withTransaction } from '../repositories/transaction';

export class QuizService {
  private instructors = new InstructorRepository();
  private students = new StudentRepository();
  private courses = new CourseRepository();
  private quizzes = new QuizRepository();
  private questions = new QuestionRepository();
  private answers = new AnswerRepository();
  private attempts = new QuizAttemptRepository();
  private attemptAnswers = new QuizAttemptAnswerRepository();

  private async requireInstructorId(userId: number): Promise<number> {
    const instructorId = await this.instructors.findInstructorIdByUserId(userId);
    if (!instructorId) throw new RepositoryError('forbidden', 'Instructor access required', 403);
    return instructorId;
  }

  private async requireStudentId(userId: number): Promise<number> {
    const studentId = await this.students.findStudentIdByUserId(userId);
    if (!studentId) throw new RepositoryError('forbidden', 'Student access required', 403);
    return studentId;
  }

  private async assertCourseOwned(courseId: number, instructorId: number) {
    const course = await this.courses.findById(courseId);
    if (!course) throw new RepositoryError('not_found', 'Course not found', 404);
    if (course.instructor_id !== instructorId) throw new RepositoryError('forbidden', 'Not allowed', 403);
  }

  async createQuiz(params: {
    userId: number;
    courseId: number;
    title: string;
    description?: string;
    timeLimitMinutes?: number | null;
    maxAttempts?: number | null;
    isRandomized?: boolean;
  }) {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwned(params.courseId, instructorId);
    return this.quizzes.create({
      courseId: params.courseId,
      title: params.title,
      description: params.description ?? null,
      timeLimitMinutes: params.timeLimitMinutes ?? null,
      maxAttempts: params.maxAttempts ?? null,
      isRandomized: params.isRandomized ?? false,
    });
  }

  async addQuestion(params: { userId: number; quizId: number; questionText: string; questionType: QuestionType; points: number }) {
    // Ownership check via quiz -> course
    const instructorId = await this.requireInstructorId(params.userId);
    const quiz = await this.quizzes.findById(params.quizId);
    if (!quiz) throw new RepositoryError('not_found', 'Quiz not found', 404);
    await this.assertCourseOwned(quiz.course_id, instructorId);
    const sortOrder = (await this.questions.getMaxSortOrder(params.quizId)) + 1;
    return this.questions.create({ quizId: params.quizId, questionText: params.questionText, questionType: params.questionType, points: params.points, sortOrder });
  }

  async addAnswer(params: { userId: number; questionId: number; answerText: string; isCorrect: boolean }) {
    // Ownership check via question -> quiz -> course
    const instructorId = await this.requireInstructorId(params.userId);
    // query chain via DB to keep minimal
    const { pgPool } = await import('../config/db');
    const q = await pgPool.query<{ quiz_id: number }>('SELECT quiz_id FROM questions WHERE question_id = $1', [params.questionId]);
    const quizId = q.rows[0]?.quiz_id;
    if (!quizId) throw new RepositoryError('not_found', 'Question not found', 404);
    const quiz = await this.quizzes.findById(quizId);
    if (!quiz) throw new RepositoryError('not_found', 'Quiz not found', 404);
    await this.assertCourseOwned(quiz.course_id, instructorId);

    const existing = await this.answers.listByQuestion(params.questionId);
    const sortOrder = (existing.at(-1)?.sort_order ?? 0) + 1;
    return this.answers.create({ questionId: params.questionId, answerText: params.answerText, isCorrect: params.isCorrect, sortOrder });
  }

  async startAttempt(params: { userId: number; quizId: number }) {
    const studentId = await this.requireStudentId(params.userId);
    const quiz = await this.quizzes.findById(params.quizId);
    if (!quiz) throw new RepositoryError('not_found', 'Quiz not found', 404);

    if (quiz.max_attempts !== null) {
      const count = await this.attempts.countAttempts(studentId, params.quizId);
      if (count >= quiz.max_attempts) throw new RepositoryError('validation', 'Max attempts reached', 400);
    }

    const attempt = await this.attempts.create({ quizId: params.quizId, studentId });
    const questions = await this.questions.listByQuiz(params.quizId, Boolean(quiz.is_randomized));

    // Include answers for MC/TF
    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => ({
        ...q,
        answers: q.question_type === 'short_answer' ? [] : await this.answers.listByQuestion(q.question_id),
      })),
    );

    return { attempt, quiz, questions: questionsWithAnswers };
  }

  async submitAttempt(params: {
    userId: number;
    attemptId: number;
    answers: Array<{ questionId: number; answerId?: number; answerText?: string }>;
  }) {
    const studentId = await this.requireStudentId(params.userId);
    const attempt = await this.attempts.findById(params.attemptId);
    if (!attempt) throw new RepositoryError('not_found', 'Attempt not found', 404);
    if (attempt.student_id !== studentId) throw new RepositoryError('forbidden', 'Not allowed', 403);
    if (attempt.completed_at) throw new RepositoryError('validation', 'Attempt already completed', 400);

    const quiz = await this.quizzes.findById(attempt.quiz_id);
    if (!quiz) throw new RepositoryError('not_found', 'Quiz not found', 404);

    if (quiz.time_limit_minutes) {
      const started = new Date(attempt.started_at).getTime();
      const deadline = started + quiz.time_limit_minutes * 60_000;
      if (Date.now() > deadline) throw new RepositoryError('validation', 'Time limit exceeded', 400);
    }

    const questionRows = await this.questions.listByQuiz(quiz.quiz_id, false);
    const questionById = new Map(questionRows.map((q) => [q.question_id, q]));

    // Auto-grade inside a transaction
    const result = await withTransaction(async () => {
      let score = 0;
      let maxScore = 0;

      for (const q of questionRows) {
        maxScore += Number(q.points);
      }

      for (const submitted of params.answers) {
        const q = questionById.get(submitted.questionId);
        if (!q) continue;

        if (q.question_type === 'short_answer') {
          // Not auto-gradable without rubric; store response, award 0.
          await this.attemptAnswers.upsert({
            attemptId: params.attemptId,
            questionId: q.question_id,
            answerText: submitted.answerText ?? null,
            isCorrect: null,
            pointsAwarded: 0,
          });
          continue;
        }

        const possibleAnswers = await this.answers.listByQuestion(q.question_id);
        const correct = possibleAnswers.find((a) => a.is_correct);
        const isCorrect = Boolean(correct && submitted.answerId && submitted.answerId === correct.answer_id);
        const pointsAwarded = isCorrect ? Number(q.points) : 0;
        score += pointsAwarded;

        await this.attemptAnswers.upsert({
          attemptId: params.attemptId,
          questionId: q.question_id,
          answerId: submitted.answerId ?? null,
          isCorrect,
          pointsAwarded,
        });
      }

      const percent = maxScore > 0 ? (score / maxScore) * 100 : 0;
      const passed = percent >= Number(quiz.passing_score);
      const completed = await this.attempts.complete({ attemptId: params.attemptId, score, maxScore, passed });
      return { completed, score, maxScore, passed };
    });

    return result;
  }
}

