import type { Account, Transaction } from '../db/types'

/**
 * Суммарный эффект транзакций на баланс. У transfer-ног amountKopecks уже
 * знаковый (минус на счёте-источнике, плюс на счёте-получателе), поэтому
 * при суммировании по всем счетам сразу они взаимно гасятся.
 */
export function calculateBalance(transactions: Transaction[]): number {
  return transactions.reduce((balance, t) => {
    if (t.type === 'income') return balance + t.amountKopecks
    if (t.type === 'expense') return balance - t.amountKopecks
    return balance + t.amountKopecks // transfer
  }, 0)
}

export function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions
    .filter((t) => t.type === type)
    .reduce((sum, t) => sum + t.amountKopecks, 0)
}

/** Баланс одного счёта: его стартовый остаток + эффект всех его транзакций. */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  const ownTransactions = transactions.filter((t) => t.accountId === account.id)
  return account.initialBalanceKopecks + calculateBalance(ownTransactions)
}

/**
 * Общий баланс по переданному набору счетов (вызывающий код решает, включать
 * ли архивные счета). Транзакции не принадлежащие ни одному из этих счетов
 * не учитываются.
 */
export function calculateTotalBalance(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((sum, account) => sum + calculateAccountBalance(account, transactions), 0)
}
