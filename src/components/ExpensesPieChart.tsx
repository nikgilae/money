import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { expensesByCategory } from '../lib/categoryBreakdown'
import { getCurrentPeriodRange } from '../lib/budgetPeriod'
import { formatKopecks } from '../lib/money'
import type { Category, Transaction } from '../db/types'

interface ExpensesPieChartProps {
  transactions: Transaction[]
  categories: Category[]
  monthDate: string
}

export function ExpensesPieChart({ transactions, categories, monthDate }: ExpensesPieChartProps) {
  const range = getCurrentPeriodRange('monthly', monthDate)
  const data = expensesByCategory(transactions, range, categories)

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-500">Нет расходов за этот месяц</p>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="mb-2 text-sm font-medium text-gray-500">Расходы по категориям</h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="amountKopecks" nameKey="name" outerRadius={90}>
            {data.map((entry) => (
              <Cell key={entry.categoryId} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatKopecks(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
