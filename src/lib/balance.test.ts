import { describe, expect, it } from 'vitest'
import { calculateAccountBalance, calculateBalance, calculateTotalBalance, sumByType } from './balance'
import type { Account, Transaction } from '../db/types'

function tx(overrides: Partial<Transaction>): Transaction {
  return {
    type: 'expense',
    amountKopecks: 0,
    accountId: 1,
    categoryId: 1,
    date: '2026-01-01',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function account(overrides: Partial<Account>): Account {
  return {
    name: 'Тестовый счёт',
    initialBalanceKopecks: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('calculateBalance', () => {
  it('возвращает 0 для пустого списка', () => {
    expect(calculateBalance([])).toBe(0)
  })

  it('суммирует только доходы', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 10000 }),
      tx({ type: 'income', amountKopecks: 5000 }),
    ]
    expect(calculateBalance(transactions)).toBe(15000)
  })

  it('вычитает только расходы', () => {
    const transactions = [
      tx({ type: 'expense', amountKopecks: 3000 }),
      tx({ type: 'expense', amountKopecks: 2000 }),
    ]
    expect(calculateBalance(transactions)).toBe(-5000)
  })

  it('корректно считает смешанный список доходов и расходов', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 100000 }),
      tx({ type: 'expense', amountKopecks: 30000 }),
      tx({ type: 'expense', amountKopecks: 15000 }),
      tx({ type: 'income', amountKopecks: 5000 }),
    ]
    expect(calculateBalance(transactions)).toBe(60000)
  })

  it('может уходить в отрицательный баланс', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 1000 }),
      tx({ type: 'expense', amountKopecks: 5000 }),
    ]
    expect(calculateBalance(transactions)).toBe(-4000)
  })
})

describe('sumByType', () => {
  it('суммирует только транзакции указанного типа', () => {
    const transactions = [
      tx({ type: 'income', amountKopecks: 10000 }),
      tx({ type: 'expense', amountKopecks: 4000 }),
      tx({ type: 'income', amountKopecks: 2000 }),
    ]
    expect(sumByType(transactions, 'income')).toBe(12000)
    expect(sumByType(transactions, 'expense')).toBe(4000)
  })

  it('возвращает 0, если транзакций такого типа нет', () => {
    const transactions = [tx({ type: 'income', amountKopecks: 10000 })]
    expect(sumByType(transactions, 'expense')).toBe(0)
  })
})

describe('calculateBalance с переводами', () => {
  it('пара transfer-ног (знаковая сумма) в сумме даёт 0 при учёте всех счетов', () => {
    const transactions = [
      tx({ type: 'transfer', accountId: 1, amountKopecks: -30000 }),
      tx({ type: 'transfer', accountId: 2, amountKopecks: 30000 }),
    ]
    expect(calculateBalance(transactions)).toBe(0)
  })

  it('перевод не меняет баланс, если считать по всем счетам сразу (обе ноги в списке)', () => {
    const transactions = [
      tx({ type: 'income', accountId: 1, amountKopecks: 100000 }),
      tx({ type: 'transfer', accountId: 1, amountKopecks: -30000 }),
      tx({ type: 'transfer', accountId: 2, amountKopecks: 30000 }),
    ]
    expect(calculateBalance(transactions)).toBe(100000)
  })
})

describe('calculateAccountBalance', () => {
  it('складывает стартовый остаток счёта и его собственные транзакции', () => {
    const acc = account({ id: 1, initialBalanceKopecks: 50000 })
    const transactions = [
      tx({ accountId: 1, type: 'income', amountKopecks: 20000 }),
      tx({ accountId: 1, type: 'expense', amountKopecks: 5000 }),
      tx({ accountId: 2, type: 'income', amountKopecks: 999999 }), // чужой счёт — не учитывается
    ]
    expect(calculateAccountBalance(acc, transactions)).toBe(65000)
  })

  it('учитывает знаковые transfer-ноги только своего счёта', () => {
    const acc = account({ id: 1, initialBalanceKopecks: 10000 })
    const transactions = [
      tx({ accountId: 1, type: 'transfer', amountKopecks: -4000 }),
      tx({ accountId: 2, type: 'transfer', amountKopecks: 4000 }),
    ]
    expect(calculateAccountBalance(acc, transactions)).toBe(6000)
  })
})

describe('calculateTotalBalance', () => {
  it('суммирует балансы всех переданных счетов, переводы между ними гасятся', () => {
    const accounts = [
      account({ id: 1, initialBalanceKopecks: 10000 }),
      account({ id: 2, initialBalanceKopecks: 0 }),
    ]
    const transactions = [
      tx({ accountId: 1, type: 'income', amountKopecks: 50000 }),
      tx({ accountId: 1, type: 'transfer', amountKopecks: -20000 }),
      tx({ accountId: 2, type: 'transfer', amountKopecks: 20000 }),
    ]
    expect(calculateTotalBalance(accounts, transactions)).toBe(60000)
  })

  it('не учитывает счета, не входящие в переданный список (напр. архивные)', () => {
    const accounts = [account({ id: 1, initialBalanceKopecks: 0 })]
    const transactions = [
      tx({ accountId: 1, type: 'income', amountKopecks: 10000 }),
      tx({ accountId: 2, type: 'income', amountKopecks: 999999 }),
    ]
    expect(calculateTotalBalance(accounts, transactions)).toBe(10000)
  })
})
