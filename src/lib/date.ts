export function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export function parseIsoDate(dateStr: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateStr.split('-').map(Number)
  return { year, month, day }
}

export function formatIsoDate(year: number, month: number, day: number): string {
  const y = year.toString().padStart(4, '0')
  const m = month.toString().padStart(2, '0')
  const d = day.toString().padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Последний день месяца (1-based) в году year. */
export function lastDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate()
}
