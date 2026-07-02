export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Account {
  id?: number
  name: string
  initialBalanceKopecks: number
  color?: string
  archived?: boolean
  createdAt: string
}

export interface Transaction {
  id?: number
  type: TransactionType
  amountKopecks: number
  accountId: number
  categoryId?: number // необязательно для transfer
  date: string // ISO 8601
  note?: string
  recurringRuleId?: number
  transferPairId?: number // id "исходящей" ноги перевода — общий для обеих записей пары
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

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface RecurringRule {
  id?: number
  type: TransactionType
  amountKopecks: number
  categoryId: number
  accountId?: number
  frequency: RecurringFrequency
  startDate: string // ISO 8601
  nextDueDate: string // ISO 8601
  active: boolean
  note?: string
}
