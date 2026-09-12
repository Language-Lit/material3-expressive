export type ParsedTime = {
  readonly hour: number
  readonly minute: number
}

const TIME_VALUE_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

export function isTimeValue(value: string): boolean {
  return TIME_VALUE_PATTERN.test(value)
}

export function parseTimeValue(value: string): ParsedTime | null {
  if (!isTimeValue(value)) return null
  return {
    hour: Number(value.slice(0, 2)),
    minute: Number(value.slice(3, 5)),
  }
}

export function serializeTime({ hour, minute }: ParsedTime): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function timeToMinutes(value: ParsedTime): number {
  return value.hour * 60 + value.minute
}

export function hasValidBounds(min: string | undefined, max: string | undefined): boolean {
  const parsedMin = min === undefined ? null : parseTimeValue(min)
  const parsedMax = max === undefined ? null : parseTimeValue(max)
  if (min !== undefined && parsedMin === null) return false
  if (max !== undefined && parsedMax === null) return false
  return !parsedMin || !parsedMax || timeToMinutes(parsedMin) <= timeToMinutes(parsedMax)
}

export function isTimeWithinBounds(
  value: ParsedTime,
  min: string | undefined,
  max: string | undefined,
): boolean {
  if (!hasValidBounds(min, max)) return false
  const minutes = timeToMinutes(value)
  const parsedMin = min === undefined ? null : parseTimeValue(min)
  const parsedMax = max === undefined ? null : parseTimeValue(max)
  return (
    (parsedMin === null || minutes >= timeToMinutes(parsedMin)) &&
    (parsedMax === null || minutes <= timeToMinutes(parsedMax))
  )
}

export function nearestMinuteInHour(
  hour: number,
  preferredMinute: number,
  min: string | undefined,
  max: string | undefined,
): number | null {
  let nearest: number | null = null
  let distance = Number.POSITIVE_INFINITY
  for (let minute = 0; minute < 60; minute += 1) {
    if (!isTimeWithinBounds({ hour, minute }, min, max)) continue
    const nextDistance = Math.abs(preferredMinute - minute)
    if (nextDistance < distance) {
      nearest = minute
      distance = nextDistance
    }
  }
  return nearest
}

export function nearestTimeInPeriod(
  value: ParsedTime,
  afternoon: boolean,
  min: string | undefined,
  max: string | undefined,
): ParsedTime | null {
  const target = { ...value, hour: (value.hour + 12) % 24 }
  let nearest: ParsedTime | null = null
  let distance = Number.POSITIVE_INFINITY
  for (let hour = afternoon ? 12 : 0; hour < (afternoon ? 24 : 12); hour += 1) {
    for (let minute = 0; minute < 60; minute += 1) {
      const candidate = { hour, minute }
      if (!isTimeWithinBounds(candidate, min, max)) continue
      const nextDistance = Math.abs(timeToMinutes(candidate) - timeToMinutes(target))
      if (nextDistance < distance) {
        nearest = candidate
        distance = nextDistance
      }
    }
  }
  return nearest
}

export function validationMessage(
  value: string,
  min: string | undefined,
  max: string | undefined,
  required: boolean,
): string {
  if (!hasValidBounds(min, max)) {
    return 'Minimum time must not be later than maximum time, and both bounds must use HH:mm.'
  }
  if (value.length === 0) return required ? 'Select a time.' : ''
  const parsed = parseTimeValue(value)
  if (!parsed) return 'Enter a time in 24-hour HH:mm format.'
  if (!isTimeWithinBounds(parsed, min, max)) {
    if (min && max) return `Select a time from ${min} through ${max}.`
    if (min) return `Select a time at or after ${min}.`
    if (max) return `Select a time at or before ${max}.`
  }
  return ''
}

export function resolvedLocale(locale: string | readonly string[] | undefined): string | string[] {
  return locale === undefined ? 'en-US' : typeof locale === 'string' ? locale : [...locale]
}

export function resolvedHour12(
  locale: string | readonly string[] | undefined,
  hour12: boolean | undefined,
): boolean {
  if (hour12 !== undefined) return hour12
  try {
    return (
      new Intl.DateTimeFormat(resolvedLocale(locale), { hour: 'numeric' }).resolvedOptions()
        .hour12 ?? true
    )
  } catch {
    return true
  }
}

export function formatDialNumber(
  value: number,
  locale: string | readonly string[] | undefined,
  minimumIntegerDigits = 1,
): string {
  try {
    return new Intl.NumberFormat(resolvedLocale(locale), {
      useGrouping: false,
      minimumIntegerDigits,
    }).format(value)
  } catch {
    return String(value).padStart(minimumIntegerDigits, '0')
  }
}

function localizedDigitEntries(
  locale: string | readonly string[] | undefined,
): readonly (readonly [string, string])[] {
  try {
    const formatter = new Intl.NumberFormat(resolvedLocale(locale), { useGrouping: false })
    return Array.from({ length: 10 }, (_, digit) => [formatter.format(digit), String(digit)] as const)
  } catch {
    return Array.from({ length: 10 }, (_, digit) => [String(digit), String(digit)] as const)
  }
}

/** Converts digits for the active locale to the ASCII civil-value boundary. */
export function normalizeTimeDigits(
  value: string,
  locale: string | readonly string[] | undefined,
): string {
  return localizedDigitEntries(locale).reduce(
    (result, [localized, ascii]) => result.split(localized).join(ascii),
    value,
  )
}

/** Formats ASCII digits for display without changing separators or draft text. */
export function localizeTimeDigits(
  value: string,
  locale: string | readonly string[] | undefined,
): string {
  const entries = localizedDigitEntries(locale)
  return value.replace(/\d/g, (digit) => entries[Number(digit)]?.[0] ?? digit)
}

export function periodLabels(locale: string | readonly string[] | undefined): readonly [string, string] {
  try {
    const formatter = new Intl.DateTimeFormat(resolvedLocale(locale), {
      hour: 'numeric',
      hour12: true,
      timeZone: 'UTC',
    })
    const label = (hour: number) =>
      formatter.formatToParts(new Date(Date.UTC(2000, 0, 1, hour))).find(
        (part) => part.type === 'dayPeriod',
      )?.value
    return [label(1) ?? 'AM', label(13) ?? 'PM']
  } catch {
    return ['AM', 'PM']
  }
}
