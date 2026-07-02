import { useTransactions } from '../hooks/useTransactions'
import { calculateBalance, sumByType } from '../lib/balance'
import { formatKopecks } from '../lib/money'

export function BalanceSummary() {
  const transactions = useTransactions()
  const list = transactions ?? []

  const balance = calculateBalance(list)
  const income = sumByType(list, 'income')
  const expense = sumByType(list, 'expense')

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-gray-200 p-4">
      <span className="text-sm text-gray-500">Текущий баланс</span>
      <span className={`text-3xl font-semibold ${balance < 0 ? 'text-red-600' : 'text-gray-900'}`}>
        {formatKopecks(balance)}
      </span>
      <div className="mt-2 flex gap-4 text-sm">
        <span className="text-green-600">+{formatKopecks(income)}</span>
        <span className="text-red-600">{expense > 0 ? `-${formatKopecks(expense)}` : formatKopecks(0)}</span>
      </div>
    </div>
  )
}
