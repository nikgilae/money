import { useRecurringRules } from '../hooks/useRecurringRules'
import { useCategories } from '../hooks/useCategories'
import { deleteRecurringRule, updateRecurringRule } from '../db/recurringRules'
import { formatKopecks } from '../lib/money'
import { todayIso } from '../lib/date'
import { RecurringRuleForm } from './RecurringRuleForm'
import { ghostIconButton, moneyText } from '../lib/ui'
import type { RecurringFrequency, RecurringRule } from '../db/types'

const frequencyLabels: Record<RecurringFrequency, string> = {
  daily: 'каждый день',
  weekly: 'каждую неделю',
  monthly: 'каждый месяц',
  yearly: 'каждый год',
}

interface RecurringRuleListProps {
  editingRule: RecurringRule | null
  onEditingRuleChange: (rule: RecurringRule | null) => void
}

export function RecurringRuleList({ editingRule, onEditingRuleChange }: RecurringRuleListProps) {
  const rules = useRecurringRules()
  const categories = useCategories()
  const today = todayIso()

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]))
  const sortedRules = [...(rules ?? [])].sort((a, b) => a.nextDueDate.localeCompare(b.nextDueDate))

  async function handleDelete(id: number) {
    if (window.confirm('Удалить правило повторения?')) {
      await deleteRecurringRule(id)
    }
  }

  async function handleToggleActive(rule: RecurringRule) {
    if (!rule.id) return
    await updateRecurringRule(rule.id, { active: !rule.active })
  }

  if (editingRule) {
    return (
      <RecurringRuleForm
        initialRule={editingRule}
        onSaved={() => onEditingRuleChange(null)}
        onCancel={() => onEditingRuleChange(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sortedRules.length === 0 && <p className="text-sm text-text-muted">Правил повторения пока нет</p>}

      <ul className="flex flex-col gap-2">
        {sortedRules.map((r) => {
          const category = categoryById.get(r.categoryId)
          const isOverdue = r.active && r.nextDueDate < today

          return (
            <li key={r.id} className="flex flex-col gap-1 rounded-xl border border-border bg-surface/50 px-3 py-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text">
                  {category?.icon ? `${category.icon} ` : ''}
                  {category?.name ?? 'Без категории'}
                  {!r.active && <span className="ml-1 text-xs font-normal text-text-muted">(на паузе)</span>}
                </span>
                <span className={`text-sm font-medium ${moneyText} ${r.type === 'income' ? 'text-accent' : 'text-expense'}`}>
                  {r.type === 'income' ? '+' : '-'}
                  {formatKopecks(r.amountKopecks)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>
                  {frequencyLabels[r.frequency]} ·{' '}
                  {isOverdue ? (
                    <span className="font-medium text-expense">Просрочено ({r.nextDueDate})</span>
                  ) : (
                    <>след. платёж {r.nextDueDate}</>
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-1">
                <button
                  type="button"
                  onClick={() => handleToggleActive(r)}
                  className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
                >
                  {r.active ? 'Пауза' : 'Возобновить'}
                </button>
                <button
                  type="button"
                  onClick={() => onEditingRuleChange(r)}
                  className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
                >
                  Изменить
                </button>
                <button type="button" onClick={() => r.id && handleDelete(r.id)} className={ghostIconButton}>
                  ✕
                </button>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
