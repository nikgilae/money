import { getMonthLabel, shiftMonth } from '../lib/monthlySummary'
import { card } from '../lib/ui'

interface MonthNavigatorProps {
  value: string
  onChange: (monthDate: string) => void
}

export function MonthNavigator({ value, onChange }: MonthNavigatorProps) {
  return (
    <div className={`flex items-center justify-between ${card}`}>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Предыдущий месяц"
        className="rounded-lg px-3 py-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
      >
        ‹
      </button>
      <span className="text-sm font-medium text-text capitalize">{getMonthLabel(value)}</span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Следующий месяц"
        className="rounded-lg px-3 py-1 text-text-muted transition-colors hover:bg-surface-hover hover:text-text"
      >
        ›
      </button>
    </div>
  )
}
