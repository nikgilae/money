import { useLiveQuery } from 'dexie-react-hooks'
import { listAccounts } from '../db/accounts'

export function useAccounts(includeArchived = false) {
  return useLiveQuery(() => listAccounts(includeArchived), [includeArchived], [])
}
