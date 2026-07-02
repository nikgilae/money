import { useState } from 'react'
import { useBudgets } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import { deleteBudget } from '../db/budgets'
import { calculateBudgetProgress } from '../lib/budgetProgress'
import { BudgetForm } from './BudgetForm'
import { BudgetProgressBar } from './BudgetProgressBar'
import type { Budget } from '../db/types'

const periodLabels: Record<Budget['period'], string> = {
  weekly: 'неделя',
  monthly: 'месяц',
  yearly: 'год',
}

export function BudgetList() {
  const budgets = useBudgets()
  const categories = useCategories()
  const transactions = useTransactions()
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))

  async function handleDelete(id: number) {
    if (window.confirm('Удалить бюджет?')) {
      await deleteBudget(id)
    }
  }

  if (editingBudget) {
    return (
      <BudgetForm
        initialBudget={editingBudget}
        onSaved={() => setEditingBudget(null)}
        onCancel={() => setEditingBudget(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {budgets?.length === 0 && <p className="text-sm text-gray-500">Бюджетов пока нет</p>}

      <ul className="flex flex-col gap-2">
        {budgets?.map((b) => {
          const category = categoryById.get(b.categoryId)
          const progress = calculateBudgetProgress(b, transactions ?? [])

          return (
            <li key={b.id} className="flex flex-col gap-2 rounded-md border border-gray-100 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {category?.icon ? `${category.icon} ` : ''}
                  {category?.name ?? 'Без категории'}
                  <span className="ml-1 text-xs font-normal text-gray-400">/ {periodLabels[b.period]}</span>
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingBudget(b)}
                    className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
                  >
                    Изменить
                  </button>
                  <button
                    type="button"
                    onClick={() => b.id && handleDelete(b.id)}
                    className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    ✕
                  </button>
                </span>
              </div>
              <BudgetProgressBar progress={progress} />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
