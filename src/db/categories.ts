import { db } from './db'
import type { Category, TransactionType } from './types'

export function createCategory(category: Omit<Category, 'id'>) {
  return db.categories.add(category)
}

export function updateCategory(id: number, changes: Partial<Omit<Category, 'id'>>) {
  return db.categories.update(id, changes)
}

export function deleteCategory(id: number) {
  return db.categories.delete(id)
}

export function listCategories(type?: TransactionType) {
  if (type) {
    return db.categories.where('type').equals(type).toArray()
  }
  return db.categories.toArray()
}
