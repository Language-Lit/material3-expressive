import {
  addCivilDays,
  addCivilMonths,
  civilToEpochDay,
  epochDayToCivil,
  firstDayOfWeek,
  formatCivilDate,
  formatIsoDate,
  localizedDatePattern,
  monthGrid,
  parseCivilDate,
  parseLocalizedDate,
} from '../../src/internal/civilDate'

describe('civil date arithmetic', () => {
  it('strictly parses real four-digit Gregorian dates', () => {
    expect(parseCivilDate('2024-02-29')).toEqual({ year: 2024, month: 2, day: 29 })
    for (const invalid of ['2023-02-29', '2026-2-01', '26-02-01', '0000-01-01', '2026-13-01', 'abc2026-09-12']) {
      expect(parseCivilDate(invalid), invalid).toBeNull()
    }
  })

  it('round-trips years 1–99 without Date.UTC remapping them to 1901–1999', () => {
    for (const value of ['0001-01-01', '0099-12-31', '1900-01-01', '2000-02-29', '9999-12-31']) {
      const parsed = parseCivilDate(value)!
      expect(formatIsoDate(epochDayToCivil(civilToEpochDay(parsed)))).toBe(value)
    }
  })

  it('crosses leap days, month ends, and years with UTC-only integer arithmetic', () => {
    expect(formatIsoDate(addCivilDays(parseCivilDate('2024-02-28')!, 1))).toBe('2024-02-29')
    expect(formatIsoDate(addCivilDays(parseCivilDate('2024-12-31')!, 1))).toBe('2025-01-01')
    expect(formatIsoDate(addCivilMonths(parseCivilDate('2024-02-29')!, 12))).toBe('2025-02-28')
  })

  it('uses an explicitly Gregorian formatter even for locales with other default calendars', () => {
    expect(formatCivilDate(parseCivilDate('2026-09-12')!, 'th-TH')).toContain('2026')
    expect(formatCivilDate(parseCivilDate('2026-09-12')!, 'fa-IR')).not.toContain('۱۴۰۵')
  })

  it('derives locale order and strictly rejects junk and short years', () => {
    expect(localizedDatePattern('en-US').placeholder).toBe('MM/DD/YYYY')
    expect(parseLocalizedDate('09/12/2026', 'en-US')).toEqual({ year: 2026, month: 9, day: 12 })
    expect(parseLocalizedDate('12.09.2026', 'de-DE')).toEqual({ year: 2026, month: 9, day: 12 })
    expect(parseLocalizedDate('abc9/12/2026', 'en-US')).toBeNull()
    expect(parseLocalizedDate('9/12/26', 'en-US')).toBeNull()
  })

  it('honors locale first-weekday data and the fw Unicode extension', () => {
    expect(firstDayOfWeek('en-US')).toBe(0)
    expect(firstDayOfWeek('de-DE')).toBe(1)
    expect(firstDayOfWeek('zh-CN')).toBe(1)
    expect(firstDayOfWeek('dv-MV')).toBe(5)
    expect(firstDayOfWeek('en-US-u-fw-mon')).toBe(1)
    expect(monthGrid({ year: 2026, month: 9 }, firstDayOfWeek('en-US')).slice(0, 2)).toEqual([null, null])
  })

  it('uses en-US deterministically when locale is omitted or invalid', () => {
    expect(localizedDatePattern().placeholder).toBe('MM/DD/YYYY')
    expect(localizedDatePattern('not-a-locale').placeholder).toBe('MM/DD/YYYY')
  })
})
