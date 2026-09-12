export interface CivilDate {
  readonly year: number
  readonly month: number
  readonly day: number
}

export interface CivilMonth {
  readonly year: number
  readonly month: number
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_MS = 86_400_000

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function daysInMonth(year: number, month: number): number {
  if (month === 2) return isLeapYear(year) ? 29 : 28
  return month === 4 || month === 6 || month === 9 || month === 11 ? 30 : 31
}

export function parseCivilDate(value: string): CivilDate | null {
  const match = ISO_DATE.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    return null
  }
  return { year, month, day }
}

export function formatIsoDate({ year, month, day }: CivilDate): string {
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** UTC is used only as an integer Gregorian calendar engine. Calling
 * setUTCFullYear after construction avoids Date.UTC's year-0–99 remapping. */
export function civilToEpochDay(date: CivilDate): number {
  const value = new Date(0)
  value.setUTCHours(0, 0, 0, 0)
  value.setUTCFullYear(date.year, date.month - 1, date.day)
  return Math.floor(value.getTime() / DAY_MS)
}

export function epochDayToCivil(epochDay: number): CivilDate {
  const value = new Date(epochDay * DAY_MS)
  return {
    year: value.getUTCFullYear(),
    month: value.getUTCMonth() + 1,
    day: value.getUTCDate(),
  }
}

export function compareCivilDates(left: CivilDate, right: CivilDate): number {
  return civilToEpochDay(left) - civilToEpochDay(right)
}

export function addCivilDays(date: CivilDate, days: number): CivilDate {
  return epochDayToCivil(civilToEpochDay(date) + days)
}

export function addCivilMonths(date: CivilDate, months: number): CivilDate {
  const monthIndex = date.year * 12 + date.month - 1 + months
  const year = Math.floor(monthIndex / 12)
  const month = monthIndex - year * 12 + 1
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) }
}

export function monthFromDate(date: CivilDate): CivilMonth {
  return { year: date.year, month: date.month }
}

export function compareCivilMonths(left: CivilMonth, right: CivilMonth): number {
  return left.year * 12 + left.month - (right.year * 12 + right.month)
}

export function addCivilMonth(month: CivilMonth, amount: number): CivilMonth {
  const index = month.year * 12 + month.month - 1 + amount
  const year = Math.floor(index / 12)
  return { year, month: index - year * 12 + 1 }
}

export function clampCivilDate(date: CivilDate, min: CivilDate, max: CivilDate): CivilDate {
  if (compareCivilDates(date, min) < 0) return min
  if (compareCivilDates(date, max) > 0) return max
  return date
}

export function todayUtcCivilDate(): CivilDate {
  const now = new Date()
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() }
}

function gregorianFormatter(
  locale: string | readonly string[] | undefined,
  options: Intl.DateTimeFormatOptions,
): Intl.DateTimeFormat {
  const locales = normalizedLocales(locale)
  try {
    return new Intl.DateTimeFormat(locales, {
      ...options,
      calendar: 'gregory',
      timeZone: 'UTC',
    })
  } catch {
    return new Intl.DateTimeFormat('en', {
      ...options,
      calendar: 'gregory',
      timeZone: 'UTC',
    })
  }
}

export function civilDateToDate(date: CivilDate): Date {
  const value = new Date(0)
  value.setUTCHours(0, 0, 0, 0)
  value.setUTCFullYear(date.year, date.month - 1, date.day)
  return value
}

export function formatCivilDate(
  date: CivilDate,
  locale?: string | readonly string[],
  style: 'field' | 'accessible' = 'field',
): string {
  return gregorianFormatter(locale, style === 'accessible'
    ? { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }
    : { year: 'numeric', month: 'short', day: 'numeric' }).format(civilDateToDate(date))
}

export function formatCivilMonth(month: CivilMonth, locale?: string | readonly string[]): string {
  return gregorianFormatter(locale, { year: 'numeric', month: 'long' }).format(
    civilDateToDate({ ...month, day: 1 }),
  )
}

export function formatLocalizedNumber(value: number, locale?: string | readonly string[]): string {
  try {
    return new Intl.NumberFormat(normalizedLocales(locale), { useGrouping: false }).format(value)
  } catch {
    return new Intl.NumberFormat('en-US', { useGrouping: false }).format(value)
  }
}

export function formatLocalizedPaddedNumber(
  value: number,
  width: number,
  locale?: string | readonly string[],
): string {
  try {
    return new Intl.NumberFormat(normalizedLocales(locale), {
      useGrouping: false,
      minimumIntegerDigits: width,
    }).format(value)
  } catch {
    return String(value).padStart(width, '0')
  }
}

export interface LocalizedDatePattern {
  readonly placeholder: string
  readonly order: readonly ('day' | 'month' | 'year')[]
  readonly separator: string
}

