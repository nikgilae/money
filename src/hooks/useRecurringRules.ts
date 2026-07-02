import { useLiveQuery } from 'dexie-react-hooks'
import { listRecurringRules } from '../db/recurringRules'

export function useRecurringRules(activeOnly?: boolean) {
  return useLiveQuery(() => listRecurringRules(activeOnly), [activeOnly], [])
}
