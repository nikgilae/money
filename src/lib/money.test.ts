import { describe, expect, it } from 'vitest'
import { formatKopecks, parseRublesToKopecks } from './money'

describe('formatKopecks', () => {
  it('форматирует целые рубли без копеек', () => {
    expect(formatKopecks(100000)).toBe('1 000,00 ₽')
  })

  it('форматирует дробную часть с ведущим нулём', () => {
    expect(formatKopecks(100005)).toBe('1 000,05 ₽')
  })

  it('форматирует ноль', () => {
    expect(formatKopecks(0)).toBe('0,00 ₽')
  })

  it('форматирует отрицательную сумму со знаком минус перед числом', () => {
    expect(formatKopecks(-500)).toBe('-5,00 ₽')
  })

  it('расставляет разделители тысяч', () => {
    expect(formatKopecks(123456789)).toBe('1 234 567,89 ₽')
  })
})

describe('parseRublesToKopecks', () => {
  it('парсит целое число рублей', () => {
    expect(parseRublesToKopecks('100')).toBe(10000)
  })

  it('парсит сумму с точкой в качестве разделителя', () => {
    expect(parseRublesToKopecks('99.9')).toBe(9990)
  })

  it('парсит сумму с запятой в качестве разделителя', () => {
    expect(parseRublesToKopecks('99,90')).toBe(9990)
  })

  it('дополняет одну цифру после разделителя нулём', () => {
    expect(parseRublesToKopecks('10,5')).toBe(1050)
  })

  it('возвращает null для пустой строки', () => {
    expect(parseRublesToKopecks('')).toBeNull()
  })

  it('возвращает null для отрицательного числа', () => {
    expect(parseRublesToKopecks('-100')).toBeNull()
  })

  it('возвращает null для более чем двух знаков после разделителя', () => {
    expect(parseRublesToKopecks('10,555')).toBeNull()
  })

  it('возвращает null для нечислового ввода', () => {
    expect(parseRublesToKopecks('abc')).toBeNull()
  })

  it('не теряет точность из-за float на граничных значениях', () => {
    expect(parseRublesToKopecks('0.1')).toBe(10)
    expect(parseRublesToKopecks('0.29')).toBe(29)
  })
})
