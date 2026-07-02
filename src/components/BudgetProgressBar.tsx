import { formatKopecks } from '../lib/money'
import type { BudgetProgress } from '../lib/budgetProgress'

interface BudgetProgressBarProps {
  progress: BudgetProgress
}

export function BudgetProgressBar({ progress }: BudgetProgressBarProps) {
  const { spentKopecks, limitKopecks, percentage, isOverLimit, overspendKopecks } = progress
  const barWidth = Math.min(100, percentage)

  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-blue-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {formatKopecks(spentKopecks)} из {formatKopecks(limitKopecks)}
        </span>
        <span className={isOverLimit ? 'font-medium text-red-600' : undefined}>
          {isOverLimit ? `Превышено на ${formatKopecks(overspendKopecks)}` : `${percentage}%`}
        </span>
      </div>
    </div>
  )
}
