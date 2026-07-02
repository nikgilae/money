import { useState } from 'react'
import { useTransactions } from '../hooks/useTransactions'
import { useCategories } from '../hooks/useCategories'
import { deleteTransaction } from '../db/transactions'
import { TransactionFilters, type TransactionFilterValue } from './TransactionFilters'
import { TransactionListItem } from './TransactionListItem'
import { TransactionForm } from './TransactionForm'
import type { Transaction } from '../db/types'

const emptyFilter: TransactionFilterValue = { from: '', to: '', categoryId: '' }

export function TransactionList() {
  const [filter, setFilter] = useState<TransactionFilterValue>(emptyFilter)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  const transactions = useTransactions({
    from: filter.from || undefined,
    to: filter.to || undefined,
    categoryId: filter.categoryId === '' ? undefined : filter.categoryId,
  })
  const categories = useCategories()
  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))

  async function handleDelete(id: number) {
    if (window.confirm('Удалить транзакцию?')) {
      await deleteTransaction(id)
    }
  }

  if (editingTransaction) {
    return (
      <TransactionForm
        initialTransaction={editingTransaction}
        onSaved={() => setEditingTransaction(null)}
        onCancel={() => setEditingTransaction(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <TransactionFilters value={filter} onChange={setFilter} categories={categories ?? []} />

      {transactions?.length === 0 && <p className="text-sm text-gray-500">Транзакций не найдено</p>}

      <ul className="flex flex-col gap-2">
        {transactions?.map((t) => (
          <TransactionListItem
            key={t.id}
            transaction={t}
            category={categoryById.get(t.categoryId)}
            onClick={() => setEditingTransaction(t)}
            onDelete={() => t.id && handleDelete(t.id)}
          />
        ))}
      </ul>
    </div>
  )
}
