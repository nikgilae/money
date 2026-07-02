import { formatKopecks } from '../lib/money'
import { ghostIconButton, moneyText } from '../lib/ui'
import type { Category, Transaction } from '../db/types'

interface TransactionListItemProps {
  transaction: Transaction
  category?: Category
  counterpartAccountName?: string
  onClick: () => void
  onDelete: () => void
}

export function TransactionListItem({
  transaction,
  category,
  counterpartAccountName,
  onClick,
  onDelete,
}: TransactionListItemProps) {
  if (transaction.type === 'transfer') {
    const isOutgoing = transaction.amountKopecks < 0
    const label = counterpartAccountName
      ? isOutgoing
        ? `Перевод → ${counterpartAccountName}`
        : `Перевод ← ${counterpartAccountName}`
      : 'Перевод'
    const sign = isOutgoing ? '' : '+'

    return (
      <li className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2">
        <span className="flex flex-1 items-center gap-2">
          <span aria-hidden="true">⇄</span>
          <span className="flex-1">
            <span className="block text-sm font-medium text-text">{label}</span>
            <span className="block text-xs text-text-muted">
              {transaction.date}
              {transaction.note ? ` · ${transaction.note}` : ''}
            </span>
          </span>
          <span className={`font-medium text-text ${moneyText}`}>
            {sign}
            {formatKopecks(transaction.amountKopecks)}
          </span>
        </span>
        <button type="button" onClick={onDelete} aria-label="Удалить перевод" className={ghostIconButton}>
          ✕
        </button>
      </li>
    )
  }

  const amountColor = transaction.type === 'income' ? 'text-accent' : 'text-expense'
  const sign = transaction.type === 'income' ? '+' : '-'

  return (
    <li className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2">
      <button type="button" onClick={onClick} className="flex flex-1 items-center gap-2 text-left">
        <span aria-hidden="true">{category?.icon ?? '❓'}</span>
        <span className="flex-1">
          <span className="block text-sm font-medium text-text">{category?.name ?? 'Без категории'}</span>
          <span className="block text-xs text-text-muted">
            {transaction.date}
            {transaction.note ? ` · ${transaction.note}` : ''}
          </span>
        </span>
        <span className={`font-medium ${moneyText} ${amountColor}`}>
          {sign}
          {formatKopecks(transaction.amountKopecks)}
        </span>
      </button>
      <button type="button" onClick={onDelete} aria-label="Удалить транзакцию" className={ghostIconButton}>
        ✕
      </button>
    </li>
  )
}
