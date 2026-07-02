import { useLiveQuery } from 'dexie-react-hooks'
import { listCategories } from '../db/categories'
import type { TransactionType } from '../db/types'

export function useCategories(type?: TransactionType) {
  return useLiveQuery(() => listCategories(type), [type], [])
}
