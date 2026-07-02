import { useBudgets } from '../hooks/useBudgets'
import { useCategories } from '../hooks/useCategories'
import { useAccounts } from '../hooks/useAccounts'
import { useTransactions } from '../hooks/useTransactions'
import { deleteBudget } from '../db/budgets'
import { calculateBudgetProgress } from '../lib/budgetProgress'
import { BudgetForm } from './BudgetForm'
import { BudgetProgressBar } from './BudgetProgressBar'
import { ghostIconButton } from '../lib/ui'
import type { Budget } from '../db/types'

const periodLabels: Record<Budget['period'], string> = {
  weekly: 'неделя',
  monthly: 'месяц',
  yearly: 'год',
}

interface BudgetListProps {
  editingBudget: Budget | null
  onEditingBudgetChange: (budget: Budget | null) => void
}

export function BudgetList({ editingBudget, onEditingBudgetChange }: BudgetListProps) {
  const budgets = useBudgets()
  const categories = useCategories()
  const accounts = useAccounts(true)
  const transactions = useTransactions()

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))
  const accountById = new Map((accounts ?? []).map((a) => [a.id, a]))

  async function handleDelete(id: number) {
    if (window.confirm('Удалить бюджет?')) {
      await deleteBudget(id)
    }
  }

  if (editingBudget) {
    return (
      <BudgetForm
        initialBudget={editingBudget}
        onSaved={() => onEditingBudgetChange(null)}
        onCancel={() => onEditingBudgetChange(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {budgets?.length === 0 && <p className="text-sm text-text-muted">Бюджетов пока нет</p>}

      <ul className="flex flex-col gap-2">
        {budgets?.map((b) => {
          const category = categoryById.get(b.categoryId)
          const progress = calculateBudgetProgress(b, transactions ?? [])

          return (
            <li
              key={b.id}
              className="flex flex-col gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">
                  {category?.icon ? `${category.icon} ` : ''}
                  {category?.name ?? 'Без категории'}
                  <span className="ml-1 text-xs font-normal text-text-muted">
                    / {periodLabels[b.period]} / {b.accountId ? (accountById.get(b.accountId)?.name ?? 'Счёт не найден') : 'Все счета'}
                  </span>
                </span>
                <span className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onEditingBudgetChange(b)}
                    className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
                  >
                    Изменить
                  </button>
                  <button type="button" onClick={() => b.id && handleDelete(b.id)} className={ghostIconButton}>
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
