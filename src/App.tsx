import { useState } from 'react'
import { BalanceSummary } from './components/BalanceSummary'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { CategoryManager } from './components/CategoryManager'
import { BudgetForm } from './components/BudgetForm'
import { BudgetList } from './components/BudgetList'
import { SavingsGoalForm } from './components/SavingsGoalForm'
import { SavingsGoalList } from './components/SavingsGoalList'
import type { Budget, SavingsGoal, Transaction } from './db/types'

type Tab = 'transactions' | 'categories' | 'budgets' | 'goals'

const tabLabels: Record<Tab, string> = {
  transactions: 'Транзакции',
  categories: 'Категории',
  budgets: 'Бюджеты',
  goals: 'Цели',
}

function App() {
  const [tab, setTab] = useState<Tab>('transactions')
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null)

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Финансовый трекер</h1>

      <nav className="grid grid-cols-2 gap-2">
        {(Object.keys(tabLabels) as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-2 text-sm font-medium ${
              tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {tabLabels[t]}
          </button>
        ))}
      </nav>

      {tab === 'transactions' && (
        <>
          <BalanceSummary />
          {!editingTransaction && <TransactionForm />}
          <TransactionList editingTransaction={editingTransaction} onEditingTransactionChange={setEditingTransaction} />
        </>
      )}

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
    </div>
  )
}

export default App
