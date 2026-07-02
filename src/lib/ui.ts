// Переиспользуемые наборы Tailwind-классов для дизайн-системы "Ночной свод".
// Просто строки — без новых зависимостей (clsx/cva не нужны для такого набора).

export const card = 'rounded-2xl border border-border bg-surface/80 p-4 shadow-lg shadow-black/20 backdrop-blur-md'

export const primaryButton =
  'rounded-xl bg-accent px-3 py-2 font-medium text-bg transition-colors hover:bg-accent-hover'

export const secondaryButton =
  'rounded-xl border border-border px-3 py-2 text-text-muted transition-colors hover:bg-surface-hover'

export const ghostIconButton =
  'rounded-lg px-2 py-1 text-text-muted transition-colors hover:bg-expense/10 hover:text-expense'

export const input =
  'rounded-xl border border-border bg-surface px-3 py-2 text-text placeholder:text-text-muted focus:border-accent focus:outline-none'

export const moneyText = 'font-mono tabular-nums'
