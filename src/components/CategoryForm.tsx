import { useState } from 'react'
import type { FormEvent } from 'react'
import { createCategory, updateCategory } from '../db/categories'
import type { Category, TransactionType } from '../db/types'

interface CategoryFormProps {
  initialCategory?: Category
  onSaved?: () => void
  onCancel?: () => void
}

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
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 p-3">
      <input
        type="text"
        placeholder="Название"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-w-[8rem] flex-1 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <input
        type="text"
        placeholder="Иконка"
        value={icon}
        onChange={(e) => setIcon(e.target.value)}
        className="w-16 rounded-md border border-gray-300 px-2 py-1 text-sm"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as TransactionType)}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="expense">Расход</option>
        <option value="income">Доход</option>
      </select>
      <button type="submit" className="rounded-md bg-blue-600 px-3 py-1 text-sm font-medium text-white">
        {initialCategory ? 'Сохранить' : 'Добавить'}
      </button>
      {onCancel && (
        <button type="button" onClick={onCancel} className="rounded-md bg-gray-100 px-3 py-1 text-sm text-gray-600">
          Отмена
        </button>
      )}
      {error && <p className="w-full text-sm text-red-600">{error}</p>}
    </form>
  )
}
