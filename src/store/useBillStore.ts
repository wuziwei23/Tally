import { create } from 'zustand'
import type { Bill, CategoryStat } from '../types'
import { generateSampleTransactions } from '../data/sampleData'
import { billRepo } from '../database'

export type AnalyticsMode = 'month' | 'quarter' | 'year'

export interface AnalyticsFilter {
  mode: AnalyticsMode
  year: number
  month?: number
  quarter?: number
}

interface BillState {
  bills: Bill[]
  hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
  analyticsFilter: AnalyticsFilter
  setAnalyticsFilter: (f: Partial<AnalyticsFilter>) => void

  addBill: (bill: Omit<Bill, 'id'>) => Bill
  deleteBill: (id: string) => void
  updateBill: (id: string, changes: Partial<Omit<Bill, 'id'>>) => void
  getBills: () => Bill[]
  hydrate: () => void
}

function loadInitialBills(): Bill[] {
  const stored = billRepo.findAll()
  if (stored.length > 0) return stored
  const sample = generateSampleTransactions() as Bill[]
  billRepo.replaceAll(sample)
  return sample
}

export const useBillStore = create<BillState>()((set, get) => ({
  bills: [],
  hasHydrated: false,
  setHasHydrated: (v) => set({ hasHydrated: v }),
  analyticsFilter: {
    mode: 'month' as AnalyticsMode,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  },
  setAnalyticsFilter: (f: Partial<AnalyticsFilter>) =>
    set({ analyticsFilter: { ...get().analyticsFilter, ...f } }),

  hydrate: () => {
    const bills = loadInitialBills()
    set({ bills, hasHydrated: true })
  },

  addBill: (input) => {
    const bill = billRepo.saveBill(input)
    set({ bills: [bill, ...get().bills] })
    return bill
  },

  deleteBill: (id) => {
    billRepo.deleteBill(id)
    set({ bills: get().bills.filter((b) => b.id !== id) })
  },

  updateBill: (id, changes) => {
    billRepo.updateBill(id, changes)
    set({
      bills: get().bills.map((b) =>
        b.id === id ? { ...b, ...changes } : b
      ),
    })
  },

  getBills: () => get().bills,
}))

// ── Selectors ──────────────────────────────────────────

function todayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function selectTodayExpense(state: BillState): number {
  const today = todayISO()
  return state.bills
    .filter((b) => b.type === 'expense' && b.date === today)
    .reduce((sum, b) => sum + b.amount, 0)
}

export function selectMonthExpense(state: BillState): number {
  const month = todayISO().slice(0, 7)
  return state.bills
    .filter((b) => b.type === 'expense' && b.date.startsWith(month))
    .reduce((sum, b) => sum + b.amount, 0)
}

export function selectMonthIncome(state: BillState): number {
  const month = todayISO().slice(0, 7)
  return state.bills
    .filter((b) => b.type === 'income' && b.date.startsWith(month))
    .reduce((sum, b) => sum + b.amount, 0)
}

export function selectCategoryStats(state: BillState): CategoryStat[] {
  const month = todayISO().slice(0, 7)
  const monthBills = state.bills.filter((b) => b.date.startsWith(month))

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
