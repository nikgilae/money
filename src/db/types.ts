export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id?: number
  type: TransactionType
  amountKopecks: number
  categoryId: number
  date: string // ISO 8601
  note?: string
  recurringRuleId?: number
  createdAt: string
}

export interface Category {
  id?: number
  name: string
  type: TransactionType
  icon?: string
  color?: string
}
