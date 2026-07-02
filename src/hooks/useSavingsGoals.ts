import { useLiveQuery } from 'dexie-react-hooks'
import { listSavingsGoals } from '../db/savingsGoals'

export function useSavingsGoals() {
  return useLiveQuery(() => listSavingsGoals(), [], [])
}
