import { describe, expect, it } from 'vitest'
import { expensesByCategory } from './categoryBreakdown'
import type { Category, Transaction } from '../db/types'

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

const range = { from: '2026-07-01', to: '2026-07-31' }
const categories: Category[] = [
  { id: 1, name: 'Продукты', type: 'expense', color: '#f97316' },
  { id: 2, name: 'Транспорт', type: 'expense', color: '#3b82f6' },
]

describe('expensesByCategory', () => {
  it('группирует расходы по категории и суммирует', () => {
    const transactions = [
      tx({ categoryId: 1, amountKopecks: 3000, date: '2026-07-05' }),
      tx({ categoryId: 1, amountKopecks: 2000, date: '2026-07-10' }),
      tx({ categoryId: 2, amountKopecks: 1000, date: '2026-07-15' }),
    ]
    expect(expensesByCategory(transactions, range, categories)).toEqual([
      { categoryId: 1, name: 'Продукты', color: '#f97316', amountKopecks: 5000 },
      { categoryId: 2, name: 'Транспорт', color: '#3b82f6', amountKopecks: 1000 },
    ])
  })

  it('сортирует по убыванию суммы', () => {
    const transactions = [
      tx({ categoryId: 1, amountKopecks: 1000, date: '2026-07-05' }),
      tx({ categoryId: 2, amountKopecks: 9000, date: '2026-07-05' }),
    ]
    const result = expensesByCategory(transactions, range, categories)
    expect(result[0].categoryId).toBe(2)
    expect(result[1].categoryId).toBe(1)
  })

  it('исключает доходы', () => {
    const transactions = [tx({ type: 'income', categoryId: 1, amountKopecks: 5000, date: '2026-07-05' })]
    expect(expensesByCategory(transactions, range, categories)).toEqual([])
  })

  it('исключает переводы между счетами', () => {
    const transactions = [
      tx({ type: 'transfer', categoryId: undefined, accountId: 1, amountKopecks: -5000, date: '2026-07-05' }),
      tx({ type: 'transfer', categoryId: undefined, accountId: 2, amountKopecks: 5000, date: '2026-07-05' }),
    ]
    expect(expensesByCategory(transactions, range, categories)).toEqual([])
  })

  it('исключает транзакции вне диапазона', () => {
    const transactions = [tx({ categoryId: 1, amountKopecks: 5000, date: '2026-06-30' })]
    expect(expensesByCategory(transactions, range, categories)).toEqual([])
  })

  it('использует дефолтный цвет и имя для несуществующей категории', () => {
    const transactions = [tx({ categoryId: 999, amountKopecks: 1000, date: '2026-07-05' })]
    const result = expensesByCategory(transactions, range, categories)
    expect(result).toEqual([{ categoryId: 999, name: 'Без категории', color: '#94a3b8', amountKopecks: 1000 }])
  })

  it('возвращает пустой массив для пустого списка транзакций', () => {
    expect(expensesByCategory([], range, categories)).toEqual([])
  })
})
