import type { Transaction } from '../db/types'

export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, t) => {
    return t.type === 'income' ? balance + t.amountKopecks : balance - t.amountKopecks
  }, 0)
}

export function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amountKopecks, 0)
}
