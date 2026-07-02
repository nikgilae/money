import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category } from './types'
import { defaultCategories } from './defaultCategories'

export const db = new Dexie('finance-app') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
}

db.version(1).stores({
  transactions: '++id, type, categoryId, date',
  categories: '++id, type',
})

db.on('populate', async () => {
  await db.categories.bulkAdd(defaultCategories)
})
