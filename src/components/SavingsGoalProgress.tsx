import { formatKopecks } from '../lib/money'
import type { SavingsGoal } from '../db/types'

interface SavingsGoalProgressProps {
  goal: SavingsGoal
}

export function SavingsGoalProgress({ goal }: SavingsGoalProgressProps) {
  const percentage = goal.targetKopecks > 0 ? Math.round((goal.currentKopecks / goal.targetKopecks) * 100) : 0
  const barWidth = Math.min(100, percentage)
  const isComplete = goal.currentKopecks >= goal.targetKopecks

  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {formatKopecks(goal.currentKopecks)} из {formatKopecks(goal.targetKopecks)}
        </span>
        <span className={isComplete ? 'font-medium text-green-600' : undefined}>
          {isComplete ? 'Цель достигнута' : `${percentage}%`}
        </span>
      </div>
    </div>
  )
}
