import { useEffect, useMemo } from 'react'
import {
  useBillStore,
  selectTodayExpense,
  selectMonthExpense,
  selectMonthIncome,
  selectCategoryStats,
} from '../store/useBillStore'
import type { Bill, CategoryStat } from '../types'

// ── Hydration hook ────────────────────────────────────
export function useHydrateStore(): boolean {
  const hydrate = useBillStore((s) => s.hydrate)
  const hydrated = useBillStore((s) => s.hydrated)

  useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  return hydrated
}

// ── Bills list ────────────────────────────────────────
export function useBills(): Bill[] {
  return useBillStore((s) => s.bills)
}

// ── Actions ───────────────────────────────────────────
export function useBillActions() {
  const addBill = useBillStore((s) => s.addBill)
  const deleteBill = useBillStore((s) => s.deleteBill)
  const updateBill = useBillStore((s) => s.updateBill)
  const getBills = useBillStore((s) => s.getBills)

  return useMemo(
    () => ({ addBill, deleteBill, updateBill, getBills }),
    [addBill, deleteBill, updateBill, getBills]
  )
}

// ── Selectors ─────────────────────────────────────────
export function useTodayExpense(): number {
  return useBillStore(selectTodayExpense)
}

export function useMonthExpense(): number {
  return useBillStore(selectMonthExpense)
}

export function useMonthIncome(): number {
  return useBillStore(selectMonthIncome)
}

export function useCategoryStats(): CategoryStat[] {
  return useBillStore(selectCategoryStats)
}
