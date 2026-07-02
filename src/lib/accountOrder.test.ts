import { describe, expect, it } from 'vitest'
import { getInitialCarouselIndex, sortAccountsForCarousel } from './accountOrder'
import type { Account } from '../db/types'

function account(overrides: Partial<Account>): Account {
  return {
    name: 'Счёт',
    initialBalanceKopecks: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('sortAccountsForCarousel', () => {
  it('сортирует по возрастанию sortOrder', () => {
    const accounts = [account({ id: 1, sortOrder: 2 }), account({ id: 2, sortOrder: 0 }), account({ id: 3, sortOrder: 1 })]
    expect(sortAccountsForCarousel(accounts).map((a) => a.id)).toEqual([2, 3, 1])
  })

  it('счета без sortOrder уходят в конец', () => {
    const accounts = [account({ id: 1 }), account({ id: 2, sortOrder: 0 })]
    expect(sortAccountsForCarousel(accounts).map((a) => a.id)).toEqual([2, 1])
  })

  it('при равном/отсутствующем sortOrder — тай-брейк по id', () => {
    const accounts = [account({ id: 3 }), account({ id: 1 }), account({ id: 2 })]
    expect(sortAccountsForCarousel(accounts).map((a) => a.id)).toEqual([1, 2, 3])
  })

  it('не мутирует исходный массив', () => {
    const accounts = [account({ id: 2, sortOrder: 1 }), account({ id: 1, sortOrder: 0 })]
    const original = [...accounts]
    sortAccountsForCarousel(accounts)
    expect(accounts).toEqual(original)
  })
})

describe('getInitialCarouselIndex', () => {
  it('возвращает индекс счёта с isPrimary', () => {
    const accounts = [account({ id: 1 }), account({ id: 2, isPrimary: true }), account({ id: 3 })]
    expect(getInitialCarouselIndex(accounts)).toBe(1)
  })

  it('фолбэк на 0, если нет primary', () => {
    const accounts = [account({ id: 1 }), account({ id: 2 })]
    expect(getInitialCarouselIndex(accounts)).toBe(0)
  })

  it('фолбэк на 0 для пустого списка', () => {
    expect(getInitialCarouselIndex([])).toBe(0)
  })
})
