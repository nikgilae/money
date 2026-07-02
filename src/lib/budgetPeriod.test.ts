import { describe, expect, it } from 'vitest'
import { getCurrentPeriodRange } from './budgetPeriod'

describe('getCurrentPeriodRange', () => {
  describe('monthly', () => {
    it('возвращает границы календарного месяца', () => {
      expect(getCurrentPeriodRange('monthly', '2026-07-15')).toEqual({
        from: '2026-07-01',
        to: '2026-07-31',
      })
    })

    it('корректно определяет последний день для короткого месяца (февраль)', () => {
      expect(getCurrentPeriodRange('monthly', '2026-02-10')).toEqual({
        from: '2026-02-01',
        to: '2026-02-28',
      })
    })

    it('корректно определяет последний день февраля в високосный год', () => {
      expect(getCurrentPeriodRange('monthly', '2028-02-10')).toEqual({
        from: '2028-02-01',
        to: '2028-02-29',
      })
    })

    it('не съезжает на границе начала месяца', () => {
      expect(getCurrentPeriodRange('monthly', '2026-01-01')).toEqual({
        from: '2026-01-01',
        to: '2026-01-31',
      })
    })

    it('не съезжает на границе конца месяца', () => {
      expect(getCurrentPeriodRange('monthly', '2026-12-31')).toEqual({
        from: '2026-12-01',
        to: '2026-12-31',
      })
    })
  })

  describe('yearly', () => {
    it('возвращает границы календарного года', () => {
      expect(getCurrentPeriodRange('yearly', '2026-07-15')).toEqual({
        from: '2026-01-01',
        to: '2026-12-31',
      })
    })
  })

  describe('weekly', () => {
    it('возвращает понедельник-воскресенье для дня в середине недели', () => {
      // 2026-07-02 — четверг
      expect(getCurrentPeriodRange('weekly', '2026-07-02')).toEqual({
        from: '2026-06-29',
        to: '2026-07-05',
      })
    })

    it('не съезжает, если опорная дата — понедельник', () => {
      expect(getCurrentPeriodRange('weekly', '2026-06-29')).toEqual({
        from: '2026-06-29',
        to: '2026-07-05',
      })
    })

    it('не съезжает, если опорная дата — воскресенье', () => {
      expect(getCurrentPeriodRange('weekly', '2026-07-05')).toEqual({
        from: '2026-06-29',
        to: '2026-07-05',
      })
    })

    it('корректно переходит через границу месяца', () => {
      // 2026-07-31 — пятница
      expect(getCurrentPeriodRange('weekly', '2026-07-31')).toEqual({
        from: '2026-07-27',
        to: '2026-08-02',
      })
    })
  })

  it('использует сегодняшнюю дату по умолчанию', () => {
    const range = getCurrentPeriodRange('yearly')
    const currentYear = new Date().getUTCFullYear().toString()
    expect(range.from.startsWith(currentYear)).toBe(true)
  })
})
