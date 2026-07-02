import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { createTransaction, updateTransaction } from '../db/transactions'
import { parseRublesToKopecks } from '../lib/money'
import type { Transaction, TransactionType } from '../db/types'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

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
  const [date, setDate] = useState(initialTransaction?.date ?? todayIso())
  const [note, setNote] = useState(initialTransaction?.note ?? '')
  const [error, setError] = useState<string | null>(null)

  const categories = useCategories(type)

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

    const payload = { type, amountKopecks, categoryId, date, note: note.trim() || undefined }

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
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => handleTypeChange('expense')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            type === 'expense' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          Расход
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange('income')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            type === 'income' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
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
        className="rounded-md border border-gray-300 px-3 py-2"
      />

      <select
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
        className="rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="">Категория...</option>
        {categories?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon ? `${c.icon} ` : ''}
            {c.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2"
      />

      <input
        type="text"
        placeholder="Заметка (необязательно)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="rounded-md border border-gray-300 px-3 py-2"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-md bg-blue-600 px-3 py-2 font-medium text-white">
          {initialTransaction ? 'Сохранить' : 'Добавить'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="rounded-md bg-gray-100 px-3 py-2 text-gray-600">
            Отмена
          </button>
        )}
      </div>
    </form>
  )
}
