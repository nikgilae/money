import type { RecurringFrequency, RecurringRule } from '../db/types'
import { parseIsoDate, formatIsoDate, lastDayOfMonth, todayIso } from './date'

/**
 * Дата + N периодов частоты. Считается от исходной даты (не итеративно от
 * предыдущего результата), чтобы не накапливать дрейф при зажиме конца
 * месяца — see getDueOccurrences.
 */
export function addPeriod(date: string, frequency: RecurringFrequency, count: number): string {
  const { year, month, day } = parseIsoDate(date)

  if (frequency === 'daily') {
    const d = new Date(Date.UTC(year, month - 1, day + count))
    return d.toISOString().slice(0, 10)
  }

  if (frequency === 'weekly') {
    const d = new Date(Date.UTC(year, month - 1, day + count * 7))
    return d.toISOString().slice(0, 10)
  }

  if (frequency === 'monthly') {
    const totalMonths = (month - 1) + count
    const targetYear = year + Math.floor(totalMonths / 12)
    const targetMonth = (((totalMonths % 12) + 12) % 12) + 1
    const clampedDay = Math.min(day, lastDayOfMonth(targetYear, targetMonth))
    return formatIsoDate(targetYear, targetMonth, clampedDay)
  }

  // yearly
  const targetYear = year + count
  const clampedDay = Math.min(day, lastDayOfMonth(targetYear, month))
  return formatIsoDate(targetYear, month, clampedDay)
}

export interface DueOccurrences {
  dueDates: string[]
  newNextDueDate: string
}

/**
 * Все даты правила, которые уже наступили (<= referenceDate), начиная с
 * текущего nextDueDate, плюс дата следующего будущего срабатывания.
 */
export function getDueOccurrences(rule: RecurringRule, referenceDate: string = todayIso()): DueOccurrences {
  const dueDates: string[] = []
  let cursor = rule.nextDueDate
  let k = 0

  while (cursor <= referenceDate) {
    dueDates.push(cursor)
    k += 1
    cursor = addPeriod(rule.nextDueDate, rule.frequency, k)
  }

  return { dueDates, newNextDueDate: cursor }
}
