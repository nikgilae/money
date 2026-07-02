import { describe, expect, it } from 'vitest'
import { buildTransferCounterpartMap } from './transferCounterparts'
import type { Transaction } from '../db/types'

function leg(overrides: Partial<Transaction>): Transaction {
  return {
    type: 'transfer',
    amountKopecks: 0,
    accountId: 1,
    date: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('buildTransferCounterpartMap', () => {
  it('сопоставляет каждую ногу перевода со счётом её пары', () => {
    const legs = [
      leg({ id: 10, accountId: 1, transferPairId: 10, amountKopecks: -5000 }),
      leg({ id: 11, accountId: 2, transferPairId: 10, amountKopecks: 5000 }),
    ]

    const map = buildTransferCounterpartMap(legs)
    expect(map.get(10)).toBe(2)
    expect(map.get(11)).toBe(1)
  })

  it('корректно различает несколько независимых переводов', () => {
    const legs = [
      leg({ id: 1, accountId: 1, transferPairId: 1 }),
      leg({ id: 2, accountId: 2, transferPairId: 1 }),
      leg({ id: 3, accountId: 2, transferPairId: 3 }),
      leg({ id: 4, accountId: 3, transferPairId: 3 }),
    ]

    const map = buildTransferCounterpartMap(legs)
    expect(map.get(1)).toBe(2)
    expect(map.get(2)).toBe(1)
    expect(map.get(3)).toBe(3)
    expect(map.get(4)).toBe(2)
  })

  it('игнорирует неполные пары (найдена только одна нога)', () => {
    const legs = [leg({ id: 1, accountId: 1, transferPairId: 1 })]
    const map = buildTransferCounterpartMap(legs)
    expect(map.size).toBe(0)
  })

  it('возвращает пустую карту для пустого списка', () => {
    expect(buildTransferCounterpartMap([]).size).toBe(0)
  })
})
