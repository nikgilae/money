import { useState } from 'react'
import { depositToGoal, withdrawFromGoal } from '../db/savingsGoals'
import { parseRublesToKopecks } from '../lib/money'
import { SavingsGoalProgress } from './SavingsGoalProgress'
import { ghostIconButton } from '../lib/ui'
import type { SavingsGoal } from '../db/types'

interface SavingsGoalListItemProps {
  goal: SavingsGoal
  onEdit: () => void
  onDelete: () => void
}

export function SavingsGoalListItem({ goal, onEdit, onDelete }: SavingsGoalListItemProps) {
  const [amountInput, setAmountInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  function parseAmount(): number | null {
    const kopecks = parseRublesToKopecks(amountInput)
    if (kopecks === null || kopecks === 0) {
      setError('Введите корректную сумму больше нуля')
      return null
    }
    setError(null)
    return kopecks
  }

  async function handleDeposit() {
    if (!goal.id) return
    const kopecks = parseAmount()
    if (kopecks === null) return
    await depositToGoal(goal.id, kopecks)
    setAmountInput('')
  }

  async function handleWithdraw() {
    if (!goal.id) return
    const kopecks = parseAmount()
    if (kopecks === null) return
    await withdrawFromGoal(goal.id, kopecks)
    setAmountInput('')
  }

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text">
          {goal.name}
          {goal.targetDate && <span className="ml-1 text-xs font-normal text-text-muted">до {goal.targetDate}</span>}
        </span>
        <span className="flex gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
          >
            Изменить
          </button>
          <button type="button" onClick={onDelete} className={ghostIconButton}>
            ✕
          </button>
        </span>
      </div>

      <SavingsGoalProgress goal={goal} />

      <div className="flex flex-col gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Сумма, ₽"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="rounded-xl border border-border bg-surface px-2 py-1 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleDeposit}
            className="flex-1 rounded-xl bg-accent/15 px-2 py-1 text-sm text-accent transition-colors hover:bg-accent/25"
          >
            Пополнить
          </button>
          <button
            type="button"
            onClick={handleWithdraw}
            className="flex-1 rounded-xl bg-surface-hover px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface"
          >
            Списать
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-expense">{error}</p>}
    </li>
  )
}
