import { db } from './db'
import type { RecurringRule } from './types'
import { getDueOccurrences } from '../lib/recurringSchedule'
import { createTransaction } from './transactions'
import { todayIso } from '../lib/date'

export function createRecurringRule(rule: Omit<RecurringRule, 'id' | 'nextDueDate'>) {
  return db.recurringRules.add({ ...rule, nextDueDate: rule.startDate })
}

export function updateRecurringRule(id: number, changes: Partial<Omit<RecurringRule, 'id'>>) {
  return db.recurringRules.update(id, changes)
}

export function deleteRecurringRule(id: number) {
  return db.recurringRules.delete(id)
}

export async function listRecurringRules(activeOnly?: boolean) {
  const rules = await db.recurringRules.toArray()
  return activeOnly ? rules.filter((r) => r.active) : rules
}

// Защита от повторного запуска: React 18 StrictMode дважды вызывает эффект
// монтирования в dev-режиме, а без гарда это привело бы к двойной генерации
// транзакций (обе асинхронные вызовы читают одинаковый nextDueDate до того,
// как первый успевает его сдвинуть). Конкурентные вызовы ждут один и тот же
// промис вместо того, чтобы независимо читать-и-писать.
let inFlightRun: Promise<number> | null = null

export function runDueRecurringRules(referenceDate: string = todayIso()): Promise<number> {
  if (!inFlightRun) {
    inFlightRun = runDueRecurringRulesInternal(referenceDate).finally(() => {
      inFlightRun = null
    })
  }
  return inFlightRun
}

/**
 * Для каждого активного правила с наступившим nextDueDate создаёт по
 * транзакции на каждый пропущенный период и сдвигает nextDueDate вперёд.
 * Возвращает число созданных транзакций.
 */
async function runDueRecurringRulesInternal(referenceDate: string): Promise<number> {
  const allRules = await db.recurringRules.toArray()
  const rules = allRules.filter((r) => r.active)
  let createdCount = 0

  for (const rule of rules) {
    if (rule.nextDueDate > referenceDate) continue

    const { dueDates, newNextDueDate } = getDueOccurrences(rule, referenceDate)
    if (dueDates.length === 0) continue

    for (const date of dueDates) {
      await createTransaction({
        type: rule.type,
        amountKopecks: rule.amountKopecks,
        categoryId: rule.categoryId,
        accountId: rule.accountId,
        date,
        note: rule.note,
        recurringRuleId: rule.id,
      })
      createdCount += 1
    }

    await db.recurringRules.update(rule.id!, { nextDueDate: newNextDueDate })
  }

  return createdCount
}
