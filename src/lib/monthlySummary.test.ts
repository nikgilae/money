import { describe, expect, it } from 'vitest'
import { calculateMonthlySummary, getMonthLabel, shiftMonth } from './monthlySummary'
import type { Transaction } from '../db/types'

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    type: 'expense',
    amountKopecks: 0,
    accountId: 1,
    categoryId: 1,
    date: '2026-07-15',
    createdAt: '2026-07-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateMonthlySummary', () => {
  it('считает доходы, расходы и баланс за месяц', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 100000, date: '2026-07-01' }),
      tx({ type: 'expense', amountKopecks: 30000, date: '2026-07-15' }),
      tx({ type: 'expense', amountKopecks: 20000, date: '2026-07-31' }),
    ]
    expect(calculateMonthlySummary(transactions, '2026-07-10')).toEqual({
      incomeKopecks: 100000,
      expenseKopecks: 50000,
      balanceKopecks: 50000,
    })
  })

  it('не учитывает транзакции соседних месяцев', () => {
    const transactions = [
      tx({ type: 'expense', amountKopecks: 10000, date: '2026-06-30' }),
      tx({ type: 'expense', amountKopecks: 20000, date: '2026-08-01' }),
    ]
    expect(calculateMonthlySummary(transactions, '2026-07-15')).toEqual({
      incomeKopecks: 0,
      expenseKopecks: 0,
      balanceKopecks: 0,
    })
  })

  it('возвращает нули для пустого списка', () => {
    expect(calculateMonthlySummary([], '2026-07-15')).toEqual({
      incomeKopecks: 0,
      expenseKopecks: 0,
      balanceKopecks: 0,
    })
  })

  it('может уходить в отрицательный баланс', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 1000, date: '2026-07-01' }),
      tx({ type: 'expense', amountKopecks: 5000, date: '2026-07-02' }),
    ]
    expect(calculateMonthlySummary(transactions, '2026-07-15').balanceKopecks).toBe(-4000)
  })

  it('исключает переводы между счетами из доходов и расходов', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 100000, date: '2026-07-01' }),
      tx({ type: 'transfer', categoryId: undefined, accountId: 1, amountKopecks: -30000, date: '2026-07-05' }),
      tx({ type: 'transfer', categoryId: undefined, accountId: 2, amountKopecks: 30000, date: '2026-07-05' }),
    ]
    expect(calculateMonthlySummary(transactions, '2026-07-15')).toEqual({
      incomeKopecks: 100000,
      expenseKopecks: 0,
      balanceKopecks: 100000,
    })
  })
})

describe('getMonthLabel', () => {
  it('форматирует месяц по-русски', () => {
    expect(getMonthLabel('2026-07-15')).toBe('июль 2026 г.')
  })
})

describe('shiftMonth', () => {
  it('сдвигает вперёд', () => {
    expect(shiftMonth('2026-07-15', 1)).toBe('2026-08-15')
  })

  it('сдвигает назад', () => {
    expect(shiftMonth('2026-07-15', -1)).toBe('2026-06-15')
  })

  it('переходит через границу года назад', () => {
    expect(shiftMonth('2026-01-15', -1)).toBe('2025-12-15')
  })

  it('зажимает день 31 при переходе в короткий месяц', () => {
    expect(shiftMonth('2026-01-31', 1)).toBe('2026-02-28')
  })
})
