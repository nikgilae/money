import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { createRecurringRule, updateRecurringRule } from '../db/recurringRules'
import { parseRublesToKopecks } from '../lib/money'
import { todayIso } from '../lib/date'
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
  const [frequency, setFrequency] = useState<RecurringFrequency>(initialRule?.frequency ?? 'monthly')
  const [startDate, setStartDate] = useState(initialRule?.startDate ?? todayIso())
  const [note, setNote] = useState(initialRule?.note ?? '')
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

    if (initialRule?.id) {
      await updateRecurringRule(initialRule.id, {
        type,
        amountKopecks,
        categoryId,
        frequency,
        startDate,
        note: note.trim() || undefined,
      })
    } else {
      await createRecurringRule({
        type,
        amountKopecks,
        categoryId,
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

      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value as RecurringFrequency)}
        className="rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="daily">Каждый день</option>
        <option value="weekly">Каждую неделю</option>
        <option value="monthly">Каждый месяц</option>
        <option value="yearly">Каждый год</option>
      </select>

      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
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
          {initialRule ? 'Сохранить' : 'Добавить'}
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
