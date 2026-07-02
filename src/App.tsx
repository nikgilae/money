import { useEffect, useState } from 'react'
import { BalanceSummary } from './components/BalanceSummary'
import { AccountCarousel } from './components/AccountCarousel'
import { TransactionForm } from './components/TransactionForm'
import { TransferForm } from './components/TransferForm'
import { TransactionList } from './components/TransactionList'
import { CategoryManager } from './components/CategoryManager'
import { AccountManager } from './components/AccountManager'
import { AccountSwitcher } from './components/AccountSwitcher'
import { BudgetForm } from './components/BudgetForm'
import { BudgetList } from './components/BudgetList'
import { SavingsGoalForm } from './components/SavingsGoalForm'
import { SavingsGoalList } from './components/SavingsGoalList'
import { RecurringRuleForm } from './components/RecurringRuleForm'
import { RecurringRuleList } from './components/RecurringRuleList'
import { MonthNavigator } from './components/MonthNavigator'
import { MonthlySummaryCard } from './components/MonthlySummaryCard'
import { ExpensesPieChart } from './components/ExpensesPieChart'
import { IncomeExpenseTrendChart } from './components/IncomeExpenseTrendChart'
import { runDueRecurringRules } from './db/recurringRules'
import { useTransactions } from './hooks/useTransactions'
import { useCategories } from './hooks/useCategories'
import { useAccounts } from './hooks/useAccounts'
import { todayIso } from './lib/date'
import type { Budget, RecurringRule, SavingsGoal, Transaction } from './db/types'

type Tab = 'transactions' | 'accounts' | 'categories' | 'budgets' | 'goals' | 'payments' | 'analytics'

const tabLabels: Record<Tab, string> = {
  transactions: 'Транзакции',
  accounts: 'Счета',
  categories: 'Категории',
  budgets: 'Бюджеты',
  goals: 'Цели',
  payments: 'Платежи',
  analytics: 'Аналитика',
}

function App() {
  const [tab, setTab] = useState<Tab>('transactions')
  const [entryMode, setEntryMode] = useState<'transaction' | 'transfer'>('transaction')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)
  const [editingRule, setEditingRule] = useState<RecurringRule | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(todayIso())
  const [analyticsAccountId, setAnalyticsAccountId] = useState<number | 'all'>('all')

  const analyticsTransactions = useTransactions({
    accountId: analyticsAccountId === 'all' ? undefined : analyticsAccountId,
  })
  const allCategories = useCategories()
  const allAccounts = useAccounts()

  useEffect(() => {
    runDueRecurringRules()
  }, [])

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-4 bg-bg p-4 text-text">
      <h1 className="text-xl font-semibold text-text">Финансовый трекер</h1>

      <nav className="grid grid-cols-2 gap-2">
        {(Object.keys(tabLabels) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
              tab === t ? 'bg-accent text-bg' : 'bg-surface text-text-muted hover:bg-surface-hover'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </nav>

      {tab === 'transactions' && (
        <>
          <BalanceSummary />
          <AccountCarousel />
          {!editingTransaction && (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEntryMode('transaction')}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    entryMode === 'transaction' ? 'bg-accent text-bg' : 'bg-surface text-text-muted hover:bg-surface-hover'
                  }`}
                >
                  Доход/Расход
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('transfer')}
                  className={`flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    entryMode === 'transfer' ? 'bg-accent text-bg' : 'bg-surface text-text-muted hover:bg-surface-hover'
                  }`}
                >
                  Перевод
                </button>
              </div>
              {entryMode === 'transaction' ? <TransactionForm /> : <TransferForm />}
            </>
          )}
          <TransactionList editingTransaction={editingTransaction} onEditingTransactionChange={setEditingTransaction} />
        </>
      )}

      {tab === 'accounts' && <AccountManager />}

      {tab === 'categories' && <CategoryManager />}

      {tab === 'budgets' && (
        <>
          {!editingBudget && <BudgetForm />}
          <BudgetList editingBudget={editingBudget} onEditingBudgetChange={setEditingBudget} />
        </>
      )}

      {tab === 'goals' && (
        <>
          {!editingGoal && <SavingsGoalForm />}
          <SavingsGoalList editingGoal={editingGoal} onEditingGoalChange={setEditingGoal} />
        </>
      )}

      {tab === 'payments' && (
        <>
          {!editingRule && <RecurringRuleForm />}
          <RecurringRuleList editingRule={editingRule} onEditingRuleChange={setEditingRule} />
        </>
      )}

      {tab === 'analytics' && (
        <>
          <AccountSwitcher accounts={allAccounts ?? []} value={analyticsAccountId} onChange={setAnalyticsAccountId} />
          <MonthNavigator value={selectedMonth} onChange={setSelectedMonth} />
          <MonthlySummaryCard transactions={analyticsTransactions ?? []} monthDate={selectedMonth} />
          <ExpensesPieChart
            transactions={analyticsTransactions ?? []}
            categories={allCategories ?? []}
            monthDate={selectedMonth}
          />
          <IncomeExpenseTrendChart transactions={analyticsTransactions ?? []} monthDate={selectedMonth} />
        </>
      )}
    </div>
  )
}

export default App
