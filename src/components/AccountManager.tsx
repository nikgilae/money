import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { archiveAccount, unarchiveAccount } from '../db/accounts'
import { calculateAccountBalance } from '../lib/balance'
import { formatKopecks } from '../lib/money'
import { moneyText } from '../lib/ui'
import { AccountForm } from './AccountForm'
import type { Account } from '../db/types'

export function AccountManager() {
  const accounts = useAccounts(true)
  const transactions = useTransactions()
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)

  return (
    <div className="flex flex-col gap-3">
      <AccountForm
        key={editingAccount?.id ?? 'new'}
        initialAccount={editingAccount ?? undefined}
        onSaved={() => setEditingAccount(null)}
        onCancel={editingAccount ? () => setEditingAccount(null) : undefined}
      />

      <ul className="flex flex-col gap-1">
        {accounts?.map((a) => {
          const balance = calculateAccountBalance(a, transactions ?? [])
          return (
            <li
              key={a.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2"
            >
              <span className="flex flex-col">
                <span className="text-sm font-medium text-text">
                  {a.name}
                  {a.archived && <span className="ml-2 text-xs text-text-muted">архив</span>}
                </span>
                <span className={`text-xs text-text-muted ${moneyText}`}>{formatKopecks(balance)}</span>
              </span>
              <span className="flex gap-1">
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
