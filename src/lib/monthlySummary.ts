import type { Transaction } from '../db/types'
import { getCurrentPeriodRange } from './budgetPeriod'
import { addPeriod } from './recurringSchedule'
import { parseIsoDate } from './date'

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric', timeZone: 'UTC' })

export interface MonthlySummary {
  incomeKopecks: number
  expenseKopecks: number
  balanceKopecks: number
}

export function calculateMonthlySummary(transactions: Transaction[], monthDate: string): MonthlySummary {
  const range = getCurrentPeriodRange('monthly', monthDate)
  const inMonth = transactions.filter((t) => t.date >= range.from && t.date <= range.to)

  const incomeKopecks = inMonth
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amountKopecks, 0)
  const expenseKopecks = inMonth
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amountKopecks, 0)

  return { incomeKopecks, expenseKopecks, balanceKopecks: incomeKopecks - expenseKopecks }
}

/** Человекочитаемая подпись месяца, напр. "июль 2026". */
export function getMonthLabel(monthDate: string): string {
  const { year, month, day } = parseIsoDate(monthDate)
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, day)))
}

/** Сдвигает дату на delta месяцев (может быть отрицательным). */
export function shiftMonth(monthDate: string, delta: number): string {
  return addPeriod(monthDate, 'monthly', delta)
}
