import type { Bill } from '../types'

const STORAGE_KEY = 'bookkeeping_bills'

export function loadBills(): Bill[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveBills(bills: Bill[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bills))
}

export function clearBills(): void {
  localStorage.removeItem(STORAGE_KEY)
}
