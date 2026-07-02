import { useState } from 'react'
import { BalanceSummary } from './components/BalanceSummary'
import { TransactionForm } from './components/TransactionForm'
import { TransactionList } from './components/TransactionList'
import { CategoryManager } from './components/CategoryManager'

type Tab = 'transactions' | 'categories'

function App() {
  const [tab, setTab] = useState<Tab>('transactions')

  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-4">
      <h1 className="text-xl font-semibold">Финансовый трекер</h1>

      <nav className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('transactions')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            tab === 'transactions' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Транзакции
        </button>
        <button
          type="button"
          onClick={() => setTab('categories')}
          className={`flex-1 rounded-md px-3 py-2 text-sm font-medium ${
            tab === 'categories' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
          }`}
        >
          Категории
        </button>
      </nav>

      {tab === 'transactions' ? (
        <>
          <BalanceSummary />
          <TransactionForm />
          <TransactionList />
        </>
      ) : (
        <CategoryManager />
      )}
    </div>
  )
}

export default App
