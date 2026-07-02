import type { Category } from './types'

export const defaultCategories: Omit<Category, 'id'>[] = [
  { name: 'Зарплата', type: 'income', icon: '💰', color: '#22c55e' },
  { name: 'Подработка', type: 'income', icon: '🧾', color: '#16a34a' },
  { name: 'Подарки', type: 'income', icon: '🎁', color: '#84cc16' },
  { name: 'Прочие доходы', type: 'income', icon: '➕', color: '#65a30d' },

  { name: 'Продукты', type: 'expense', icon: '🛒', color: '#f97316' },
  { name: 'Транспорт', type: 'expense', icon: '🚌', color: '#3b82f6' },
  { name: 'Жильё', type: 'expense', icon: '🏠', color: '#8b5cf6' },
  { name: 'Кафе и рестораны', type: 'expense', icon: '🍽️', color: '#ec4899' },
  { name: 'Развлечения', type: 'expense', icon: '🎬', color: '#a855f7' },
  { name: 'Здоровье', type: 'expense', icon: '💊', color: '#ef4444' },
  { name: 'Одежда', type: 'expense', icon: '👕', color: '#06b6d4' },
  { name: 'Связь и интернет', type: 'expense', icon: '📱', color: '#6366f1' },
  { name: 'Прочие расходы', type: 'expense', icon: '➖', color: '#78716c' },
]
