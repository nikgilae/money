import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { archiveAccount, moveAccount, setPrimaryAccount, unarchiveAccount } from '../db/accounts'
import { calculateAccountBalance } from '../lib/balance'
import { sortAccountsForCarousel } from '../lib/accountOrder'
import { formatKopecks } from '../lib/money'
import { moneyText } from '../lib/ui'
import { AccountForm } from './AccountForm'
import type { Account } from '../db/types'

export function AccountManager() {
  const accounts = useAccounts(true)
  const transactions = useTransactions()
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  const sortedAccounts = sortAccountsForCarousel(accounts ?? [])

  return (
    <div className="flex flex-col gap-3">
      <AccountForm
        key={editingAccount?.id ?? 'new'}
        initialAccount={editingAccount ?? undefined}
        onSaved={() => setEditingAccount(null)}
        onCancel={editingAccount ? () => setEditingAccount(null) : undefined}
      />

      <ul className="flex flex-col gap-1">
        {sortedAccounts.map((a, index) => {
          const balance = calculateAccountBalance(a, transactions ?? [])
          return (
            <li
              key={a.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
            >
              <span className="flex flex-col">
                <span className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-text">
                  {a.name}
                  {a.isPrimary && (
                    <span className="text-accent" title="Основной счёт" aria-label="Основной счёт">
                      ★
                    </span>
                  )}
                  {a.archived && <span className="text-xs text-text-muted">архив</span>}
                </span>
                <span className={`text-xs text-text-muted ${moneyText}`}>{formatKopecks(balance)}</span>
              </span>
              <span className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={() => a.id && moveAccount(a.id, 'left')}
                  disabled={index === 0}
                  aria-label="Переместить влево"
                  className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover disabled:opacity-30"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => a.id && moveAccount(a.id, 'right')}
                  disabled={index === sortedAccounts.length - 1}
                  aria-label="Переместить вправо"
                  className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover disabled:opacity-30"
                >
                  →
                </button>
                {!a.isPrimary && !a.archived && (
                  <button
                    type="button"
                    onClick={() => a.id && setPrimaryAccount(a.id)}
                    className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
                  >
                    Сделать основным
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditingAccount(a)}
                  className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  onClick={() => a.id && (a.archived ? unarchiveAccount(a.id) : archiveAccount(a.id))}
                  className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
                >
                  {a.archived ? 'Восстановить' : 'Архивировать'}
                </button>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
