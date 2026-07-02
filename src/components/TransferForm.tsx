import { useState } from 'react'
import type { FormEvent } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import { createTransfer } from '../db/transactions'
import { parseRublesToKopecks } from '../lib/money'
import { todayIso } from '../lib/date'
import { card, input, primaryButton, secondaryButton } from '../lib/ui'

interface TransferFormProps {
  onSaved?: () => void
  onCancel?: () => void
}

export function TransferForm({ onSaved, onCancel }: TransferFormProps) {
  const accounts = useAccounts()
  const [fromAccountId, setFromAccountId] = useState<number | ''>('')
  const [toAccountId, setToAccountId] = useState<number | ''>('')
  const [amountInput, setAmountInput] = useState('')
  const [date, setDate] = useState(todayIso())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (fromAccountId === '' && toAccountId === '' && accounts && accounts.length > 1) {
    setFromAccountId(accounts[0].id!)
    setToAccountId(accounts[1].id!)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const amountKopecks = parseRublesToKopecks(amountInput)
    if (amountKopecks === null || amountKopecks === 0) {
      setError('Введите корректную сумму больше нуля')
      return
    }
    if (fromAccountId === '' || toAccountId === '') {
      setError('Выберите счета')
      return
    }
    if (fromAccountId === toAccountId) {
      setError('Счета отправления и назначения должны различаться')
      return
    }

    await createTransfer({ fromAccountId, toAccountId, amountKopecks, date, note: note.trim() || undefined })

    setAmountInput('')
    setNote('')
    onSaved?.()
  }

  if (!accounts || accounts.length < 2) {
    return (
      <div className={`text-sm text-text-muted ${card}`}>
        Для перевода нужно как минимум два счёта. Добавьте ещё один счёт на вкладке «Счета».
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${card}`}>
      <select
        value={fromAccountId}
        onChange={(e) => setFromAccountId(e.target.value ? Number(e.target.value) : '')}
        className={input}
      >
        <option value="">Откуда...</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <select
        value={toAccountId}
        onChange={(e) => setToAccountId(e.target.value ? Number(e.target.value) : '')}
        className={input}
      >
        <option value="">Куда...</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      <input
        type="text"
        inputMode="decimal"
        placeholder="Сумма, ₽"
        value={amountInput}
        onChange={(e) => setAmountInput(e.target.value)}
        className={input}
      />

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
          Перевести
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
