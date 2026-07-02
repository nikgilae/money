import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { expensesByCategory } from '../lib/categoryBreakdown'
import { getCurrentPeriodRange } from '../lib/budgetPeriod'
import { formatKopecks } from '../lib/money'
import { card } from '../lib/ui'
import type { Category, Transaction } from '../db/types'

interface ExpensesPieChartProps {
  transactions: Transaction[]
  categories: Category[]
  monthDate: string
}

const tooltipStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.75rem',
  color: 'var(--color-text)',
}

export function ExpensesPieChart({ transactions, categories, monthDate }: ExpensesPieChartProps) {
  const range = getCurrentPeriodRange('monthly', monthDate)
  const data = expensesByCategory(transactions, range, categories)

  if (data.length === 0) {
    return (
      <div className={card}>
        <p className="text-sm text-text-muted">Нет расходов за этот месяц</p>
      </div>
    )
  }

  return (
    <div className={card}>
      <h2 className="mb-2 text-sm font-medium text-text-muted">Расходы по категориям</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="amountKopecks" nameKey="name" outerRadius={90}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatKopecks(Number(value))} contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: 'var(--color-text-muted)', fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
