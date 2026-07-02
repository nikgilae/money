import { useState } from 'react'
import type { FormEvent } from 'react'
import { useCategories } from '../hooks/useCategories'
import { createBudget, updateBudget } from '../db/budgets'
import { parseRublesToKopecks } from '../lib/money'
import { todayIso } from '../lib/date'
import { card, input, primaryButton, secondaryButton } from '../lib/ui'
import type { Budget, BudgetPeriod } from '../db/types'

interface BudgetFormProps {
  initialBudget?: Budget
  onSaved?: () => void
  onCancel?: () => void
}

export function BudgetForm({ initialBudget, onSaved, onCancel }: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState<number | ''>(initialBudget?.categoryId ?? '')
  const [limitInput, setLimitInput] = useState(
    initialBudget ? (initialBudget.limitKopecks / 100).toString() : '',
  )
  const [period, setPeriod] = useState<BudgetPeriod>(initialBudget?.period ?? 'monthly')
  const [startDate, setStartDate] = useState(initialBudget?.startDate ?? todayIso())
  const [error, setError] = useState<string | null>(null)

  const categories = useCategories('expense')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const limitKopecks = parseRublesToKopecks(limitInput)
    if (limitKopecks === null || limitKopecks === 0) {
      setError('Введите корректный лимит больше нуля')
      return
    }
    if (categoryId === '') {
      setError('Выберите категорию')
      return
    }

    const payload = { categoryId, limitKopecks, period, startDate }

    if (initialBudget?.id) {
      await updateBudget(initialBudget.id, payload)
    } else {
      await createBudget(payload)
    }

    if (!initialBudget) {
      setCategoryId('')
      setLimitInput('')
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${card}`}>
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

      <input
        type="text"
        inputMode="decimal"
        placeholder="Лимит, ₽"
        value={limitInput}
        onChange={(e) => setLimitInput(e.target.value)}
        className={input}
      />

      <select value={period} onChange={(e) => setPeriod(e.target.value as BudgetPeriod)} className={input}>
        <option value="weekly">Неделя</option>
        <option value="monthly">Месяц</option>
        <option value="yearly">Год</option>
      </select>

      <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={input} />

      {error && <p className="text-sm text-expense">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className={`flex-1 ${primaryButton}`}>
          {initialBudget ? 'Сохранить' : 'Добавить'}
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
