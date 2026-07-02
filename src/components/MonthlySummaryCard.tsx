import { calculateMonthlySummary } from '../lib/monthlySummary'
import { formatKopecks } from '../lib/money'
import type { Transaction } from '../db/types'

interface MonthlySummaryCardProps {
  transactions: Transaction[]
  monthDate: string
}

export function MonthlySummaryCard({ transactions, monthDate }: MonthlySummaryCardProps) {
  const { incomeKopecks, expenseKopecks, balanceKopecks } = calculateMonthlySummary(transactions, monthDate)

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 p-4">
      <span className="text-sm text-gray-500">Баланс за месяц</span>
      <span className={`text-3xl font-semibold ${balanceKopecks < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {formatKopecks(balanceKopecks)}
      </span>
      <div className="mt-2 flex gap-4 text-sm">
        <span className="text-green-600">+{formatKopecks(incomeKopecks)}</span>
        <span className="text-red-600">-{formatKopecks(expenseKopecks)}</span>
      </div>
    </div>
  )
}
