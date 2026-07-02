import { formatKopecks } from '../lib/money'
import type { Category, Transaction } from '../db/types'

interface TransactionListItemProps {
  transaction: Transaction
  category?: Category
  onClick: () => void
  onDelete: () => void
}

export function TransactionListItem({ transaction, category, onClick, onDelete }: TransactionListItemProps) {
  const amountColor = transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
  const sign = transaction.type === 'income' ? '+' : '-'

  return (
    <li className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-2">
      <button type="button" onClick={onClick} className="flex flex-1 items-center gap-2 text-left">
        <span aria-hidden="true">{category?.icon ?? '❓'}</span>
        <span className="flex-1">
          <span className="block text-sm font-medium">{category?.name ?? 'Без категории'}</span>
          <span className="block text-xs text-gray-500">
            {transaction.date}
            {transaction.note ? ` · ${transaction.note}` : ''}
          </span>
        </span>
        <span className={`font-medium ${amountColor}`}>
          {sign}
          {formatKopecks(transaction.amountKopecks)}
        </span>
      </button>
      <button
        type="button"
        onClick={onDelete}
        aria-label="Удалить транзакцию"
        className="rounded-md px-2 py-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
      >
        ✕
      </button>
    </li>
  )
}
