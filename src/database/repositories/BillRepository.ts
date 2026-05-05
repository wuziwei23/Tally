import type { StorageAdapter } from '../adapters/StorageAdapter'
import type { Bill, BillType } from '../../types'

const COLLECTION = 'bk_bills'

export class BillRepository {
  constructor(private adapter: StorageAdapter) {}

  saveBill(input: Omit<Bill, 'id'>): Bill {
    return this.adapter.save<Bill>(COLLECTION, input)
  }

  findAll(): Bill[] {
    return this.adapter.find<Bill>(COLLECTION)
  }

  findById(id: string): Bill | null {
    return this.adapter.findById<Bill>(COLLECTION, id)
  }

  updateBill(id: string, changes: Partial<Omit<Bill, 'id'>>): Bill | null {
    return this.adapter.update<Bill>(COLLECTION, id, changes)
  }

  deleteBill(id: string): boolean {
    return this.adapter.delete(COLLECTION, id)
  }

  queryByDateRange(start: string, end: string): Bill[] {
    return this.adapter.query<Bill>(COLLECTION, (b) => b.date >= start && b.date <= end)
  }

  queryByType(type: BillType): Bill[] {
    return this.adapter.query<Bill>(COLLECTION, (b) => b.type === type)
  }

  queryByCategory(categoryId: string): Bill[] {
    return this.adapter.query<Bill>(COLLECTION, (b) => b.categoryId === categoryId)
  }

  replaceAll(bills: Bill[]): void {
    this.adapter.replaceAll(COLLECTION, bills)
  }
}
