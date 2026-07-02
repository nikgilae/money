import { useLiveQuery } from 'dexie-react-hooks'
import { listBudgets } from '../db/budgets'

export function useBudgets(categoryId?: number) {
  return useLiveQuery(() => listBudgets(categoryId), [categoryId], [])
}