export function localizedDatePattern(locale?: string | readonly string[]): LocalizedDatePattern {
  const parts = gregorianFormatter(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(civilDateToDate({ year: 2006, month: 11, day: 22 }))
  const order = parts
    .filter((part) => part.type === 'day' || part.type === 'month' || part.type === 'year')
    .map((part) => part.type as 'day' | 'month' | 'year')
  const separator = parts.find((part) => part.type === 'literal')?.value.trim() || '/'
  const labels = { day: 'DD', month: 'MM', year: 'YYYY' }
  return { order, separator, placeholder: order.map((part) => labels[part]).join(separator) }
}

export function parseLocalizedDate(
  value: string,
  locale?: string | readonly string[],
): CivilDate | null {
  const iso = parseCivilDate(value.trim())
  if (iso) return iso
  const digits = stripBidiMarks(normalizeLocalizedDigits(value.trim(), locale))
  const pattern = localizedDatePattern(locale)
  const separator = escapeRegExp(stripBidiMarks(pattern.separator))
  const fields = pattern.order.map((part) => part === 'year' ? '(\\d{4})' : '(\\d{1,2})')
  const match = new RegExp(`^${fields.join(`\\s*${separator}\\s*`)}$`).exec(digits)
  if (!match) return null
  const numbers = match.slice(1)
  const record: Partial<Record<'day' | 'month' | 'year', number>> = {}
  pattern.order.forEach((part, index) => { record[part] = Number(numbers[index]) })
  if (record.year === undefined || record.month === undefined || record.day === undefined) return null
  return parseCivilDate(formatIsoDate({ year: record.year, month: record.month, day: record.day }))
}

function normalizeLocalizedDigits(value: string, locale?: string | readonly string[]): string {
  let result = value
  try {
    const formatter = new Intl.NumberFormat(normalizedLocales(locale), { useGrouping: false })
    for (let digit = 0; digit <= 9; digit += 1) {
      result = result.split(formatter.format(digit)).join(String(digit))
    }
  } catch {
    // Invalid locale input falls back to accepting ASCII digits.
  }
  return result
}

// Unicode CLDR 48 weekData.json, revision
// 4d06be52b51bb2f75688d0abe55c52a66afed790, blob
// 9bb18ddf399bf8a07775d6d4951b04c653e93115, accessed 2026-09-12.
// Intl.Locale weekInfo is authoritative when present; these sets are the
// complete non-Monday regional fallback from that pinned file.
const SUNDAY_FIRST_REGIONS = new Set([
  'AG', 'AS', 'BD', 'BR', 'BS', 'BT', 'BW', 'BZ', 'CA', 'CO', 'DM', 'DO',
  'ET', 'GT', 'GU', 'HK', 'HN', 'ID', 'IL', 'IN', 'IS', 'JM', 'JP', 'KE', 'KH', 'KR',
  'LA', 'MH', 'MM', 'MO', 'MT', 'MX', 'MZ', 'NI', 'NP', 'PA', 'PE', 'PH', 'PK',
  'PR', 'PT', 'PY', 'SA', 'SG', 'SV', 'TH', 'TT', 'TW', 'UM', 'US', 'VE', 'VI',
  'WS', 'YE', 'ZA', 'ZW',
])
const SATURDAY_FIRST_REGIONS = new Set(['AF', 'BH', 'DJ', 'DZ', 'EG', 'IQ', 'IR', 'JO', 'KW', 'LY', 'OM', 'QA', 'SD', 'SY'])

export function firstDayOfWeek(locale?: string | readonly string[]): number {
  try {
    const source = Array.isArray(locale) ? locale[0] : locale
    const localeValue = new Intl.Locale(source || 'en-US')
    const explicitFirstDay = /-u(?:-[a-z0-9]{2,8})*-fw-(sun|mon|tue|wed|thu|fri|sat)(?:-|$)/i.exec(localeValue.toString())?.[1]?.toLowerCase()
    if (explicitFirstDay) return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(explicitFirstDay)
    const weekInfo = (localeValue as Intl.Locale & {
      getWeekInfo?: () => { firstDay: number }
      weekInfo?: { firstDay: number }
    }).getWeekInfo?.() ?? (localeValue as Intl.Locale & { weekInfo?: { firstDay: number } }).weekInfo
    if (weekInfo) return weekInfo.firstDay % 7
    const region = localeValue.maximize().region
    if (region === 'MV') return 5
    if (region && SATURDAY_FIRST_REGIONS.has(region)) return 6
    if (region && SUNDAY_FIRST_REGIONS.has(region)) return 0
  } catch {
    // Invalid locale input follows the Monday default.
  }
  return 1
}

export function weekdayLabels(locale?: string | readonly string[]): readonly { short: string; long: string }[] {
  const first = firstDayOfWeek(locale)
  const short = gregorianFormatter(locale, { weekday: 'narrow' })
  const long = gregorianFormatter(locale, { weekday: 'long' })
  // 2023-01-01 is a Sunday.
  return Array.from({ length: 7 }, (_, index) => {
    const date = addCivilDays({ year: 2023, month: 1, day: 1 }, (first + index) % 7)
    const instant = civilDateToDate(date)
    return { short: short.format(instant), long: long.format(instant) }
  })
}

function normalizedLocales(locale: string | readonly string[] | undefined): string | string[] {
  if (locale === undefined) return 'en-US'
  return typeof locale === 'string' ? locale : Array.from(locale)
}

function stripBidiMarks(value: string): string {
  return value.replace(/[\u061c\u200e\u200f]/g, '')
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function monthGrid(month: CivilMonth, firstWeekday: number): readonly (CivilDate | null)[] {
  const firstDate = { ...month, day: 1 }
  const weekday = new Date(civilDateToDate(firstDate)).getUTCDay()
  const leading = (weekday - firstWeekday + 7) % 7
  const result: (CivilDate | null)[] = Array.from({ length: leading }, () => null)
  for (let day = 1; day <= daysInMonth(month.year, month.month); day += 1) {
    result.push({ ...month, day })
  }
  while (result.length < 42) result.push(null)
  return result
}
