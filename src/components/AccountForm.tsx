import { useState } from 'react'
import type { FormEvent } from 'react'
import { createAccount, updateAccount } from '../db/accounts'
import { parseRublesToKopecks } from '../lib/money'
import { card } from '../lib/ui'
import type { Account } from '../db/types'

interface AccountFormProps {
  initialAccount?: Account
  onSaved?: () => void
  onCancel?: () => void
}

const compactInput =
  'rounded-xl border border-border bg-surface px-2 py-1 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none'

export function AccountForm({ initialAccount, onSaved, onCancel }: AccountFormProps) {
  const [name, setName] = useState(initialAccount?.name ?? '')
  const [balanceInput, setBalanceInput] = useState(
    initialAccount ? (initialAccount.initialBalanceKopecks / 100).toString() : '0',
  )
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Введите название счёта')
      return
    }

    const initialBalanceKopecks = parseRublesToKopecks(balanceInput)
    if (initialBalanceKopecks === null) {
      setError('Введите корректный стартовый остаток')
      return
    }

    if (initialAccount?.id) {
      await updateAccount(initialAccount.id, { name: name.trim(), initialBalanceKopecks })
    } else {
      await createAccount({ name: name.trim(), initialBalanceKopecks })
    }

    if (!initialAccount) {
      setName('')
      setBalanceInput('0')
    }
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-wrap items-center gap-2 ${card}`}>
      <input
        type="text"
        placeholder="Название счёта"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={`min-w-[8rem] flex-1 ${compactInput}`}
      />
      <input
        type="text"
        inputMode="decimal"
        placeholder="Стартовый остаток, ₽"
        value={balanceInput}
        onChange={(e) => setBalanceInput(e.target.value)}
        className={`w-36 ${compactInput}`}
      />
      <button
        type="submit"
        className="rounded-xl bg-accent px-3 py-1 text-sm font-medium text-bg transition-colors hover:bg-accent-hover"
      >
        {initialAccount ? 'Сохранить' : 'Добавить'}
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
