import { db } from './db'
import type { Transaction } from './types'

export interface TransactionFilter {
  from?: string // ISO 8601, inclusive
  to?: string // ISO 8601, inclusive
  categoryId?: number
  accountId?: number
}

export interface CreateTransferInput {
  fromAccountId: number
  toAccountId: number
  amountKopecks: number
  date: string // ISO 8601
  note?: string
}

export function createTransaction(transaction: Omit<Transaction, 'id' | 'createdAt'>) {
  return db.transactions.add({ ...transaction, createdAt: new Date().toISOString() })
}

export function updateTransaction(id: number, changes: Partial<Omit<Transaction, 'id' | 'createdAt'>>) {
  return db.transactions.update(id, changes)
}

export function deleteTransaction(id: number) {
  return db.transactions.delete(id)
}

export function countTransactionsForCategory(categoryId: number) {
  return db.transactions.where('categoryId').equals(categoryId).count()
}

export function countTransactionsForAccount(accountId: number) {
  return db.transactions.where('accountId').equals(accountId).count()
}

export async function listTransactions(filter: TransactionFilter = {}): Promise<Transaction[]> {
  const { from, to, categoryId, accountId } = filter
  let transactions = await db.transactions.orderBy('date').reverse().toArray()

  if (from) {
    transactions = transactions.filter((t) => t.date >= from)
  }
  if (to) {
    transactions = transactions.filter((t) => t.date <= to)
  }
  if (categoryId !== undefined) {
    transactions = transactions.filter((t) => t.categoryId === categoryId)
  }
  if (accountId !== undefined) {
    transactions = transactions.filter((t) => t.accountId === accountId)
  }

  return transactions
}

/** Все ноги переводов — используется для сопоставления пар по transferPairId в UI. */
export function listTransferLegs(): Promise<Transaction[]> {
  return db.transactions.where('type').equals('transfer').toArray()
}

/**
 * Создаёт пару transfer-транзакций одним переводом: "исходящая" нога со
 * знаком минус на fromAccountId и "входящая" со знаком плюс на toAccountId.
 * Обе связаны transferPairId, равным id исходящей ноги.
 */
export async function createTransfer(input: CreateTransferInput): Promise<number> {
  const { fromAccountId, toAccountId, amountKopecks, date, note } = input
  const createdAt = new Date().toISOString()

  return db.transaction('rw', db.transactions, async (): Promise<number> => {
    const fromId = (await db.transactions.add({
      type: 'transfer',
      amountKopecks: -amountKopecks,
      accountId: fromAccountId,
      date,
      note,
      createdAt,
    })) as number
    await db.transactions.update(fromId, { transferPairId: fromId })
    await db.transactions.add({
      type: 'transfer',
      amountKopecks,
      accountId: toAccountId,
      date,
      note,
      transferPairId: fromId,
      createdAt,
    })
    return fromId
  })
}

export function deleteTransferPair(transferPairId: number) {
  return db.transactions.where('transferPairId').equals(transferPairId).delete()
}
