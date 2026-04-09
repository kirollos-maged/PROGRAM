import { RepositoryError } from '../repositories/errors';
import { CourseRepository, type CourseRow, type CourseStatus } from '../repositories/course.repository';
import { CategoryRepository } from '../repositories/category.repository';
import { InstructorRepository } from '../repositories/instructor.repository';
import { slugify } from '../utils/slug.util';

export class CourseService {
  private courses = new CourseRepository();
  private categories = new CategoryRepository();
  private instructors = new InstructorRepository();

  async listPublished(params: { limit?: number; offset?: number }) {
    const items = await this.courses.listPublished(params.limit ?? 50, params.offset ?? 0);
    return { items, total: items.length };
  }

  async getById(courseId: number) {
    const row = await this.courses.findById(courseId);
    if (!row) throw new RepositoryError('not_found', 'Course not found', 404);
    return row;
  }

  private async generateUniqueSlug(title: string): Promise<string> {
    const base = slugify(title);
    if (!base) throw new RepositoryError('validation', 'Invalid title for slug', 400);

    let slug = base;
    for (let n = 0; n < 20; n++) {
      const exists = await this.courses.findBySlug(slug);
      if (!exists) return slug;
      slug = `${base}-${n + 2}`;
    }
    throw new RepositoryError('conflict', 'Could not generate unique slug', 409);
  }

  private async requireInstructorId(userId: number): Promise<number> {
    const instructorId = await this.instructors.findInstructorIdByUserId(userId);
    if (!instructorId) throw new RepositoryError('forbidden', 'Instructor access required', 403);
    return instructorId;
  }

  async createDraft(params: {
    userId: number;
    title: string;
    description?: string;
    price: number;
    categoryId: number;
    level?: CourseRow['level'];
    thumbnailUrl?: string;
  }) {
    const category = await this.categories.findById(params.categoryId);
    if (!category) throw new RepositoryError('validation', 'Invalid category', 400);

    const slug = await this.generateUniqueSlug(params.title);
    const instructorId = await this.requireInstructorId(params.userId);
    const row = await this.courses.create({
      instructorId,
      categoryId: params.categoryId,
      title: params.title,
      slug,
      description: params.description ?? null,
      price: params.price,
      level: params.level ?? null,
      thumbnailUrl: params.thumbnailUrl ?? null,
      status: 'draft',
    });

    return row;
  }

  async updateDraft(params: {
    courseId: number;
    userId: number;
    patch: {
      title?: string;
      description?: string | null;
      price?: number;
      categoryId?: number;
      level?: CourseRow['level'];
      thumbnailUrl?: string | null;
      status?: CourseStatus;
    };
  }) {
    const patch = { ...params.patch };
    const instructorId = await this.requireInstructorId(params.userId);

    if (patch.categoryId !== undefined) {
      const category = await this.categories.findById(patch.categoryId);
      if (!category) throw new RepositoryError('validation', 'Invalid category', 400);
    }

    if (patch.title !== undefined) {
      patch.status = undefined; // don't auto change status on title change
      const slug = await this.generateUniqueSlug(patch.title);
      return this.courses.update(params.courseId, instructorId, { ...patch, slug });
    }

    return this.courses.update(params.courseId, instructorId, patch);
  }

  async publish(params: { courseId: number; userId: number }) {
    const instructorId = await this.requireInstructorId(params.userId);
    const course = await this.courses.findById(params.courseId);
    if (!course) throw new RepositoryError('not_found', 'Course not found', 404);
    if (course.instructor_id !== instructorId) {
      throw new RepositoryError('forbidden', 'Not allowed', 403);
    }
    if (course.status === 'archived') {
      throw new RepositoryError('validation', 'Archived courses cannot be published', 400);
    }

    // Minimal publish rule: must have title + category + slug already exists (schema enforces)
    return this.courses.update(params.courseId, instructorId, { status: 'published' });
  }
}

