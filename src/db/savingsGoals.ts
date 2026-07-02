import { db } from './db'
import type { SavingsGoal } from './types'

export function createSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentKopecks'>) {
  return db.savingsGoals.add({ ...goal, currentKopecks: 0, createdAt: new Date().toISOString() })
}

export function updateSavingsGoal(id: number, changes: Partial<Omit<SavingsGoal, 'id' | 'createdAt'>>) {
  return db.savingsGoals.update(id, changes)
}

export function deleteSavingsGoal(id: number) {
  return db.savingsGoals.delete(id)
}

export function listSavingsGoals() {
  return db.savingsGoals.toArray()
}

export async function depositToGoal(id: number, amountKopecks: number) {
  const goal = await db.savingsGoals.get(id)
  if (!goal) return
  await db.savingsGoals.update(id, { currentKopecks: goal.currentKopecks + amountKopecks })
}

export async function withdrawFromGoal(id: number, amountKopecks: number) {
  const goal = await db.savingsGoals.get(id)
  if (!goal) return
  await db.savingsGoals.update(id, { currentKopecks: Math.max(0, goal.currentKopecks - amountKopecks) })
}
