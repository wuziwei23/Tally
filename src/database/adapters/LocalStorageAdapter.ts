import type { StorageAdapter } from './StorageAdapter'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

export class LocalStorageAdapter implements StorageAdapter {
  private read<T>(collection: string): T[] {
    try {
      const raw = localStorage.getItem(collection)
      if (!raw) return []
      const arr = JSON.parse(raw)
      return Array.isArray(arr) ? arr : []
    } catch {
      return []
    }
  }

  private write<T>(collection: string, items: T[]): void {
    localStorage.setItem(collection, JSON.stringify(items))
  }

  save<T extends { id: string }>(collection: string, item: Omit<T, 'id'> & { id?: string }): T {
    const items = this.read<T>(collection)
    const newItem = { ...item, id: item.id ?? generateId() } as T
    items.unshift(newItem)
    this.write(collection, items)
    return newItem
  }

  find<T>(collection: string): T[] {
    return this.read<T>(collection)
  }

  findById<T extends { id: string }>(collection: string, id: string): T | null {
    const items = this.read<T>(collection)
    return items.find((item) => item.id === id) ?? null
  }

  update<T extends { id: string }>(collection: string, id: string, changes: Partial<Omit<T, 'id'>>): T | null {
    const items = this.read<T>(collection)
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...changes }
    this.write(collection, items)
    return items[index]
  }

  delete(collection: string, id: string): boolean {
    const items = this.read(collection)
    const filtered = items.filter((item: { id: string }) => item.id !== id)
    if (filtered.length === items.length) return false
    this.write(collection, filtered)
    return true
  }

  query<T>(collection: string, predicate: (item: T) => boolean): T[] {
    return this.read<T>(collection).filter(predicate)
  }

  replaceAll<T extends { id: string }>(collection: string, items: T[]): void {
    this.write(collection, items)
  }
}
