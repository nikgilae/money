import Dexie, { type EntityTable } from 'dexie'
import type { Account, Transaction, Category, Budget, SavingsGoal, RecurringRule } from './types'
import { defaultCategories } from './defaultCategories'

export const DEFAULT_ACCOUNT_NAME = 'Основной'

export const db = new Dexie('finance-app') as Dexie & {
  accounts: EntityTable<Account, 'id'>
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
  // IndexedDB не поддерживает boolean как ключ индекса — active фильтруется в JS
  recurringRules: '++id, nextDueDate',
})

db.version(4)
  .stores({
    accounts: '++id',
    transactions: '++id, type, categoryId, date, accountId',
  })
  .upgrade(async (tx) => {
    const defaultAccountId = await tx.table('accounts').add({
      name: DEFAULT_ACCOUNT_NAME,
      initialBalanceKopecks: 0,
      createdAt: new Date().toISOString(),
    })

    await tx
      .table('transactions')
      .toCollection()
      .modify((transaction) => {
        transaction.accountId = defaultAccountId
      })

    await tx
      .table('recurringRules')
      .toCollection()
      .modify((rule) => {
        rule.accountId = defaultAccountId
      })
  })

db.on('populate', async () => {
  await db.categories.bulkAdd(defaultCategories)
  await db.accounts.add({
    name: DEFAULT_ACCOUNT_NAME,
    initialBalanceKopecks: 0,
    createdAt: new Date().toISOString(),
  })
})
