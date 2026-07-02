import type { BudgetPeriod } from '../db/types'
import { todayIso } from './date'

export interface DateRange {
  from: string // ISO 8601 date, inclusive
  to: string // ISO 8601 date, inclusive
}

function parseIsoDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

function formatIsoDate(year: number, month: number, day: number): string {
  const y = year.toString().padStart(4, '0')
  const m = month.toString().padStart(2, '0')
  const d = day.toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Возвращает границы текущего календарного периода (не зависит от startDate
 * бюджета — только от типа периода и опорной даты).
 */
export function getCurrentPeriodRange(period: BudgetPeriod, referenceDate: string = todayIso()): DateRange {
  const { year, month, day } = parseIsoDate(referenceDate)

  if (period === 'monthly') {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
    return { from: formatIsoDate(year, month, 1), to: formatIsoDate(year, month, lastDay) }
  }

  if (period === 'yearly') {
    return { from: formatIsoDate(year, 1, 1), to: formatIsoDate(year, 12, 31) }
  }

  // weekly: понедельник-воскресенье недели, содержащей referenceDate
  const reference = new Date(Date.UTC(year, month - 1, day))
  const jsDay = reference.getUTCDay() // 0 = воскресенье
  const isoDay = jsDay === 0 ? 7 : jsDay // 1 = понедельник .. 7 = воскресенье

  const monday = new Date(reference)
  monday.setUTCDate(reference.getUTCDate() - (isoDay - 1))
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  return { from: monday.toISOString().slice(0, 10), to: sunday.toISOString().slice(0, 10) }
}
