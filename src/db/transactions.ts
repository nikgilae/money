import { db } from './db'
import type { Transaction } from './types'

export interface TransactionFilter {
  from?: string // ISO 8601, inclusive
  to?: string // ISO 8601, inclusive
  categoryId?: number
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

export async function listTransactions(filter: TransactionFilter = {}): Promise<Transaction[]> {
  const { from, to, categoryId } = filter
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

  return transactions
}
