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

export interface UserProfile {
  nickname: string
  avatarColor: string
  avatarImage: string | null
  loginType: 'wechat' | 'phone' | 'guest'
}

export interface Budget {
  id: string
  categoryId: string
  amount: number
  period: 'month' | 'year'
}
