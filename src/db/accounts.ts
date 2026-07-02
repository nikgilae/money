import { db } from './db'
import type { Account } from './types'

export function createAccount(account: Omit<Account, 'id' | 'createdAt'>) {
  return db.accounts.add({ ...account, createdAt: new Date().toISOString() })
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
