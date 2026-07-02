import { describe, expect, it } from 'vitest'
import { buildMonthlySeries } from './monthlySeries'
import type { Transaction } from '../db/types'

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    type: 'expense',
    amountKopecks: 0,
    categoryId: 1,
    date: '2026-07-15',
    createdAt: '2026-07-15T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildMonthlySeries', () => {
  it('возвращает monthsCount точек по возрастанию дат, заканчивая referenceMonth', () => {
    const series = buildMonthlySeries([], 3, '2026-07-15')
    expect(series.map((p) => p.monthDate)).toEqual(['2026-05-15', '2026-06-15', '2026-07-15'])
  })

  it('агрегирует доходы/расходы в правильный месяц', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 100000, date: '2026-05-10' }),
      tx({ type: 'expense', amountKopecks: 30000, date: '2026-06-10' }),
      tx({ type: 'expense', amountKopecks: 20000, date: '2026-07-10' }),
    ]
    const series = buildMonthlySeries(transactions, 3, '2026-07-15')

    expect(series).toEqual([
      { monthDate: '2026-05-15', label: 'май', incomeKopecks: 100000, expenseKopecks: 0 },
      { monthDate: '2026-06-15', label: 'июнь', incomeKopecks: 0, expenseKopecks: 30000 },
      { monthDate: '2026-07-15', label: 'июль', incomeKopecks: 0, expenseKopecks: 20000 },
    ])
  })

  it('месяцы без транзакций дают нули, а не пропуск точки', () => {
    const series = buildMonthlySeries([], 2, '2026-07-15')
    expect(series).toHaveLength(2)
    expect(series.every((p) => p.incomeKopecks === 0 && p.expenseKopecks === 0)).toBe(true)
  })

  it('переходит через границу года', () => {
    const series = buildMonthlySeries([], 3, '2026-01-15')
    expect(series.map((p) => p.monthDate)).toEqual(['2025-11-15', '2025-12-15', '2026-01-15'])
  })
})
