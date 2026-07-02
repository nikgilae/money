import type { Category } from '../db/types'

export interface TransactionFilterValue {
  from: string
  to: string
  categoryId: number | ''
}

interface TransactionFiltersProps {
  value: TransactionFilterValue
  onChange: (value: TransactionFilterValue) => void
  categories: Category[]
}

export function TransactionFilters({ value, onChange, categories }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        aria-label="Дата с"
      />
      <input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        aria-label="Дата по"
      />
      <select
        value={value.categoryId}
        onChange={(e) => onChange({ ...value, categoryId: e.target.value ? Number(e.target.value) : '' })}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
      >
        <option value="">Все категории</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.icon ? `${c.icon} ` : ''}
            {c.name}
          </option>
        ))}
      </select>
      {(value.from || value.to || value.categoryId !== '') && (
        <button
          type="button"
          onClick={() => onChange({ from: '', to: '', categoryId: '' })}
          className="rounded-md bg-gray-100 px-2 py-1 text-sm text-gray-600"
        >
          Сбросить
        </button>
      )}
    </div>
  )
}
