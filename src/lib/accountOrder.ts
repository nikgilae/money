import type { Account } from '../db/types'

/** Порядок карточек в карусели: по sortOrder (не заданный — в конец), тай-брейк по id. */
export function sortAccountsForCarousel(accounts: Account[]): Account[] {
  return [...accounts].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER
    if (orderA !== orderB) return orderA - orderB
    return (a.id ?? 0) - (b.id ?? 0)
  })
}

/** Индекс счёта, на котором карусель должна открыться: isPrimary, иначе первый по порядку. */
export function getInitialCarouselIndex(sortedAccounts: Account[]): number {
  const index = sortedAccounts.findIndex((a) => a.isPrimary)
  return index >= 0 ? index : 0
}
