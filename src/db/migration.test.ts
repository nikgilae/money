import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Dexie from 'dexie'
import { db, DEFAULT_ACCOUNT_NAME } from './db'

const DB_NAME = 'finance-app'

async function seedLegacyDatabase() {
  const legacy = new Dexie(DB_NAME)
  legacy.version(1).stores({
    transactions: '++id, type, categoryId, date',
    categories: '++id, type',
  })
  legacy.version(2).stores({
    budgets: '++id, categoryId, period',
    savingsGoals: '++id',
  })
  legacy.version(3).stores({
    recurringRules: '++id, nextDueDate',
  })

  await legacy.open()
  await legacy.table('categories').add({ name: 'Еда', type: 'expense' })
  await legacy.table('transactions').bulkAdd([
    {
      type: 'expense',
      amountKopecks: 150000,
      categoryId: 1,
      date: '2026-01-05',
      createdAt: '2026-01-05T00:00:00.000Z',
    },
    {
      type: 'income',
      amountKopecks: 500000,
      categoryId: 1,
      date: '2026-01-10',
      createdAt: '2026-01-10T00:00:00.000Z',
    },
  ])
  await legacy.table('recurringRules').add({
    type: 'expense',
    amountKopecks: 99900,
    categoryId: 1,
    frequency: 'monthly',
    startDate: '2026-01-01',
    nextDueDate: '2026-02-01',
    active: true,
  })
  legacy.close()
}

beforeEach(async () => {
  if (db.isOpen()) db.close()
  await Dexie.delete(DB_NAME)
})

afterEach(async () => {
  if (db.isOpen()) db.close()
})

describe('миграция схемы на v4 (мультисчета)', () => {
  it('на существующих данных создаёт дефолтный счёт и проставляет accountId транзакциям и правилам', async () => {
    await seedLegacyDatabase()

    await db.open()

    const accounts = await db.accounts.toArray()
    expect(accounts).toHaveLength(1)
    expect(accounts[0].name).toBe(DEFAULT_ACCOUNT_NAME)
    expect(accounts[0].initialBalanceKopecks).toBe(0)

    const defaultAccountId = accounts[0].id!

    const transactions = await db.transactions.toArray()
    expect(transactions).toHaveLength(2)
    expect(transactions.every((t) => t.accountId === defaultAccountId)).toBe(true)
    // старые данные не потерялись при миграции
    expect(transactions.map((t) => t.amountKopecks).sort()).toEqual([150000, 500000])

    const rules = await db.recurringRules.toArray()
    expect(rules).toHaveLength(1)
    expect(rules[0].accountId).toBe(defaultAccountId)
  })

  it('на чистой установке (нет старых данных) тоже создаёт дефолтный счёт', async () => {
    await db.open()

    const accounts = await db.accounts.toArray()
    expect(accounts).toHaveLength(1)
    expect(accounts[0].name).toBe(DEFAULT_ACCOUNT_NAME)
  })
})
