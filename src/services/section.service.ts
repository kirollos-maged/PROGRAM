import { RepositoryError } from '../repositories/errors';
import { CourseRepository } from '../repositories/course.repository';
import { InstructorRepository } from '../repositories/instructor.repository';
import { SectionRepository, type SectionRow } from '../repositories/section.repository';
import { withTransaction } from '../repositories/transaction';

export class SectionService {
  private courses = new CourseRepository();
  private instructors = new InstructorRepository();
  private sections = new SectionRepository();

  private async requireInstructorId(userId: number): Promise<number> {
    const instructorId = await this.instructors.findInstructorIdByUserId(userId);
    if (!instructorId) throw new RepositoryError('forbidden', 'Instructor access required', 403);
    return instructorId;
  }

  private async assertCourseOwned(courseId: number, instructorId: number): Promise<void> {
    const course = await this.courses.findById(courseId);
    if (!course) throw new RepositoryError('not_found', 'Course not found', 404);
    if (course.instructor_id !== instructorId) throw new RepositoryError('forbidden', 'Not allowed', 403);
  }

  async list(courseId: number) {
    const items = await this.sections.listByCourse(courseId);
    return { items, total: items.length };
  }

  async create(params: { userId: number; courseId: number; title: string }): Promise<SectionRow> {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwned(params.courseId, instructorId);
    const next = (await this.sections.getMaxSortOrder(params.courseId)) + 1;
    return this.sections.create({ courseId: params.courseId, title: params.title, sortOrder: next });
  }

  async update(params: { userId: number; courseId: number; sectionId: number; title: string }): Promise<SectionRow> {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwned(params.courseId, instructorId);
    return this.sections.updateTitle(params.sectionId, params.courseId, params.title);
  }

  async reorder(params: { userId: number; courseId: number; sectionIds: number[] }): Promise<void> {
    const instructorId = await this.requireInstructorId(params.userId);
    await this.assertCourseOwned(params.courseId, instructorId);

    await withTransaction(async (client) => {
      for (let idx = 0; idx < params.sectionIds.length; idx++) {
        await client.query(
          `UPDATE sections SET sort_order = $1, updated_at = NOW() WHERE course_id = $2 AND section_id = $3`,
          [idx + 1, params.courseId, params.sectionIds[idx]],
        );
      }
    });
  }
}

