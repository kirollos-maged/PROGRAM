import { RepositoryError } from '../repositories/errors';
import { StudentRepository } from '../repositories/student.repository';
import { InstructorRepository } from '../repositories/instructor.repository';
import { AssignmentRepository } from '../repositories/assignment.repository';
import { AssignmentSubmissionRepository } from '../repositories/assignment_submission.repository';
import { CourseRepository } from '../repositories/course.repository';

export class AssignmentSubmissionService {
  private students = new StudentRepository();
  private instructors = new InstructorRepository();
  private assignments = new AssignmentRepository();
  private submissions = new AssignmentSubmissionRepository();
  private courses = new CourseRepository();

  private async requireStudentId(userId: number): Promise<number> {
    const studentId = await this.students.findStudentIdByUserId(userId);
    if (!studentId) throw new RepositoryError('forbidden', 'Student access required', 403);
    return studentId;
  }

  private async requireInstructorId(userId: number): Promise<number> {
    const instructorId = await this.instructors.findInstructorIdByUserId(userId);
    if (!instructorId) throw new RepositoryError('forbidden', 'Instructor access required', 403);
    return instructorId;
  }

  async submit(params: { userId: number; assignmentId: number; content?: string; fileUrl?: string | null }) {
    const studentId = await this.requireStudentId(params.userId);
    const assignment = await this.assignments.findById(params.assignmentId);
    if (!assignment) throw new RepositoryError('not_found', 'Assignment not found', 404);

    const attempts = await this.submissions.countByStudent(params.assignmentId, studentId);

    const allowResubmission = Boolean(assignment.allow_resubmission ?? false);
    const maxAttempts = Number(assignment.max_attempts ?? 1);

    if (!allowResubmission && attempts >= 1) {
      throw new RepositoryError('validation', 'Resubmission not allowed', 400);
    }
    if (attempts >= maxAttempts) {
      throw new RepositoryError('validation', 'Max submission attempts reached', 400);
    }

    return this.submissions.create({
      assignmentId: params.assignmentId,
      studentId,
      content: params.content ?? null,
      fileUrl: params.fileUrl ?? null,
    });
  }

  async mySubmissions(params: { userId: number; assignmentId: number }) {
    const studentId = await this.requireStudentId(params.userId);
    const items = await this.submissions.listByStudent(params.assignmentId, studentId);
    return { items, total: items.length };
  }

  async grade(params: { userId: number; submissionId: number; score: number; feedback?: string }) {
    const instructorId = await this.requireInstructorId(params.userId);
    const submission = await this.submissions.findById(params.submissionId);
    if (!submission) throw new RepositoryError('not_found', 'Submission not found', 404);
    const assignment = await this.assignments.findById(submission.assignment_id);
    if (!assignment) throw new RepositoryError('not_found', 'Assignment not found', 404);

    const course = await this.courses.findById(assignment.course_id);
    if (!course) throw new RepositoryError('not_found', 'Course not found', 404);
    if (course.instructor_id !== instructorId) throw new RepositoryError('forbidden', 'Not allowed', 403);

    const maxScore = Number(assignment.max_score);
    if (params.score < 0 || params.score > maxScore) {
      throw new RepositoryError('validation', 'Score out of range', 400);
    }

    return this.submissions.grade({
      submissionId: params.submissionId,
      instructorId,
      score: params.score,
      feedback: params.feedback ?? null,
    });
  }
}

