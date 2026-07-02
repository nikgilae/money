import { useLiveQuery } from 'dexie-react-hooks'
import { listTransferLegs } from '../db/transactions'

export function useTransferLegs() {
  return useLiveQuery(() => listTransferLegs(), [], [])
}
