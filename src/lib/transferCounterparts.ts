import type { Transaction } from '../db/types'

/** Сопоставляет id ноги перевода со счётом её пары — для подписи "откуда/куда" в списке. */
export function buildTransferCounterpartMap(legs: Transaction[]): Map<number, number> {
  const byPairId = new Map<number, Transaction[]>()
  for (const leg of legs) {
    if (leg.transferPairId === undefined) continue
    const group = byPairId.get(leg.transferPairId) ?? []
    group.push(leg)
    byPairId.set(leg.transferPairId, group)
  }

  const counterpartAccountId = new Map<number, number>()
  for (const group of byPairId.values()) {
    if (group.length !== 2) continue
    const [a, b] = group
    if (a.id !== undefined) counterpartAccountId.set(a.id, b.accountId)
    if (b.id !== undefined) counterpartAccountId.set(b.id, a.accountId)
  }

  return counterpartAccountId
}
