import { create } from 'zustand'
import type { Bill, CategoryStat } from '../types'
import { loadBills, saveBills } from '../services/storage'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10)
}

function isSameMonth(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7)
}

interface BillState {
  bills: Bill[]
  hydrated: boolean

  // actions
  addBill: (bill: Omit<Bill, 'id'>) => Bill
  deleteBill: (id: string) => void
  updateBill: (id: string, changes: Partial<Omit<Bill, 'id'>>) => void
  getBills: () => Bill[]

  // internal
  hydrate: () => void
}

export const useBillStore = create<BillState>((set, get) => ({
  bills: [],
  hydrated: false,

  hydrate: () => {
    const bills = loadBills()
    set({ bills, hydrated: true })
  },

  addBill: (input) => {
    const bill: Bill = { ...input, id: generateId() }
    const bills = [bill, ...get().bills]
    set({ bills })
    saveBills(bills)
    return bill
  },

  deleteBill: (id) => {
    const bills = get().bills.filter((b) => b.id !== id)
    set({ bills })
    saveBills(bills)
  },

  updateBill: (id, changes) => {
    const bills = get().bills.map((b) =>
      b.id === id ? { ...b, ...changes } : b
    )
    set({ bills })
    saveBills(bills)
  },

  getBills: () => get().bills,
}))

// ── Selectors ──────────────────────────────────────────

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`
}

export function selectTodayExpense(state: BillState): number {
  const today = todayISO()
  return state.bills
    .filter((b) => b.type === 'expense' && isSameDay(b.createdAt, today))
    .reduce((sum, b) => sum + b.amount, 0)
}

export function selectMonthExpense(state: BillState): number {
  const now = todayISO()
  return state.bills
    .filter((b) => b.type === 'expense' && isSameMonth(b.createdAt, now))
    .reduce((sum, b) => sum + b.amount, 0)
}

export function selectMonthIncome(state: BillState): number {
  const now = todayISO()
  return state.bills
    .filter((b) => b.type === 'income' && isSameMonth(b.createdAt, now))
    .reduce((sum, b) => sum + b.amount, 0)
}

export function selectCategoryStats(state: BillState): CategoryStat[] {
  const now = todayISO()
  const monthBills = state.bills.filter((b) => isSameMonth(b.createdAt, now))

  const map = new Map<string, { total: number; count: number }>()
  let grandTotal = 0

  for (const b of monthBills) {
    const entry = map.get(b.categoryId) ?? { total: 0, count: 0 }
    entry.total += b.amount
    entry.count += 1
    map.set(b.categoryId, entry)
    grandTotal += b.amount
  }

  const stats: CategoryStat[] = []
  for (const [categoryId, { total, count }] of map) {
    stats.push({
      categoryId,
      total,
      count,
      percentage: grandTotal > 0 ? (total / grandTotal) * 100 : 0,
    })
  }

  return stats.sort((a, b) => b.total - a.total)
}
