import { useSavingsGoals } from '../hooks/useSavingsGoals'
import { deleteSavingsGoal } from '../db/savingsGoals'
import { SavingsGoalForm } from './SavingsGoalForm'
import { SavingsGoalListItem } from './SavingsGoalListItem'
import type { SavingsGoal } from '../db/types'

interface SavingsGoalListProps {
  editingGoal: SavingsGoal | null
  onEditingGoalChange: (goal: SavingsGoal | null) => void
}

export function SavingsGoalList({ editingGoal, onEditingGoalChange }: SavingsGoalListProps) {
  const goals = useSavingsGoals()

  async function handleDelete(id: number) {
    if (window.confirm('Удалить цель?')) {
      await deleteSavingsGoal(id)
    }
  }

  if (editingGoal) {
    return (
      <SavingsGoalForm
        initialGoal={editingGoal}
        onSaved={() => onEditingGoalChange(null)}
        onCancel={() => onEditingGoalChange(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {goals?.length === 0 && <p className="text-sm text-gray-500">Целей пока нет</p>}

      <ul className="flex flex-col gap-2">
        {goals?.map((g) => (
          <SavingsGoalListItem
            key={g.id}
            goal={g}
            onEdit={() => onEditingGoalChange(g)}
            onDelete={() => g.id && handleDelete(g.id)}
          />
        ))}
      </ul>
    </div>
  )
}
