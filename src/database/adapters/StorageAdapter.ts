export interface StorageAdapter {
  save<T extends { id: string }>(collection: string, item: Omit<T, 'id'> & { id?: string }): T
  find<T>(collection: string): T[]
  findById<T extends { id: string }>(collection: string, id: string): T | null
  update<T extends { id: string }>(collection: string, id: string, changes: Partial<Omit<T, 'id'>>): T | null
  delete(collection: string, id: string): boolean
  query<T>(collection: string, predicate: (item: T) => boolean): T[]
  replaceAll<T extends { id: string }>(collection: string, items: T[]): void
}
