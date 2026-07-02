import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useAccounts } from '../hooks/useAccounts'
import { createTransaction, updateTransaction } from '../db/transactions'
import { parseRublesToKopecks } from '../lib/money'
import { todayIso } from '../lib/date'
import { card, input, primaryButton, secondaryButton } from '../lib/ui'
import type { Transaction, TransactionType } from '../db/types'

interface TransactionFormProps {
  initialTransaction?: Transaction
  onSaved?: () => void
  onCancel?: () => void
}

export function TransactionForm({ initialTransaction, onSaved, onCancel }: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>(initialTransaction?.type ?? 'expense')
  const [amountInput, setAmountInput] = useState(
    initialTransaction ? (initialTransaction.amountKopecks / 100).toString() : '',
  )
  const [categoryId, setCategoryId] = useState<number | ''>(initialTransaction?.categoryId ?? '')
  const [accountId, setAccountId] = useState<number | ''>(initialTransaction?.accountId ?? '')
  const [date, setDate] = useState(initialTransaction?.date ?? todayIso())
  const [note, setNote] = useState(initialTransaction?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  const categories = useCategories(type)
  const accounts = useAccounts()

  if (accountId === '' && accounts && accounts.length > 0) {
    setAccountId(accounts[0].id!)
  }

  function handleTypeChange(newType: TransactionType) {
    setType(newType)
    setCategoryId('')
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const amountKopecks = parseRublesToKopecks(amountInput)
    if (amountKopecks === null || amountKopecks === 0) {
      setError('Введите корректную сумму больше нуля')
      return
    }
    if (categoryId === '') {
      setError('Выберите категорию')
      return
    }
    if (accountId === '') {
      setError('Выберите счёт')
      return
    }

    const payload = { type, amountKopecks, categoryId, accountId, date, note: note.trim() || undefined }

    if (initialTransaction?.id) {
      await updateTransaction(initialTransaction.id, payload)
    } else {
      await createTransaction(payload)
    }

    if (!initialTransaction) {
      setAmountInput('')
      setNote('')
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${card}`}>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            type === 'expense' ? 'bg-expense/15 text-expense' : 'bg-surface-hover text-text-muted'
          }`}
        >
          Расход
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
            type === 'income' ? 'bg-accent/15 text-accent' : 'bg-surface-hover text-text-muted'
          }`}
        >
          Доход
        </button>
      </div>

      <input
        type="text"
        inputMode="decimal"
        placeholder="Сумма, ₽"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        className={input}
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
        className={input}
      >
        <option value="">Категория...</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon ? `${c.icon} ` : ''}
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={accountId}
        onChange={(e) => setAccountId(e.target.value ? Number(e.target.value) : '')}
        className={input}
      >
        <option value="">Счёт...</option>
        {accounts?.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={input} />

      <input
        type="text"
        placeholder="Заметка (необязательно)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className={input}
      />

      {error && <p className="text-sm text-expense">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className={`flex-1 ${primaryButton}`}>
          {initialTransaction ? 'Сохранить' : 'Добавить'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={secondaryButton}>
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}
