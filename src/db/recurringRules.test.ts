import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { createRecurringRule, listRecurringRules, runDueRecurringRules } from './recurringRules'
import { listTransactions } from './transactions'

beforeEach(async () => {
  await db.recurringRules.clear()
  await db.transactions.clear()
})

describe('listRecurringRules', () => {
  it('фильтрует по active в JS (не через индекс — IndexedDB не поддерживает boolean-ключи)', async () => {
    await createRecurringRule({
      type: 'expense',
      amountKopecks: 1000,
      categoryId: 1,
      frequency: 'monthly',
      startDate: '2026-01-01',
      active: true,
    })
    await createRecurringRule({
      type: 'expense',
      amountKopecks: 2000,
      categoryId: 1,
      frequency: 'monthly',
      startDate: '2026-01-01',
      active: false,
    })

    const activeOnly = await listRecurringRules(true)
    expect(activeOnly).toHaveLength(1)
    expect(activeOnly[0].amountKopecks).toBe(1000)

    const all = await listRecurringRules()
    expect(all).toHaveLength(2)
  })
})

describe('runDueRecurringRules', () => {
  it('создаёт транзакцию и сдвигает nextDueDate для наступившего активного правила', async () => {
    const id = await createRecurringRule({
      type: 'expense',
      amountKopecks: 50000,
      categoryId: 3,
      frequency: 'monthly',
      startDate: '2026-06-15',
      active: true,
      note: 'Подписка',
    })

    const created = await runDueRecurringRules('2026-07-20')
    expect(created).toBe(2) // 15 июня и 15 июля — оба уже наступили

    const transactions = await listTransactions()
    expect(transactions).toHaveLength(2)
    expect(transactions.every((t) => t.recurringRuleId === id)).toBe(true)
    expect(transactions.map((t) => t.date).sort()).toEqual(['2026-06-15', '2026-07-15'])

    const rule = await db.recurringRules.get(id)
    expect(rule?.nextDueDate).toBe('2026-08-15')
  })

  it('не трогает неактивные правила', async () => {
    await createRecurringRule({
      type: 'expense',
      amountKopecks: 1000,
      categoryId: 1,
      frequency: 'daily',
      startDate: '2026-01-01',
      active: false,
    })

    const created = await runDueRecurringRules('2026-07-20')
    expect(created).toBe(0)
    expect(await listTransactions()).toHaveLength(0)
  })

  it('не создаёт транзакций, если nextDueDate ещё не наступил', async () => {
    await createRecurringRule({
      type: 'income',
      amountKopecks: 100000,
      categoryId: 2,
      frequency: 'monthly',
      startDate: '2026-08-01',
      active: true,
    })

    const created = await runDueRecurringRules('2026-07-20')
    expect(created).toBe(0)
  })

  it('не дублирует транзакции при параллельном вызове (React 18 StrictMode дважды вызывает эффект монтирования)', async () => {
    await createRecurringRule({
      type: 'expense',
      amountKopecks: 1500,
      categoryId: 4,
      frequency: 'monthly',
      startDate: '2026-05-02',
      active: true,
    })

    const [firstRunCount, secondRunCount] = await Promise.all([
      runDueRecurringRules('2026-07-02'),
      runDueRecurringRules('2026-07-02'),
    ])

    // Оба вызова ждут один и тот же in-flight промис, поэтому оба видят
    // одинаковый результат — 3 пропущенных периода (май/июнь/июль), не 6.
    expect(firstRunCount).toBe(3)
    expect(secondRunCount).toBe(3)
    expect(await listTransactions()).toHaveLength(3)
  })
})
