import { db } from './db'
import { sortAccountsForCarousel } from '../lib/accountOrder'
import type { Account } from './types'

export async function createAccount(account: Omit<Account, 'id' | 'createdAt' | 'sortOrder'>): Promise<number> {
  const existing = await db.accounts.toArray()
  const maxSortOrder = existing.reduce((max, a) => Math.max(max, a.sortOrder ?? -1), -1)
  return (await db.accounts.add({
    ...account,
    sortOrder: maxSortOrder + 1,
    createdAt: new Date().toISOString(),
  })) as number
}

export function updateAccount(id: number, changes: Partial<Omit<Account, 'id' | 'createdAt'>>) {
  return db.accounts.update(id, changes)
}

export function archiveAccount(id: number) {
  return db.accounts.update(id, { archived: true })
}

export function unarchiveAccount(id: number) {
  return db.accounts.update(id, { archived: false })
}

export async function listAccounts(includeArchived = false): Promise<Account[]> {
  const accounts = await db.accounts.toArray()
  return includeArchived ? accounts : accounts.filter((a) => !a.archived)
}

/** Делает счёт основным (открывается первым в карусели) и снимает флаг со всех остальных. */
export async function setPrimaryAccount(id: number) {
  return db.transaction('rw', db.accounts, async () => {
    const all = await db.accounts.toArray()
    await Promise.all(
      all.map((a) => {
        if (a.id === id) return a.isPrimary ? Promise.resolve() : db.accounts.update(a.id!, { isPrimary: true })
        return a.isPrimary ? db.accounts.update(a.id!, { isPrimary: false }) : Promise.resolve()
      }),
    )
  })
}

/**
 * Меняет местами sortOrder счёта с соседним (по текущему порядку карусели).
 * Если у счёта или соседа sortOrder ещё не задан, используется их позиция
 * в отсортированном списке — так порядок материализуется в конкретные
 * значения по факту первой перестановки, без отдельной миграции старых данных.
 */
export async function moveAccount(id: number, direction: 'left' | 'right') {
  const all = await db.accounts.toArray()
  const sorted = sortAccountsForCarousel(all)
  const index = sorted.findIndex((a) => a.id === id)
  if (index === -1) return

  const neighborIndex = direction === 'left' ? index - 1 : index + 1
  if (neighborIndex < 0 || neighborIndex >= sorted.length) return

  const current = sorted[index]
  const neighbor = sorted[neighborIndex]
  const currentOrder = current.sortOrder ?? index
  const neighborOrder = neighbor.sortOrder ?? neighborIndex

  return db.transaction('rw', db.accounts, async () => {
    await db.accounts.update(current.id!, { sortOrder: neighborOrder })
    await db.accounts.update(neighbor.id!, { sortOrder: currentOrder })
  })
}
