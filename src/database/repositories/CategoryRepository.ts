import type { StorageAdapter } from '../adapters/StorageAdapter'
import type { Category } from '../../types'

const COLLECTION = 'bk_categories'

export class CategoryRepository {
  constructor(private adapter: StorageAdapter) {}

  saveCategory(input: Omit<Category, 'id'> & { id?: string }): Category {
    return this.adapter.save<Category>(COLLECTION, input)
  }

  findAll(): Category[] {
    return this.adapter.find<Category>(COLLECTION)
  }

  findById(id: string): Category | null {
    return this.adapter.findById<Category>(COLLECTION, id)
  }

  deleteCategory(id: string): boolean {
    return this.adapter.delete(COLLECTION, id)
  }

  replaceAll(categories: Category[]): void {
    this.adapter.replaceAll(COLLECTION, categories)
  }
}
