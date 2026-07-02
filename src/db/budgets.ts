import { db } from './db'
import type { Budget } from './types'

export function createBudget(budget: Omit<Budget, 'id'>) {
  return db.budgets.add(budget)
}

export function updateBudget(id: number, changes: Partial<Omit<Budget, 'id'>>) {
  return db.budgets.update(id, changes)
}

export function deleteBudget(id: number) {
  return db.budgets.delete(id)
}

export function listBudgets(categoryId?: number) {
  if (categoryId !== undefined) {
    return db.budgets.where('categoryId').equals(categoryId).toArray()
  }
  return db.budgets.toArray()
}
