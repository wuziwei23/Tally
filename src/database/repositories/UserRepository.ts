import type { StorageAdapter } from '../adapters/StorageAdapter'
import type { UserProfile } from '../../types'

const COLLECTION = 'bk_users'

export class UserRepository {
  constructor(private adapter: StorageAdapter) {}

  saveProfile(profile: UserProfile): void {
    localStorage.setItem(COLLECTION, JSON.stringify(profile))
  }

  getProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(COLLECTION)
      if (raw) return JSON.parse(raw)
    } catch { /* ignore */ }
    return null
  }

  clearProfile(): void {
    localStorage.removeItem(COLLECTION)
  }
}
