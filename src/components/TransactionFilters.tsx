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

const compactInput =
  'rounded-xl border border-border bg-surface px-2 py-1 text-sm text-text focus:border-accent focus:outline-none'

export function TransactionFilters({ value, onChange, categories }: TransactionFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <input
        type="date"
        value={value.from}
        onChange={(e) => onChange({ ...value, from: e.target.value })}
        className={compactInput}
        aria-label="Дата с"
      />
      <input
        type="date"
        value={value.to}
        onChange={(e) => onChange({ ...value, to: e.target.value })}
        className={compactInput}
        aria-label="Дата по"
      />
      <select
        value={value.categoryId}
        onChange={(e) => onChange({ ...value, categoryId: e.target.value ? Number(e.target.value) : '' })}
        className={compactInput}
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
          className="rounded-xl bg-surface-hover px-2 py-1 text-sm text-text-muted transition-colors hover:bg-surface"
        >
          Сбросить
        </button>
      )}
    </div>
  )
}
