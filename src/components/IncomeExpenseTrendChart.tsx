import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { buildMonthlySeries } from '../lib/monthlySeries'
import { formatKopecks } from '../lib/money'
import { card } from '../lib/ui'
import type { Transaction } from '../db/types'

const MONTHS_COUNT = 6

interface IncomeExpenseTrendChartProps {
  transactions: Transaction[]
  monthDate: string
}

const tooltipStyle = {
  backgroundColor: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: '0.75rem',
  color: 'var(--color-text)',
}

export function IncomeExpenseTrendChart({ transactions, monthDate }: IncomeExpenseTrendChartProps) {
  const data = buildMonthlySeries(transactions, MONTHS_COUNT, monthDate).map((point) => ({
    ...point,
    incomeRubles: point.incomeKopecks / 100,
    expenseRubles: point.expenseKopecks / 100,
  }))

  return (
    <div className={card}>
      <h2 className="mb-2 text-sm font-medium text-text-muted">Доходы и расходы по месяцам</h2>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" fontSize={12} stroke="var(--color-text-muted)" />
          <YAxis fontSize={12} stroke="var(--color-text-muted)" />
          <Tooltip formatter={(value) => formatKopecks(Math.round(Number(value) * 100))} contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ color: 'var(--color-text-muted)', fontSize: 13 }} />
          <Bar dataKey="incomeRubles" name="Доход" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenseRubles" name="Расход" fill="var(--color-expense)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
