import type { Budget, Transaction } from '../db/types'
import { getCurrentPeriodRange, type DateRange } from './budgetPeriod'

export function calculateSpent(transactions: Transaction[], categoryId: number, range: DateRange): number {
  return transactions
    .filter((t) => t.type === 'expense' && t.categoryId === categoryId && t.date >= range.from && t.date <= range.to)
    .reduce((sum, t) => sum + t.amountKopecks, 0)
}

export interface BudgetProgress {
  spentKopecks: number
  limitKopecks: number
  percentage: number
  isOverLimit: boolean
  overspendKopecks: number
}

export function calculateBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  referenceDate?: string,
): BudgetProgress {
  const range = getCurrentPeriodRange(budget.period, referenceDate)
  const spentKopecks = calculateSpent(transactions, budget.categoryId, range)
  const percentage = budget.limitKopecks > 0 ? Math.round((spentKopecks / budget.limitKopecks) * 100) : 0

  return {
    spentKopecks,
    limitKopecks: budget.limitKopecks,
    percentage,
    isOverLimit: spentKopecks > budget.limitKopecks,
    overspendKopecks: Math.max(0, spentKopecks - budget.limitKopecks),
  }
}
