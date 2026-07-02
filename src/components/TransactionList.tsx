import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { useAccounts } from '../hooks/useAccounts'
import { useTransferLegs } from '../hooks/useTransferLegs'
import { deleteTransaction, deleteTransferPair } from '../db/transactions'
import { buildTransferCounterpartMap } from '../lib/transferCounterparts'
import { TransactionFilters, type TransactionFilterValue } from './TransactionFilters'
import { AccountSwitcher } from './AccountSwitcher'
import { TransactionListItem } from './TransactionListItem'
import { TransactionForm } from './TransactionForm'
import type { Transaction } from '../db/types'

const emptyFilter: TransactionFilterValue = { from: '', to: '', categoryId: '' }

interface TransactionListProps {
  editingTransaction: Transaction | null
  onEditingTransactionChange: (transaction: Transaction | null) => void
}

export function TransactionList({ editingTransaction, onEditingTransactionChange }: TransactionListProps) {
  const [filter, setFilter] = useState<TransactionFilterValue>(emptyFilter)
  const [accountId, setAccountId] = useState<number | 'all'>('all')

  const transactions = useTransactions({
    from: filter.from || undefined,
    to: filter.to || undefined,
    categoryId: filter.categoryId === '' ? undefined : filter.categoryId,
    accountId: accountId === 'all' ? undefined : accountId,
  })
  const categories = useCategories()
  const accounts = useAccounts(true)
  const transferLegs = useTransferLegs()
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))
  const accountById = new Map((accounts ?? []).map((a) => [a.id, a]))
  const counterpartAccountId = buildTransferCounterpartMap(transferLegs ?? [])

  async function handleDelete(t: Transaction) {
    if (t.type === 'transfer') {
      if (window.confirm('Удалить перевод?')) {
        await deleteTransferPair(t.transferPairId!)
      }
      return
    }
    if (window.confirm('Удалить транзакцию?') && t.id) {
      await deleteTransaction(t.id)
    }
  }

  if (editingTransaction) {
    return (
      <TransactionForm
        initialTransaction={editingTransaction}
        onSaved={() => onEditingTransactionChange(null)}
        onCancel={() => onEditingTransactionChange(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <AccountSwitcher accounts={accounts ?? []} value={accountId} onChange={setAccountId} />
      <TransactionFilters value={filter} onChange={setFilter} categories={categories ?? []} />

      {transactions?.length === 0 && <p className="text-sm text-text-muted">Транзакций не найдено</p>}

      <ul className="flex flex-col gap-2">
        {transactions?.map((t) => (
          <TransactionListItem
            key={t.id}
            transaction={t}
            category={categoryById.get(t.categoryId!)}
            counterpartAccountName={
              t.id !== undefined ? accountById.get(counterpartAccountId.get(t.id))?.name : undefined
            }
            onClick={() => onEditingTransactionChange(t)}
            onDelete={() => handleDelete(t)}
          />
        ))}
      </ul>
    </div>
  )
}
