import { RepositoryError } from '../repositories/errors';
import { CourseRepository } from '../repositories/course.repository';
import { InstructorRepository } from '../repositories/instructor.repository';
import { SectionRepository } from '../repositories/section.repository';
import { LessonRepository, type LessonType, type LessonRow } from '../repositories/lesson.repository';
import { withTransaction } from '../repositories/transaction';

export class LessonService {
  private courses = new CourseRepository();
  private instructors = new InstructorRepository();
  private sections = new SectionRepository();
  private lessons = new LessonRepository();

  private async requireInstructorId(userId: number): Promise<number> {
    const instructorId = await this.instructors.findInstructorIdByUserId(userId);
    if (!instructorId) throw new RepositoryError('forbidden', 'Instructor access required', 403);
    return instructorId;
  }

  private async assertCourseOwnedBySection(sectionId: number, instructorId: number): Promise<void> {
    const section = await this.sections.findById(sectionId);
    if (!section) throw new RepositoryError('not_found', 'Section not found', 404);
    const course = await this.courses.findById(section.course_id);
    if (!course) throw new RepositoryError('not_found', 'Course not found', 404);
    if (course.instructor_id !== instructorId) throw new RepositoryError('forbidden', 'Not allowed', 403);
  }

  async listBySection(sectionId: number): Promise<{ items: LessonRow[]; total: number }> {
    const items = await this.lessons.listBySection(sectionId);
    return { items, total: items.length };
  }

  async create(params: {
    userId: number;
    sectionId: number;
    title: string;
    lessonType: LessonType;
    content?: string;
    videoUrl?: string;
    durationMinutes?: number;
    isPreview?: boolean;
  }): Promise<LessonRow> {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwnedBySection(params.sectionId, instructorId);
    const next = (await this.lessons.getMaxSortOrder(params.sectionId)) + 1;
    return this.lessons.create({
      sectionId: params.sectionId,
      title: params.title,
      lessonType: params.lessonType,
      content: params.content ?? null,
      videoUrl: params.videoUrl ?? null,
      durationMinutes: params.durationMinutes ?? null,
      sortOrder: next,
      isPreview: params.isPreview ?? false,
    });
  }

  async update(params: {
    userId: number;
    sectionId: number;
    lessonId: number;
    patch: {
      title?: string;
      content?: string | null;
      videoUrl?: string | null;
      durationMinutes?: number | null;
      isPreview?: boolean;
    };
  }): Promise<LessonRow> {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwnedBySection(params.sectionId, instructorId);
    return this.lessons.update(params.lessonId, params.sectionId, params.patch);
  }

  async reorder(params: { userId: number; sectionId: number; lessonIds: number[] }): Promise<void> {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwnedBySection(params.sectionId, instructorId);

    await withTransaction(async (client) => {
      for (let idx = 0; idx < params.lessonIds.length; idx++) {
        await client.query(
          `UPDATE lessons SET sort_order = $1, updated_at = NOW() WHERE section_id = $2 AND lesson_id = $3`,
          [idx + 1, params.sectionId, params.lessonIds[idx]],
        );
      }
    });
  }
}

