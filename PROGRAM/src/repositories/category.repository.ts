import { pgPool } from '../config/db';
import { BaseRepository } from './base.repository';

export type CategoryRow = {
  category_id: number;
  name: string;
  slug: string;
};

export class CategoryRepository extends BaseRepository {
  async findById(categoryId: number): Promise<CategoryRow | null> {
    return this.queryOne<CategoryRow>(
      pgPool,
      `SELECT category_id, name, slug
       FROM categories
       WHERE category_id = $1`,
      [categoryId],
    );
  }
}

