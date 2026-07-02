import { useState } from 'react'
import type { FormEvent } from 'react'
import { createSavingsGoal, updateSavingsGoal } from '../db/savingsGoals'
import { parseRublesToKopecks } from '../lib/money'
import { card, input, primaryButton, secondaryButton } from '../lib/ui'
import type { SavingsGoal } from '../db/types'

interface SavingsGoalFormProps {
  initialGoal?: SavingsGoal
  onSaved?: () => void
  onCancel?: () => void
}

export function SavingsGoalForm({ initialGoal, onSaved, onCancel }: SavingsGoalFormProps) {
  const [name, setName] = useState(initialGoal?.name ?? '')
  const [targetInput, setTargetInput] = useState(
    initialGoal ? (initialGoal.targetKopecks / 100).toString() : '',
  )
  const [targetDate, setTargetDate] = useState(initialGoal?.targetDate ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Введите название цели')
      return
    }

    const targetKopecks = parseRublesToKopecks(targetInput)
    if (targetKopecks === null || targetKopecks === 0) {
      setError('Введите корректную сумму цели больше нуля')
      return
    }

    const payload = { name: name.trim(), targetKopecks, targetDate: targetDate || undefined }

    if (initialGoal?.id) {
      await updateSavingsGoal(initialGoal.id, payload)
    } else {
      await createSavingsGoal(payload)
    }

    if (!initialGoal) {
      setName('')
      setTargetInput('')
      setTargetDate('')
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-3 ${card}`}>
      <input
        type="text"
        placeholder="Название цели"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={input}
      />

      <input
        type="text"
        inputMode="decimal"
        placeholder="Целевая сумма, ₽"
        value={targetInput}
        onChange={(e) => setTargetInput(e.target.value)}
        className={input}
      />

      <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={input} />

      {error && <p className="text-sm text-expense">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" className={`flex-1 ${primaryButton}`}>
          {initialGoal ? 'Сохранить' : 'Добавить'}
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
