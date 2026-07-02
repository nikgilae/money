import { describe, expect, it } from 'vitest'
import { calculateBalance, sumByType } from './balance'
import type { Transaction } from '../db/types'

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    type: 'expense',
    amountKopecks: 0,
    categoryId: 1,
    date: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateBalance', () => {
  it('возвращает 0 для пустого списка', () => {
    expect(calculateBalance([])).toBe(0)
  })

  it('суммирует только доходы', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 10000 }),
      tx({ type: 'income', amountKopecks: 5000 }),
    ]
    expect(calculateBalance(transactions)).toBe(15000)
  })

  it('вычитает только расходы', () => {
    const transactions = [
      tx({ type: 'expense', amountKopecks: 3000 }),
      tx({ type: 'expense', amountKopecks: 2000 }),
    ]
    expect(calculateBalance(transactions)).toBe(-5000)
  })

  it('корректно считает смешанный список доходов и расходов', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 100000 }),
      tx({ type: 'expense', amountKopecks: 30000 }),
      tx({ type: 'expense', amountKopecks: 15000 }),
      tx({ type: 'income', amountKopecks: 5000 }),
    ]
    expect(calculateBalance(transactions)).toBe(60000)
  })

  it('может уходить в отрицательный баланс', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 1000 }),
      tx({ type: 'expense', amountKopecks: 5000 }),
    ]
    expect(calculateBalance(transactions)).toBe(-4000)
  })
})

describe('sumByType', () => {
  it('суммирует только транзакции указанного типа', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 10000 }),
      tx({ type: 'expense', amountKopecks: 4000 }),
      tx({ type: 'income', amountKopecks: 2000 }),
    ]
    expect(sumByType(transactions, 'income')).toBe(12000)
    expect(sumByType(transactions, 'expense')).toBe(4000)
  })

  it('возвращает 0, если транзакций такого типа нет', () => {
    const transactions = [tx({ type: 'income', amountKopecks: 10000 })]
    expect(sumByType(transactions, 'expense')).toBe(0)
  })
})
