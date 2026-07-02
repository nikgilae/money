import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildMonthlySeries } from '../lib/monthlySeries'
import { formatKopecks } from '../lib/money'
import type { Transaction } from '../db/types'

const MONTHS_COUNT = 6

interface IncomeExpenseTrendChartProps {
  transactions: Transaction[]
  monthDate: string
}

export function IncomeExpenseTrendChart({ transactions, monthDate }: IncomeExpenseTrendChartProps) {
  const data = buildMonthlySeries(transactions, MONTHS_COUNT, monthDate).map((point) => ({
    ...point,
    incomeRubles: point.incomeKopecks / 100,
    expenseRubles: point.expenseKopecks / 100,
  }))

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <h2 className="mb-2 text-sm font-medium text-gray-500">Доходы и расходы по месяцам</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip formatter={(value) => formatKopecks(Math.round(Number(value) * 100))} />
          <Legend />
          <Bar dataKey="incomeRubles" name="Доход" fill="#22c55e" />
          <Bar dataKey="expenseRubles" name="Расход" fill="#ef4444" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
