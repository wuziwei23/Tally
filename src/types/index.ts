export type BillType = 'expense' | 'income'

export interface Bill {
  id: string
  type: BillType
  amount: number
  categoryId: string
  date: string
  note?: string
  createdAt: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: BillType
}

export interface CategoryStat {
  categoryId: string
  total: number
  count: number
  percentage: number
}
