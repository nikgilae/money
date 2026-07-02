import { useTransactions } from '../hooks/useTransactions'
import { useAccounts } from '../hooks/useAccounts'
import { calculateTotalBalance, sumByType } from '../lib/balance'
import { formatKopecks } from '../lib/money'
import { card, moneyText } from '../lib/ui'

export function BalanceSummary() {
  const transactions = useTransactions()
  const accounts = useAccounts()
  const list = transactions ?? []
  const accountList = accounts ?? []

  const totalBalance = calculateTotalBalance(accountList, list)
  const income = sumByType(list, 'income')
  const expense = sumByType(list, 'expense')

  return (
    <div className={`flex flex-col gap-1 ${card}`}>
      <span className="text-sm text-text-muted">Всего на счетах</span>
      <span className={`text-3xl font-semibold ${moneyText} ${totalBalance < 0 ? 'text-expense' : 'text-text'}`}>
        {formatKopecks(totalBalance)}
      </span>
      <div className={`flex gap-4 text-sm ${moneyText}`}>
        <span className="text-accent">+{formatKopecks(income)}</span>
        <span className="text-expense">{expense > 0 ? `-${formatKopecks(expense)}` : formatKopecks(0)}</span>
      </div>
    </div>
  )
}
