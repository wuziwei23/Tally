import { LocalStorageAdapter } from './adapters/LocalStorageAdapter'
import { BillRepository } from './repositories/BillRepository'
import { CategoryRepository } from './repositories/CategoryRepository'
import { UserRepository } from './repositories/UserRepository'
import { BudgetRepository } from './repositories/BudgetRepository'
import type { Bill, Category, UserProfile } from '../types'

const adapter = new LocalStorageAdapter()

export const billRepo = new BillRepository(adapter)
export const categoryRepo = new CategoryRepository(adapter)
export const userRepo = new UserRepository(adapter)
export const budgetRepo = new BudgetRepository(adapter)

// ── One-time migration from old localStorage keys ──────
function migrate(): void {
  // Migrate bills: old Zustand persist key → bk_bills
  const oldBillsRaw = localStorage.getItem('vibe-ledger-storage')
  if (oldBillsRaw) {
    try {
      const parsed = JSON.parse(oldBillsRaw)
      const bills: Bill[] = parsed?.state?.bills
      if (Array.isArray(bills) && bills.length > 0 && billRepo.findAll().length === 0) {
        billRepo.replaceAll(bills)
        if (billRepo.findAll().length === 0) {
          localStorage.setItem('vibe-ledger-storage', oldBillsRaw)
        }
      }
    } catch { /* ignore */ }
    localStorage.removeItem('vibe-ledger-storage')
  }

  // Migrate custom categories → bk_categories
  const oldCatsRaw = localStorage.getItem('custom_categories')
  if (oldCatsRaw) {
    try {
      const cats: Category[] = JSON.parse(oldCatsRaw)
      if (Array.isArray(cats) && cats.length > 0 && categoryRepo.findAll().length === 0) {
        categoryRepo.replaceAll(cats)
        if (categoryRepo.findAll().length === 0) {
          localStorage.setItem('custom_categories', oldCatsRaw)
        }
      }
    } catch { /* ignore */ }
    localStorage.removeItem('custom_categories')
  }

  // Migrate user profile → bk_users
  const oldProfileRaw = localStorage.getItem('userProfile')
  if (oldProfileRaw) {
    try {
      const profile: UserProfile = JSON.parse(oldProfileRaw)
      if (profile && userRepo.getProfile() === null) {
        userRepo.saveProfile(profile)
        if (userRepo.getProfile() === null) {
          localStorage.setItem('userProfile', oldProfileRaw)
        }
      }
    } catch { /* ignore */ }
    localStorage.removeItem('userProfile')
  }

  // Clean up other dead keys
  localStorage.removeItem('bookkeeping_bills')
  localStorage.removeItem('bk_transactions')
  localStorage.removeItem('bk_current_user')
}

migrate()
