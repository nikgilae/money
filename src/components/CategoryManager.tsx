import { useState } from 'react'
import { useCategories } from '../hooks/useCategories'
import { deleteCategory } from '../db/categories'
import { countTransactionsForCategory } from '../db/transactions'
import { CategoryForm } from './CategoryForm'
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
          <li key={c.id} className="flex items-center justify-between gap-2 rounded-md border border-gray-100 px-3 py-2">
            <span className="flex items-center gap-2">
              <span aria-hidden="true">{c.icon}</span>
              <span className="text-sm font-medium">{c.name}</span>
              <span className="text-xs text-gray-400">{c.type === 'income' ? 'доход' : 'расход'}</span>
            </span>
            <span className="flex gap-1">
              <button type="button" onClick={() => setEditingCategory(c)} className="rounded-md px-2 py-1 text-sm text-gray-500 hover:bg-gray-100">
                Изменить
              </button>
              <button
                type="button"
                onClick={() => c.id && handleDelete(c.id)}
                className="rounded-md px-2 py-1 text-sm text-gray-400 hover:bg-red-50 hover:text-red-600"
              >
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
