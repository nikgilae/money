import { describe, expect, it } from 'vitest'
import { calculateSpent, calculateBudgetProgress } from './budgetProgress'
import type { Budget, Transaction } from '../db/types'

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

function budget(overrides: Partial<Budget>): Budget {
  return {
    categoryId: 1,
    limitKopecks: 100000,
    period: 'monthly',
    startDate: '2026-01-01',
    ...overrides,
  }
}

describe('calculateSpent', () => {
  const range = { from: '2026-07-01', to: '2026-07-31' }

  it('суммирует только расходы указанной категории в диапазоне дат', () => {
    const transactions = [
      tx({ categoryId: 1, amountKopecks: 5000, date: '2026-07-10' }),
      tx({ categoryId: 1, amountKopecks: 3000, date: '2026-07-20' }),
      tx({ categoryId: 2, amountKopecks: 9000, date: '2026-07-10' }), // другая категория
      tx({ categoryId: 1, type: 'income', amountKopecks: 20000, date: '2026-07-10' }), // доход
      tx({ categoryId: 1, amountKopecks: 7000, date: '2026-06-30' }), // вне диапазона
      tx({ categoryId: 1, amountKopecks: 1000, date: '2026-08-01' }), // вне диапазона
    ]
    expect(calculateSpent(transactions, 1, range)).toBe(8000)
  })

  it('включает границы диапазона (inclusive)', () => {
    const transactions = [
      tx({ categoryId: 1, amountKopecks: 1000, date: '2026-07-01' }),
      tx({ categoryId: 1, amountKopecks: 2000, date: '2026-07-31' }),
    ]
    expect(calculateSpent(transactions, 1, range)).toBe(3000)
  })

  it('возвращает 0 для пустого списка', () => {
    expect(calculateSpent([], 1, range)).toBe(0)
  })

  it('исключает переводы между счетами', () => {
    const transactions = [
      tx({ type: 'transfer', categoryId: undefined, accountId: 1, amountKopecks: -5000, date: '2026-07-10' }),
      tx({ type: 'transfer', categoryId: undefined, accountId: 2, amountKopecks: 5000, date: '2026-07-10' }),
    ]
    expect(calculateSpent(transactions, 1, range)).toBe(0)
  })

  it('без accountId считает расходы по всем счетам (общий бюджет)', () => {
    const transactions = [
      tx({ categoryId: 1, accountId: 1, amountKopecks: 3000, date: '2026-07-10' }),
      tx({ categoryId: 1, accountId: 2, amountKopecks: 4000, date: '2026-07-10' }),
    ]
    expect(calculateSpent(transactions, 1, range)).toBe(7000)
  })

  it('с заданным accountId учитывает расходы только этого счёта', () => {
    const transactions = [
      tx({ categoryId: 1, accountId: 1, amountKopecks: 3000, date: '2026-07-10' }),
      tx({ categoryId: 1, accountId: 2, amountKopecks: 4000, date: '2026-07-10' }),
    ]
    expect(calculateSpent(transactions, 1, range, 1)).toBe(3000)
    expect(calculateSpent(transactions, 1, range, 2)).toBe(4000)
  })
})

describe('calculateBudgetProgress', () => {
  it('считает процент использования в пределах лимита', () => {
    const b = budget({ limitKopecks: 10000 })
    const transactions = [tx({ amountKopecks: 5000, date: '2026-07-15' })]
    const progress = calculateBudgetProgress(b, transactions, '2026-07-20')

    expect(progress).toEqual({
      spentKopecks: 5000,
      limitKopecks: 10000,
      percentage: 50,
      isOverLimit: false,
      overspendKopecks: 0,
    })
  })

  it('отмечает превышение лимита и считает overspend', () => {
    const b = budget({ limitKopecks: 10000 })
    const transactions = [tx({ amountKopecks: 15000, date: '2026-07-15' })]
    const progress = calculateBudgetProgress(b, transactions, '2026-07-20')

    expect(progress.isOverLimit).toBe(true)
    expect(progress.overspendKopecks).toBe(5000)
    expect(progress.percentage).toBe(150)
  })

  it('не учитывает транзакции вне текущего периода', () => {
    const b = budget({ limitKopecks: 10000, period: 'monthly' })
    const transactions = [tx({ amountKopecks: 5000, date: '2026-06-15' })]
    const progress = calculateBudgetProgress(b, transactions, '2026-07-20')

    expect(progress.spentKopecks).toBe(0)
  })

  it('не делит на ноль при нулевом лимите', () => {
    const b = budget({ limitKopecks: 0 })
    const transactions = [tx({ amountKopecks: 5000, date: '2026-07-15' })]
    const progress = calculateBudgetProgress(b, transactions, '2026-07-20')

    expect(progress.percentage).toBe(0)
    expect(progress.isOverLimit).toBe(true)
    expect(progress.overspendKopecks).toBe(5000)
  })

  it('возвращает 0% при отсутствии трат', () => {
    const b = budget({ limitKopecks: 10000 })
    const progress = calculateBudgetProgress(b, [], '2026-07-20')

    expect(progress.percentage).toBe(0)
    expect(progress.isOverLimit).toBe(false)
  })

  it('с привязкой к счёту учитывает расходы только этого счёта', () => {
    const b = budget({ limitKopecks: 10000, accountId: 1 })
    const transactions = [
      tx({ accountId: 1, amountKopecks: 4000, date: '2026-07-15' }),
      tx({ accountId: 2, amountKopecks: 9000, date: '2026-07-15' }), // другой счёт — не учитывается
    ]
    const progress = calculateBudgetProgress(b, transactions, '2026-07-20')

    expect(progress.spentKopecks).toBe(4000)
    expect(progress.isOverLimit).toBe(false)
  })

  it('без привязки к счёту (accountId не задан) суммирует расходы по всем счетам', () => {
    const b = budget({ limitKopecks: 10000 })
    const transactions = [
      tx({ accountId: 1, amountKopecks: 4000, date: '2026-07-15' }),
      tx({ accountId: 2, amountKopecks: 9000, date: '2026-07-15' }),
    ]
    const progress = calculateBudgetProgress(b, transactions, '2026-07-20')

    expect(progress.spentKopecks).toBe(13000)
    expect(progress.isOverLimit).toBe(true)
  })
})
