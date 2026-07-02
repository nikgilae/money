import { useState } from 'react'
import { depositToGoal, withdrawFromGoal } from '../db/savingsGoals'
import { parseRublesToKopecks } from '../lib/money'
import { SavingsGoalProgress } from './SavingsGoalProgress'
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
    <li className="flex flex-col gap-2 rounded-md border border-gray-100 px-3 py-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {goal.name}
          {goal.targetDate && <span className="ml-1 text-xs font-normal text-gray-400">до {goal.targetDate}</span>}
        </span>
        <span className="flex gap-1">
          <button type="button" onClick={onEdit} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">
            Изменить
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-red-50 hover:text-red-600"
          >
            ✕
          </button>
        </span>
      </div>

      <SavingsGoalProgress goal={goal} />

      <div className="flex gap-2">
        <input
          type="text"
          inputMode="decimal"
          placeholder="Сумма, ₽"
          value={amountInput}
          onChange={(e) => setAmountInput(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
        />
        <button type="button" onClick={handleDeposit} className="rounded-md bg-green-100 px-2 py-1 text-sm text-green-700">
          Пополнить
        </button>
        <button type="button" onClick={handleWithdraw} className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600">
          Списать
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </li>
  )
}
