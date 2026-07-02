import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { useAccounts } from '../hooks/useAccounts'
import { createRecurringRule, updateRecurringRule } from '../db/recurringRules'
import { parseRublesToKopecks } from '../lib/money'
import { todayIso } from '../lib/date'
import { card, input, primaryButton, secondaryButton } from '../lib/ui'
import type { RecurringFrequency, RecurringRule, TransactionType } from '../db/types'

interface RecurringRuleFormProps {
  initialRule?: RecurringRule
  onSaved?: () => void
  onCancel?: () => void
}

export function RecurringRuleForm({ initialRule, onSaved, onCancel }: RecurringRuleFormProps) {
  const [type, setType] = useState<TransactionType>(initialRule?.type ?? 'expense')
  const [amountInput, setAmountInput] = useState(
    initialRule ? (initialRule.amountKopecks / 100).toString() : '',
  )
  const [categoryId, setCategoryId] = useState<number | ''>(initialRule?.categoryId ?? '')
  const [accountId, setAccountId] = useState<number | ''>(initialRule?.accountId ?? '')
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialRule?.frequency ?? 'monthly')
  const [startDate, setStartDate] = useState(initialRule?.startDate ?? todayIso())
  const [note, setNote] = useState(initialRule?.note ?? '')
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

    if (initialRule?.id) {
      await updateRecurringRule(initialRule.id, {
        type,
        amountKopecks,
        categoryId,
        accountId,
        frequency,
        startDate,
        note: note.trim() || undefined,
      })
    } else {
      await createRecurringRule({
        type,
        amountKopecks,
        categoryId,
        accountId,
        frequency,
        startDate,
        active: true,
        note: note.trim() || undefined,
      })
    }

    if (!initialRule) {
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

      <select value={frequency} onChange={(e) => setFrequency(e.target.value as RecurringFrequency)} className={input}>
        <option value="daily">Каждый день</option>
        <option value="weekly">Каждую неделю</option>
        <option value="monthly">Каждый месяц</option>
        <option value="yearly">Каждый год</option>
      </select>

      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} />

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
          {initialRule ? 'Сохранить' : 'Добавить'}
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
