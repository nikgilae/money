import { getMonthLabel, shiftMonth } from '../lib/monthlySummary'

interface MonthNavigatorProps {
  value: string
  onChange: (monthDate: string) => void
}

export function MonthNavigator({ value, onChange }: MonthNavigatorProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, -1))}
        aria-label="Предыдущий месяц"
        className="rounded-md px-3 py-1 text-gray-500 hover:bg-gray-100"
      >
        ‹
      </button>
      <span className="text-sm font-medium capitalize">{getMonthLabel(value)}</span>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value, 1))}
        aria-label="Следующий месяц"
        className="rounded-md px-3 py-1 text-gray-500 hover:bg-gray-100"
      >
        ›
      </button>
    </div>
  )
}
