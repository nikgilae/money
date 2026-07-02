import Dexie, { type EntityTable } from 'dexie'
import type { Transaction, Category, Budget, SavingsGoal, RecurringRule } from './types'
import { defaultCategories } from './defaultCategories'

export const db = new Dexie('finance-app') as Dexie & {
  transactions: EntityTable<Transaction, 'id'>
  categories: EntityTable<Category, 'id'>
  budgets: EntityTable<Budget, 'id'>
  savingsGoals: EntityTable<SavingsGoal, 'id'>
  recurringRules: EntityTable<RecurringRule, 'id'>
}

db.version(1).stores({
  transactions: '++id, type, categoryId, date',
  categories: '++id, type',
})

db.version(2).stores({
  budgets: '++id, categoryId, period',
  savingsGoals: '++id',
})

db.version(3).stores({
  recurringRules: '++id, active, nextDueDate',
})

db.on('populate', async () => {
  await db.categories.bulkAdd(defaultCategories)
})
