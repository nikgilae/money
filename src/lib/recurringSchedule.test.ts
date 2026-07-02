import { describe, expect, it } from 'vitest'
import { addPeriod, getDueOccurrences } from './recurringSchedule'
import type { RecurringRule } from '../db/types'

describe('addPeriod', () => {
  it('daily: прибавляет N дней', () => {
    expect(addPeriod('2026-07-01', 'daily', 1)).toBe('2026-07-02')
    expect(addPeriod('2026-07-01', 'daily', 30)).toBe('2026-07-31')
  })

  it('daily: переходит через границу месяца', () => {
    expect(addPeriod('2026-07-31', 'daily', 1)).toBe('2026-08-01')
  })

  it('weekly: прибавляет N недель', () => {
    expect(addPeriod('2026-07-01', 'weekly', 1)).toBe('2026-07-08')
    expect(addPeriod('2026-07-01', 'weekly', 2)).toBe('2026-07-15')
  })

  it('monthly: прибавляет N месяцев, сохраняя день', () => {
    expect(addPeriod('2026-01-15', 'monthly', 1)).toBe('2026-02-15')
    expect(addPeriod('2026-01-15', 'monthly', 2)).toBe('2026-03-15')
  })

  it('monthly: переходит через границу года', () => {
    expect(addPeriod('2026-11-15', 'monthly', 2)).toBe('2027-01-15')
  })

  it('monthly: зажимает день 31 в коротком месяце', () => {
    expect(addPeriod('2026-01-31', 'monthly', 1)).toBe('2026-02-28')
  })

  it('monthly: зажимает день 31 в феврале високосного года', () => {
    expect(addPeriod('2028-01-31', 'monthly', 1)).toBe('2028-02-29')
  })

  it('monthly: не накапливает дрейф — считает от исходной даты, не от предыдущего результата', () => {
    // 31 января + 1 месяц = 28 февраля (зажато), но +2 месяца от 31 января — это 31 марта, не 28 марта
    expect(addPeriod('2026-01-31', 'monthly', 2)).toBe('2026-03-31')
  })

  it('yearly: прибавляет N лет', () => {
    expect(addPeriod('2026-07-15', 'yearly', 1)).toBe('2027-07-15')
  })

  it('yearly: зажимает 29 февраля в невисокосном году', () => {
    expect(addPeriod('2028-02-29', 'yearly', 1)).toBe('2029-02-28')
  })
})

function rule(overrides: Partial<RecurringRule>): RecurringRule {
  return {
    type: 'expense',
    amountKopecks: 50000,
    categoryId: 1,
    accountId: 1,
    frequency: 'monthly',
    startDate: '2026-01-15',
    nextDueDate: '2026-01-15',
    active: true,
    ...overrides,
  }
}

describe('getDueOccurrences', () => {
  it('не возвращает дат, если nextDueDate ещё не наступил', () => {
    const r = rule({ nextDueDate: '2026-08-01' })
    const result = getDueOccurrences(r, '2026-07-15')
    expect(result).toEqual({ dueDates: [], newNextDueDate: '2026-08-01' })
  })

  it('возвращает одну дату, если пропущен ровно один период', () => {
    const r = rule({ nextDueDate: '2026-07-15', frequency: 'monthly' })
    const result = getDueOccurrences(r, '2026-07-20')
    expect(result).toEqual({ dueDates: ['2026-07-15'], newNextDueDate: '2026-08-15' })
  })

  it('включает дату, равную referenceDate (inclusive)', () => {
    const r = rule({ nextDueDate: '2026-07-15', frequency: 'monthly' })
    const result = getDueOccurrences(r, '2026-07-15')
    expect(result.dueDates).toEqual(['2026-07-15'])
  })

  it('докатывает несколько пропущенных периодов подряд', () => {
    const r = rule({ nextDueDate: '2026-01-15', frequency: 'monthly' })
    const result = getDueOccurrences(r, '2026-04-20')
    expect(result).toEqual({
      dueDates: ['2026-01-15', '2026-02-15', '2026-03-15', '2026-04-15'],
      newNextDueDate: '2026-05-15',
    })
  })

  it('докатывает ежедневное правило', () => {
    const r = rule({ nextDueDate: '2026-07-01', frequency: 'daily' })
    const result = getDueOccurrences(r, '2026-07-04')
    expect(result.dueDates).toEqual(['2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04'])
    expect(result.newNextDueDate).toBe('2026-07-05')
  })

  it('использует сегодняшнюю дату по умолчанию', () => {
    const r = rule({ nextDueDate: '2000-01-01', frequency: 'yearly' })
    const result = getDueOccurrences(r)
    expect(result.dueDates.length).toBeGreaterThan(0)
  })
})
