import type { StorageAdapter } from '../adapters/StorageAdapter'
import type { UserProfile } from '../../types'

const COLLECTION = 'bk_users'
const PROFILE_KEY = 'default'

export class UserRepository {
  constructor(private adapter: StorageAdapter) {}

  saveProfile(profile: UserProfile): void {
    const existing = this.adapter.findById<UserProfile & { id: string }>(COLLECTION, PROFILE_KEY)
    if (existing) {
      this.adapter.update<UserProfile & { id: string }>(COLLECTION, PROFILE_KEY, profile)
    } else {
      this.adapter.save<UserProfile & { id: string }>(COLLECTION, { ...profile, id: PROFILE_KEY })
    }
  }

  getProfile(): UserProfile | null {
    const item = this.adapter.findById<UserProfile & { id: string }>(COLLECTION, PROFILE_KEY)
    if (!item) return null
    const { id, ...profile } = item
    return profile as UserProfile
  }

  clearProfile(): void {
    this.adapter.delete(COLLECTION, PROFILE_KEY)
  }
}
