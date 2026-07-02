import type { Account } from '../db/types'

const compactInput =
  'rounded-xl border border-border bg-surface px-2 py-1 text-sm text-text focus:border-accent focus:outline-none'

interface AccountSwitcherProps {
  accounts: Account[]
  value: number | 'all'
  onChange: (value: number | 'all') => void
}

export function AccountSwitcher({ accounts, value, onChange }: AccountSwitcherProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
      className={compactInput}
      aria-label="Счёт"
    >
      <option value="all">Все счета</option>
      {accounts.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ))}
    </select>
  )
}
