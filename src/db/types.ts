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

export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly'

export interface Budget {
  id?: number
  categoryId: number
  limitKopecks: number
  period: BudgetPeriod
  startDate: string // ISO 8601
}

export interface SavingsGoal {
  id?: number
  name: string
  targetKopecks: number
  currentKopecks: number
  targetDate?: string // ISO 8601
  createdAt: string
}
