import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import {
  createTransaction,
  createTransfer,
  deleteTransferPair,
  listTransactions,
  listTransferLegs,
} from './transactions'

beforeEach(async () => {
  await db.transactions.clear()
  await db.accounts.clear()
})

describe('createTransfer', () => {
  it('создаёт пару transfer-транзакций со знаковыми суммами и общим transferPairId', async () => {
    const fromId = await createTransfer({
      fromAccountId: 1,
      toAccountId: 2,
      amountKopecks: 30000,
      date: '2026-07-01',
      note: 'На отпуск',
    })

    const legs = await listTransferLegs()
    expect(legs).toHaveLength(2)

    const fromLeg = legs.find((l) => l.accountId === 1)!
    const toLeg = legs.find((l) => l.accountId === 2)!

    expect(fromLeg.amountKopecks).toBe(-30000)
    expect(toLeg.amountKopecks).toBe(30000)
    expect(fromLeg.transferPairId).toBe(fromId)
    expect(toLeg.transferPairId).toBe(fromId)
    expect(fromLeg.type).toBe('transfer')
    expect(toLeg.type).toBe('transfer')
  })

  it('суммарный эффект перевода на общий баланс всех счетов равен нулю', async () => {
    await createTransfer({ fromAccountId: 1, toAccountId: 2, amountKopecks: 12345, date: '2026-07-01' })

    const legs = await listTransferLegs()
    const total = legs.reduce((sum, t) => sum + t.amountKopecks, 0)
    expect(total).toBe(0)
  })
})

describe('deleteTransferPair', () => {
  it('удаляет обе ноги перевода разом', async () => {
    const transferPairId = await createTransfer({
      fromAccountId: 1,
      toAccountId: 2,
      amountKopecks: 5000,
      date: '2026-07-01',
    })

    await deleteTransferPair(transferPairId)

    expect(await listTransferLegs()).toHaveLength(0)
  })

  it('не затрагивает транзакции других переводов', async () => {
    const firstPairId = await createTransfer({ fromAccountId: 1, toAccountId: 2, amountKopecks: 1000, date: '2026-07-01' })
    await createTransfer({ fromAccountId: 2, toAccountId: 1, amountKopecks: 2000, date: '2026-07-02' })

    await deleteTransferPair(firstPairId)

    expect(await listTransferLegs()).toHaveLength(2)
  })
})

describe('listTransactions с фильтром по accountId', () => {
  it('возвращает только транзакции указанного счёта', async () => {
    await createTransaction({ type: 'expense', amountKopecks: 100, accountId: 1, categoryId: 1, date: '2026-07-01' })
    await createTransaction({ type: 'expense', amountKopecks: 200, accountId: 2, categoryId: 1, date: '2026-07-01' })

    const forAccount1 = await listTransactions({ accountId: 1 })
    expect(forAccount1).toHaveLength(1)
    expect(forAccount1[0].amountKopecks).toBe(100)
  })
})
