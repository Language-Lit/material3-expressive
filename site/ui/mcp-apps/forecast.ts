/**
 * The demo's data: a deterministic five-day forecast per city, so a run is
 * repeatable and the playground needs no network.
 */
export interface ForecastDay {
  readonly date: string
  readonly weekday: string
  readonly high: number
  readonly low: number
  readonly condition: 'Sunny' | 'Cloudy' | 'Showers' | 'Windy' | 'Storms'
  readonly precipitation: number
}

export interface Forecast {
  readonly city: string
  readonly unit: 'C'
  readonly updatedAt: string
  readonly days: readonly ForecastDay[]
}

const CONDITIONS: readonly ForecastDay['condition'][] = ['Sunny', 'Cloudy', 'Showers', 'Windy', 'Storms']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function hash(text: string): number {
  let value = 2166136261
  for (const char of text) {
    value ^= char.charCodeAt(0)
    value = Math.imul(value, 16777619)
  }
  return value >>> 0
}

export function forecastFor(city: string, seed = 0): Forecast {
  const base = hash(`${city.toLowerCase()}:${seed}`)
  const start = new Date(Date.UTC(2026, 8, 14))
  const days = Array.from({ length: 5 }, (_, index) => {
    const value = (base >>> (index * 5)) & 0x1f
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() + index)
    const high = 14 + (value % 17)
    return {
      date: date.toISOString().slice(0, 10),
      weekday: WEEKDAYS[date.getUTCDay()] ?? '',
      high,
      low: high - 5 - (value % 6),
      condition: CONDITIONS[(value + index) % CONDITIONS.length] ?? 'Sunny',
      precipitation: (value * 7 + index * 13) % 100,
    }
  })
  return { city, unit: 'C', updatedAt: new Date().toISOString(), days }
}
