import type { StorageAdapter } from '../adapters/StorageAdapter'
import type { Budget } from '../../types'

const COLLECTION = 'bk_budgets'

export class BudgetRepository {
  constructor(private adapter: StorageAdapter) {}

  saveBudget(input: Omit<Budget, 'id'>): Budget {
    return this.adapter.save<Budget>(COLLECTION, input)
  }

  findAll(): Budget[] {
    return this.adapter.find<Budget>(COLLECTION)
  }

  findById(id: string): Budget | null {
    return this.adapter.findById<Budget>(COLLECTION, id)
  }

  updateBudget(id: string, changes: Partial<Omit<Budget, 'id'>>): Budget | null {
    return this.adapter.update<Budget>(COLLECTION, id, changes)
  }

  deleteBudget(id: string): boolean {
    return this.adapter.delete(COLLECTION, id)
  }
}
