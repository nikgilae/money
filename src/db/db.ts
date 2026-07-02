import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, Budget, SavingsGoal } from './types'
import { defaultCategories } from './defaultCategories'

export const db = new Dexie('finance-app') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  budgets: EntityTable<Budget, 'id'>
  savingsGoals: EntityTable<SavingsGoal, 'id'>
}

db.version(1).stores({
  transactions: '++id, type, categoryId, date',
  categories: '++id, type',
})

db.version(2).stores({
  budgets: '++id, categoryId, period',
  savingsGoals: '++id',
})

db.on('populate', async () => {
  await db.categories.bulkAdd(defaultCategories)
})
