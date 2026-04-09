import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type CourseStatus = 'draft' | 'published' | 'archived';
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all' | null;

export type CourseRow = {
  course_id: number;
  instructor_id: number;
  category_id: number;
  title: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  price: string;
  thumbnail_url: string | null;
  status: CourseStatus;
  level: CourseLevel;
  created_at: string;
  updated_at: string;
};

export class CourseRepository extends BaseRepository {
  async listPublished(limit = 50, offset = 0): Promise<CourseRow[]> {
    return this.queryMany<CourseRow>(
      pgPool,
      `SELECT *
       FROM courses
       WHERE status = 'published'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async findById(courseId: number): Promise<CourseRow | null> {
    return this.queryOne<CourseRow>(
      pgPool,
      `SELECT * FROM courses WHERE course_id = $1`,
      [courseId],
    );
  }

  async findBySlug(slug: string): Promise<CourseRow | null> {
    return this.queryOne<CourseRow>(
      pgPool,
      `SELECT * FROM courses WHERE slug = $1`,
      [slug],
    );
  }

  async create(params: {
    instructorId: number;
    categoryId: number;
    title: string;
    slug: string;
    description?: string | null;
    price: number;
    level?: CourseRow['level'];
    thumbnailUrl?: string | null;
    status?: CourseRow['status'];
  }): Promise<CourseRow> {
    const row = await this.queryOne<CourseRow>(
      pgPool,
      `INSERT INTO courses
        (instructor_id, category_id, title, slug, description, price, level, thumbnail_url, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        params.instructorId,
        params.categoryId,
        params.title,
        params.slug,
        params.description ?? null,
        params.price,
        params.level ?? null,
        params.thumbnailUrl ?? null,
        params.status ?? 'draft',
      ],
    );
    if (!row) this.notFound('Failed to create course');
    return row;
  }

  async update(courseId: number, instructorId: number, patch: {
    title?: string;
    description?: string | null;
    price?: number;
    categoryId?: number;
    level?: CourseRow['level'];
    thumbnailUrl?: string | null;
    status?: CourseRow['status'];
    slug?: string;
  }): Promise<CourseRow> {
    // Build dynamic update (parameterized)
    const sets: string[] = [];
    const values: unknown[] = [];
    let i = 1;

    const add = (sql: string, value: unknown) => {
      sets.push(`${sql} = $${i++}`);
      values.push(value);
    };

    if (patch.title !== undefined) add('title', patch.title);
    if (patch.slug !== undefined) add('slug', patch.slug);
    if (patch.description !== undefined) add('description', patch.description);
    if (patch.price !== undefined) add('price', patch.price);
    if (patch.categoryId !== undefined) add('category_id', patch.categoryId);
    if (patch.level !== undefined) add('level', patch.level);
    if (patch.thumbnailUrl !== undefined) add('thumbnail_url', patch.thumbnailUrl);
    if (patch.status !== undefined) add('status', patch.status);

    if (sets.length === 0) {
      const row = await this.findById(courseId);
      if (!row) this.notFound('Course not found');
      return row;
    }

    values.push(courseId, instructorId);

    const row = await this.queryOne<CourseRow>(
      pgPool,
      `UPDATE courses
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE course_id = $${i++} AND instructor_id = $${i}
       RETURNING *`,
      values,
    );

    if (!row) this.notFound('Course not found or not owned by instructor');
    return row;
  }
}

