import { formatKopecks } from '../lib/money'
import { moneyText } from '../lib/ui'
import type { BudgetProgress } from '../lib/budgetProgress'

interface BudgetProgressBarProps {
  progress: BudgetProgress
}

export function BudgetProgressBar({ progress }: BudgetProgressBarProps) {
  const { spentKopecks, limitKopecks, percentage, isOverLimit, overspendKopecks } = progress
  const barWidth = Math.min(100, percentage)

  return (
    <div className="flex flex-col gap-1">
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`h-full rounded-full ${isOverLimit ? 'bg-expense' : 'bg-accent'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <div className={`flex justify-between text-xs text-text-muted ${moneyText}`}>
        <span>
          {formatKopecks(spentKopecks)} из {formatKopecks(limitKopecks)}
        </span>
        <span className={isOverLimit ? 'font-medium text-expense' : undefined}>
          {isOverLimit ? `Превышено на ${formatKopecks(overspendKopecks)}` : `${percentage}%`}
        </span>
      </div>
    </div>
  )
}
