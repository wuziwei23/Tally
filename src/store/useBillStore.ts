import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Bill, CategoryStat } from '../types'
import { generateSampleTransactions } from '../data/sampleData'

export type AnalyticsMode = 'month' | 'quarter' | 'year'

export interface AnalyticsFilter {
  mode: AnalyticsMode
  year: number
  month?: number
  quarter?: number
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
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
}

export const useBillStore = create<BillState>()(
  persist(
    (set, get) => ({
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

      addBill: (input) => {
        const bill: Bill = { ...input, id: generateId() }
        const bills = [bill, ...get().bills]
        set({ bills })
        return bill
      },

      deleteBill: (id) => {
        set({ bills: get().bills.filter((b) => b.id !== id) })
      },

      updateBill: (id, changes) => {
        set({
          bills: get().bills.map((b) =>
            b.id === id ? { ...b, ...changes } : b
          ),
        })
      },

      getBills: () => get().bills,
    }),
    {
      name: 'vibe-ledger-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.bills.length === 0) {
            state.bills = generateSampleTransactions() as Bill[]
          }
          state.setHasHydrated(true)
        }
      },
    }
  )
)

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
