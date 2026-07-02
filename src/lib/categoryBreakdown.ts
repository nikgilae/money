import type { Category, Transaction } from '../db/types'
import type { DateRange } from './budgetPeriod'

const DEFAULT_COLOR = '#94a3b8'

export interface CategoryBreakdownEntry {
  categoryId: number
  name: string
  color: string
  amountKopecks: number
}

/** Расходы за период, сгруппированные по категории, по убыванию суммы. */
export function expensesByCategory(
  transactions: Transaction[],
  range: DateRange,
  categories: Category[],
): CategoryBreakdownEntry[] {
  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const totals = new Map<number, number>()

  for (const t of transactions) {
    if (t.type !== 'expense' || t.date < range.from || t.date > range.to) continue
    // categoryId обязателен для expense — необязателен он только у transfer, отфильтрованных выше
    const categoryId = t.categoryId!
    totals.set(categoryId, (totals.get(categoryId) ?? 0) + t.amountKopecks)
  }

  return [...totals.entries()]
    .map(([categoryId, amountKopecks]) => {
      const category = categoryById.get(categoryId)
      return {
        categoryId,
        name: category?.name ?? 'Без категории',
        color: category?.color ?? DEFAULT_COLOR,
        amountKopecks,
      }
    })
    .sort((a, b) => b.amountKopecks - a.amountKopecks)
}
