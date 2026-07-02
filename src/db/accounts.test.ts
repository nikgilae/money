import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { createAccount, moveAccount, setPrimaryAccount } from './accounts'

beforeEach(async () => {
  await db.accounts.clear()
})

describe('createAccount', () => {
  it('присваивает инкрементальный sortOrder по порядку создания', async () => {
    const id1 = await createAccount({ name: 'Первый', initialBalanceKopecks: 0 })
    const id2 = await createAccount({ name: 'Второй', initialBalanceKopecks: 0 })
    const id3 = await createAccount({ name: 'Третий', initialBalanceKopecks: 0 })

    expect((await db.accounts.get(id1))?.sortOrder).toBe(0)
    expect((await db.accounts.get(id2))?.sortOrder).toBe(1)
    expect((await db.accounts.get(id3))?.sortOrder).toBe(2)
  })
})

describe('setPrimaryAccount', () => {
  it('делает счёт основным и снимает флаг с остальных', async () => {
    const id1 = await createAccount({ name: 'A', initialBalanceKopecks: 0 })
    const id2 = await createAccount({ name: 'B', initialBalanceKopecks: 0 })
    await setPrimaryAccount(id1)

    await setPrimaryAccount(id2)

    expect((await db.accounts.get(id1))?.isPrimary).toBe(false)
    expect((await db.accounts.get(id2))?.isPrimary).toBe(true)
  })

  it('ничего не ломает при повторном назначении того же счёта основным', async () => {
    const id1 = await createAccount({ name: 'A', initialBalanceKopecks: 0 })
    await setPrimaryAccount(id1)

    await setPrimaryAccount(id1)

    expect((await db.accounts.get(id1))?.isPrimary).toBe(true)
  })
})

describe('moveAccount', () => {
  it('меняет местами sortOrder с соседом справа', async () => {
    const id1 = await createAccount({ name: 'A', initialBalanceKopecks: 0 })
    const id2 = await createAccount({ name: 'B', initialBalanceKopecks: 0 })

    await moveAccount(id1, 'right')

    expect((await db.accounts.get(id1))?.sortOrder).toBe(1)
    expect((await db.accounts.get(id2))?.sortOrder).toBe(0)
  })

  it('меняет местами sortOrder с соседом слева', async () => {
    const id1 = await createAccount({ name: 'A', initialBalanceKopecks: 0 })
    const id2 = await createAccount({ name: 'B', initialBalanceKopecks: 0 })

    await moveAccount(id2, 'left')

    expect((await db.accounts.get(id1))?.sortOrder).toBe(1)
    expect((await db.accounts.get(id2))?.sortOrder).toBe(0)
  })

  it('не меняет ничего, если сосед в этом направлении отсутствует (край списка)', async () => {
    const id1 = await createAccount({ name: 'A', initialBalanceKopecks: 0 })
    const id2 = await createAccount({ name: 'B', initialBalanceKopecks: 0 })

    await moveAccount(id1, 'left')
    await moveAccount(id2, 'right')

    expect((await db.accounts.get(id1))?.sortOrder).toBe(0)
    expect((await db.accounts.get(id2))?.sortOrder).toBe(1)
  })
})
