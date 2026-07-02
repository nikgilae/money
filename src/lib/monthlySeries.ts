import type { Transaction } from '../db/types'
import { calculateMonthlySummary, getShortMonthLabel, shiftMonth } from './monthlySummary'

export interface MonthlySeriesPoint {
  monthDate: string
  label: string
  incomeKopecks: number
  expenseKopecks: number
}

/**
 * Один агрегат на каждый из последних monthsCount месяцев, включая
 * referenceMonth, по возрастанию дат.
 */
export function buildMonthlySeries(
  transactions: Transaction[],
  monthsCount: number,
  referenceMonth: string,
): MonthlySeriesPoint[] {
  const points: MonthlySeriesPoint[] = []

  for (let i = monthsCount - 1; i >= 0; i -= 1) {
    const monthDate = shiftMonth(referenceMonth, -i)
    const summary = calculateMonthlySummary(transactions, monthDate)
    points.push({
      monthDate,
      label: getShortMonthLabel(monthDate),
      incomeKopecks: summary.incomeKopecks,
      expenseKopecks: summary.expenseKopecks,
    })
  }

  return points
}
