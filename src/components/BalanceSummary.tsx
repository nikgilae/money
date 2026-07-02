import { useTransactions } from '../hooks/useTransactions'
import { calculateBalance, sumByType } from '../lib/balance'
import { formatKopecks } from '../lib/money'
import { card, moneyText } from '../lib/ui'

export function BalanceSummary() {
  const transactions = useTransactions()
  const list = transactions ?? []

  const balance = calculateBalance(list)
  const income = sumByType(list, 'income')
  const expense = sumByType(list, 'expense')

  return (
    <div className={`flex flex-col gap-1 ${card}`}>
      <span className="text-sm text-text-muted">Текущий баланс</span>
      <span className={`text-3xl font-semibold ${moneyText} ${balance < 0 ? 'text-expense' : 'text-text'}`}>
        {formatKopecks(balance)}
      </span>
      <div className={`mt-2 flex gap-4 text-sm ${moneyText}`}>
        <span className="text-accent">+{formatKopecks(income)}</span>
        <span className="text-expense">{expense > 0 ? `-${formatKopecks(expense)}` : formatKopecks(0)}</span>
      </div>
    </div>
  )
}
