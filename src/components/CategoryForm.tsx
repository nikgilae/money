import { useState } from 'react'
import type { FormEvent } from 'react'
import { createCategory, updateCategory } from '../db/categories'
import { card } from '../lib/ui'
import type { Category, TransactionType } from '../db/types'

interface CategoryFormProps {
  initialCategory?: Category
  onSaved?: () => void
  onCancel?: () => void
}

const compactInput =
  'rounded-xl border border-border bg-surface px-2 py-1 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none'

export function CategoryForm({ initialCategory, onSaved, onCancel }: CategoryFormProps) {
  const [name, setName] = useState(initialCategory?.name ?? '')
  const [type, setType] = useState<TransactionType>(initialCategory?.type ?? 'expense')
  const [icon, setIcon] = useState(initialCategory?.icon ?? '')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Введите название категории')
      return
    }

    const payload = { name: name.trim(), type, icon: icon.trim() || undefined }

    if (initialCategory?.id) {
      await updateCategory(initialCategory.id, payload)
    } else {
      await createCategory(payload)
    }

    if (!initialCategory) {
      setName('')
      setIcon('')
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-wrap items-center gap-2 ${card}`}>
      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`min-w-[8rem] flex-1 ${compactInput}`}
      />
      <input
        type="text"
        placeholder="Иконка"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        className={`w-16 ${compactInput}`}
      />
      <select value={type} onChange={(e) => setType(e.target.value as TransactionType)} className={compactInput}>
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </select>
      <button type="submit" className="rounded-xl bg-accent px-3 py-1 text-sm font-medium text-bg transition-colors hover:bg-accent-hover">
        {initialCategory ? 'Сохранить' : 'Добавить'}
      </button>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-border px-3 py-1 text-sm text-text-muted transition-colors hover:bg-surface-hover"
        >
          Отмена
        </button>
      )}
      {error && <p className="w-full text-sm text-expense">{error}</p>}
    </form>
  )
}
