import { useLiveQuery } from 'dexie-react-hooks'
import { listTransactions, type TransactionFilter } from '../db/transactions'

export function useTransactions(filter: TransactionFilter = {}) {
  return useLiveQuery(
    () => listTransactions(filter),
    [filter.from, filter.to, filter.categoryId],
    [],
  )
}
