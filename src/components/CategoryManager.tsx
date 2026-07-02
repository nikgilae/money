import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { deleteCategory } from '../db/categories'
import { countTransactionsForCategory } from '../db/transactions'
import { CategoryForm } from './CategoryForm'
import { ghostIconButton } from '../lib/ui'
import type { Category } from '../db/types'

export function CategoryManager() {
  const categories = useCategories()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  async function handleDelete(id: number) {
    const usageCount = await countTransactionsForCategory(id)
    if (usageCount > 0) {
      window.alert(`Нельзя удалить: есть ${usageCount} транзакций в этой категории`)
      return
    }
    if (window.confirm('Удалить категорию?')) {
      await deleteCategory(id)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <CategoryForm
        key={editingCategory?.id ?? 'new'}
        initialCategory={editingCategory ?? undefined}
        onSaved={() => setEditingCategory(null)}
        onCancel={editingCategory ? () => setEditingCategory(null) : undefined}
      />

      <ul className="flex flex-col gap-1">
        {categories?.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface/50 px-3 py-2"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{c.icon}</span>
              <span className="text-sm font-medium text-text">{c.name}</span>
              <span className="text-xs text-text-muted">{c.type === 'income' ? 'доход' : 'расход'}</span>
            </span>
            <span className="flex gap-1">
              <button
                type="button"
                onClick={() => setEditingCategory(c)}
                className="rounded-lg px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
              >
                Изменить
              </button>
              <button type="button" onClick={() => c.id && handleDelete(c.id)} className={ghostIconButton}>
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
