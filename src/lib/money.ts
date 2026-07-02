/** Форматирует копейки в строку рублей для отображения, напр. 123456 -> "1 234,56 ₽" */
export function formatKopecks(kopecks: number): string {
  const sign = kopecks < 0 ? '-' : ''
  const abs = Math.abs(kopecks)
  const rubles = Math.trunc(abs / 100)
  const fraction = abs % 100

  // toLocaleString использует неразрывный пробел (U+00A0) как разделитель тысяч —
  // заменяем на обычный пробел для предсказуемости.
  const nonBreakingSpace = String.fromCharCode(160)
  const rublesFormatted = rubles.toLocaleString('ru-RU').split(nonBreakingSpace).join(' ')
  const fractionFormatted = fraction.toString().padStart(2, '0')

  return `${sign}${rublesFormatted},${fractionFormatted} ₽`
}

/**
 * Парсит пользовательский ввод суммы в рублях (с запятой или точкой в качестве
 * десятичного разделителя, максимум 2 знака после неё) в целое число копеек.
 * Возвращает null, если ввод некорректен.
 */
export function parseRublesToKopecks(input: string): number | null {
  const normalized = input.trim().replace(',', '.')
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    return null
  }

  const [integerPart, fractionPart = ''] = normalized.split('.')
  const kopecksFraction = fractionPart.padEnd(2, '0')

  return Number(integerPart) * 100 + Number(kopecksFraction)
}
