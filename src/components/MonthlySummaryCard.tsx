import { calculateMonthlySummary } from '../lib/monthlySummary'
import { formatKopecks } from '../lib/money'
import { card, moneyText } from '../lib/ui'
import type { Transaction } from '../db/types'

interface MonthlySummaryCardProps {
  transactions: Transaction[]
  monthDate: string
}

export function MonthlySummaryCard({ transactions, monthDate }: MonthlySummaryCardProps) {
  const { incomeKopecks, expenseKopecks, balanceKopecks } = calculateMonthlySummary(transactions, monthDate)

  return (
    <div className={`flex flex-col gap-1 ${card}`}>
      <span className="text-sm text-text-muted">Баланс за месяц</span>
      <span className={`text-3xl font-semibold ${moneyText} ${balanceKopecks < 0 ? 'text-expense' : 'text-text'}`}>
        {formatKopecks(balanceKopecks)}
      </span>
      <div className={`mt-2 flex gap-4 text-sm ${moneyText}`}>
        <span className="text-accent">+{formatKopecks(incomeKopecks)}</span>
        <span className="text-expense">{expenseKopecks > 0 ? `-${formatKopecks(expenseKopecks)}` : formatKopecks(0)}</span>
      </div>
    </div>
  )
}
