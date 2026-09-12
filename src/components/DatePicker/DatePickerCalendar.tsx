import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react'
import { Button } from '../Button'
import { IconButton } from '../IconButton'
import {
  addCivilDays,
  addCivilMonth,
  addCivilMonths,
  civilToEpochDay,
  clampCivilDate,
  compareCivilDates,
  compareCivilMonths,
  daysInMonth,
  firstDayOfWeek,
  formatCivilDate,
  formatCivilMonth,
  formatLocalizedNumber,
  formatIsoDate,
  monthFromDate,
  monthGrid,
  weekdayLabels,
  type CivilDate,
  type CivilMonth,
} from '../../internal/civilDate'

export interface DatePickerCalendarProps {
  readonly id: string
  readonly locale?: string | readonly string[]
  readonly displayedMonth: CivilMonth
  readonly focusedDate: CivilDate
  readonly min: CivilDate
  readonly max: CivilDate
  readonly selectedStart: CivilDate | null
  readonly selectedEnd?: CivilDate | null
  readonly today: CivilDate
  readonly previousMonthLabel: string
  readonly nextMonthLabel: string
  readonly chooseYearLabel: string
  readonly range?: boolean
  readonly readOnly?: boolean
  readonly isDisabled: (date: CivilDate) => boolean
  readonly onDisplayedMonthChange: (month: CivilMonth) => void
  readonly onFocusedDateChange: (date: CivilDate) => void
  readonly onSelect: (date: CivilDate) => void
}

function Chevron({ direction }: { readonly direction: 'previous' | 'next' }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path
        d={direction === 'previous' ? 'm15 18-6-6 6-6' : 'm9 6 6 6-6 6'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function resolveCalendarFocus(
  candidate: CivilDate,
  min: CivilDate,
  max: CivilDate,
): CivilDate {
  return clampCivilDate(candidate, min, max)
}

export function DatePickerCalendar({
  id,
  locale,
  displayedMonth,
  focusedDate,
  min,
  max,
  selectedStart,
  selectedEnd = null,
  today,
  previousMonthLabel,
  nextMonthLabel,
  chooseYearLabel,
  range = false,
  readOnly = false,
  isDisabled,
  onDisplayedMonthChange,
  onFocusedDateChange,
  onSelect,
}: DatePickerCalendarProps) {
  const [yearView, setYearView] = useState(false)
  const dayRefs = useRef(new Map<string, HTMLButtonElement>())
  const requestDomFocus = useRef(false)
  const rangeScrollerRef = useRef<HTMLDivElement | null>(null)
  const rangeScrollTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const firstWeekday = firstDayOfWeek(locale)
  const weekdays = useMemo(() => weekdayLabels(locale), [locale])
  const cells = useMemo(
    () => monthGrid(displayedMonth, firstWeekday),
    [displayedMonth, firstWeekday],
  )
  const todayIso = formatIsoDate(today)
  const focusedIso = formatIsoDate(focusedDate)
  const selectedStartDay = selectedStart ? civilToEpochDay(selectedStart) : null
  const selectedEndDay = selectedEnd ? civilToEpochDay(selectedEnd) : null
  const minMonth = useMemo(() => monthFromDate(min), [min.month, min.year])
  const maxMonth = useMemo(() => monthFromDate(max), [max.month, max.year])
  const renderedMonths = useMemo(() => {
    if (!range) return [{ month: displayedMonth, cells }]
    return [-1, 0, 1]
      .map((offset) => addCivilMonth(displayedMonth, offset))
      .filter((month) => compareCivilMonths(month, minMonth) >= 0 && compareCivilMonths(month, maxMonth) <= 0)
      .map((month) => ({ month, cells: monthGrid(month, firstWeekday) }))
  }, [cells, displayedMonth, firstWeekday, maxMonth, minMonth, range])

  useLayoutEffect(() => {
    if (!range) return
    const scroller = rangeScrollerRef.current
    const current = scroller?.querySelector<HTMLElement>(`[data-m3e-month="${displayedMonth.year}-${displayedMonth.month}"]`)
    if (scroller && current) scroller.scrollTop = current.offsetTop
  }, [displayedMonth.month, displayedMonth.year, maxMonth.month, maxMonth.year, minMonth.month, minMonth.year, range])

  useEffect(() => () => {
    if (rangeScrollTimer.current !== undefined) clearTimeout(rangeScrollTimer.current)
  }, [])

  useEffect(() => {
    const resolved = resolveCalendarFocus(focusedDate, min, max)
    if (formatIsoDate(resolved) !== focusedIso) {
      onFocusedDateChange(resolved)
      onDisplayedMonthChange(monthFromDate(resolved))
    }
  }, [focusedDate, focusedIso, max, min, onDisplayedMonthChange, onFocusedDateChange])

  useEffect(() => {
    if (!requestDomFocus.current) return
    requestDomFocus.current = false
    dayRefs.current.get(focusedIso)?.focus()
  }, [displayedMonth, focusedIso])

  const moveFocus = (candidate: CivilDate) => {
    const next = clampCivilDate(candidate, min, max)
    requestDomFocus.current = true
    onFocusedDateChange(next)
    onDisplayedMonthChange(monthFromDate(next))
  }

  const handleDayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
    let candidate: CivilDate | null = null
    switch (event.key) {
      case 'ArrowLeft':
        candidate = addCivilDays(focusedDate, rtl ? 1 : -1)
        break
      case 'ArrowRight':
        candidate = addCivilDays(focusedDate, rtl ? -1 : 1)
        break
      case 'ArrowUp':
        candidate = addCivilDays(focusedDate, -7)
        break
      case 'ArrowDown':
        candidate = addCivilDays(focusedDate, 7)
        break
      case 'Home': {
        const weekday = civilDateToWeekday(focusedDate)
        candidate = addCivilDays(focusedDate, -((weekday - firstWeekday + 7) % 7))
        break
      }
      case 'End': {
        const weekday = civilDateToWeekday(focusedDate)
        candidate = addCivilDays(focusedDate, 6 - ((weekday - firstWeekday + 7) % 7))
        break
      }
      case 'PageUp':
        candidate = addCivilMonths(focusedDate, event.shiftKey ? -12 : -1)
        break
      case 'PageDown':
        candidate = addCivilMonths(focusedDate, event.shiftKey ? 12 : 1)
        break
      default:
        return
    }
    event.preventDefault()
    if (candidate) moveFocus(candidate)
  }

  return (
    <div className="m3e-date-picker__calendar">
      {!range ? <div className="m3e-date-picker__navigation">
        <IconButton
          aria-label={previousMonthLabel}
          size="extra-small"
          disabled={compareCivilMonths(displayedMonth, minMonth) <= 0}
          onClick={() => {
            const month = addCivilMonth(displayedMonth, -1)
            onDisplayedMonthChange(month)
            onFocusedDateChange(clampCivilDate({ ...month, day: 1 }, min, max))
          }}
        >
          <Chevron direction="previous" />
        </IconButton>
        <Button
          variant="text"
          size="extra-small"
          aria-expanded={yearView}
          aria-controls={`${id}-years`}
          aria-label={`${chooseYearLabel}: ${formatCivilMonth(displayedMonth, locale)}`}
          onClick={() => setYearView((visible) => !visible)}
        >
          <span aria-live="polite">{formatCivilMonth(displayedMonth, locale)}</span>
        </Button>
        <IconButton
          aria-label={nextMonthLabel}
          size="extra-small"
          disabled={compareCivilMonths(displayedMonth, maxMonth) >= 0}
          onClick={() => {
            const month = addCivilMonth(displayedMonth, 1)
            onDisplayedMonthChange(month)
            onFocusedDateChange(clampCivilDate({ ...month, day: 1 }, min, max))
          }}
        >
          <Chevron direction="next" />
        </IconButton>
      </div> : null}

      {yearView && !range ? (
        <div id={`${id}-years`} className="m3e-date-picker__years" role="grid" aria-label={chooseYearLabel}>
          {chunk(Array.from({ length: max.year - min.year + 1 }, (_, index) => min.year + index), 3).map((years) => (
            <div className="m3e-date-picker__year-row" role="row" key={years[0]}>
            {years.map((year) => {
            const disabled = year < min.year || year > max.year
            return (
              <Button
                key={year}
                role="gridcell"
                variant={year === displayedMonth.year ? 'filled' : 'text'}
                size="extra-small"
                disabled={disabled}
                tabIndex={year === displayedMonth.year ? 0 : -1}
                aria-current={year === today.year ? 'date' : undefined}
                onKeyDown={(event) => {
                  const rtl = getComputedStyle(event.currentTarget).direction === 'rtl'
                  const delta = event.key === 'ArrowUp' ? -3
                    : event.key === 'ArrowDown' ? 3
                    : event.key === 'ArrowLeft' ? (rtl ? 1 : -1)
                    : event.key === 'ArrowRight' ? (rtl ? -1 : 1)
                    : event.key === 'Home' ? min.year - year
                    : event.key === 'End' ? max.year - year
                    : 0
                  if (!delta) return
                  event.preventDefault()
                  const nextYear = Math.max(min.year, Math.min(max.year, year + delta))
                  const next = event.currentTarget.parentElement?.parentElement?.querySelector<HTMLButtonElement>(`[data-m3e-year="${nextYear}"]`)
                  next?.focus()
                }}
                data-m3e-year={year}
                onClick={() => {
                  const date = clampCivilDate(addCivilMonths(focusedDate, (year - focusedDate.year) * 12), min, max)
                  onDisplayedMonthChange(monthFromDate(date))
                  onFocusedDateChange(date)
                  setYearView(false)
                }}
              >
                {formatLocalizedNumber(year, locale)}
              </Button>
            )
          })}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="m3e-date-picker__grid"
          role="grid"
          aria-label={formatCivilMonth(displayedMonth, locale)}
          onKeyDown={handleDayKeyDown}
        >
          <div className="m3e-date-picker__weekdays" role="row">
            {weekdays.map((weekday, index) => (
              <div key={`${weekday.long}-${index}`} role="columnheader" aria-label={weekday.long}>
                <span aria-hidden="true">{weekday.short}</span>
              </div>
            ))}
          </div>
          <div
            ref={range ? rangeScrollerRef : undefined}
            className="m3e-date-picker__days"
            data-m3e-range-months={range || undefined}
            onScroll={range ? (event) => {
              if (rangeScrollTimer.current !== undefined) clearTimeout(rangeScrollTimer.current)
              const scroller = event.currentTarget
              rangeScrollTimer.current = setTimeout(() => {
                const candidates = Array.from(scroller.querySelectorAll<HTMLElement>('[data-m3e-month]'))
                const closest = candidates.reduce<HTMLElement | null>((best, candidate) => {
                  if (!best) return candidate
                  return Math.abs(candidate.offsetTop - scroller.scrollTop) < Math.abs(best.offsetTop - scroller.scrollTop)
                    ? candidate
                    : best
                }, null)
                const [year, month] = (closest?.dataset.m3eMonth ?? '').split('-').map(Number)
                if (year && month && (year !== displayedMonth.year || month !== displayedMonth.month)) {
                  onFocusedDateChange(clampCivilDate({
                    year,
                    month,
                    day: Math.min(focusedDate.day, daysInMonth(year, month)),
                  }, min, max))
                  onDisplayedMonthChange({ year, month })
                }
              }, 80)
            } : undefined}
          >
            {renderedMonths.map(({ month, cells: monthCells }) => (
              <div
                key={`${month.year}-${month.month}`}
                className="m3e-date-picker__month"
                data-m3e-month={`${month.year}-${month.month}`}
                role="rowgroup"
              >
              {range ? (
                <div className="m3e-date-picker__month-subhead" role="row">
                  <div role="gridcell" aria-colspan={7}>{formatCivilMonth(month, locale)}</div>
                </div>
              ) : null}
            {chunk(monthCells, 7).map((week, weekIndex) => (
              <div className="m3e-date-picker__week" role="row" key={`week-${weekIndex}`}>
              {week.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} role="gridcell" />
              const iso = formatIsoDate(date)
              const day = civilToEpochDay(date)
              const disabled = isDisabled(date)
              const rangeStart = day === selectedStartDay
              const rangeEnd = day === selectedEndDay
              const selected = rangeStart || rangeEnd
              const inRange = selectedStartDay != null && selectedEndDay != null && day > selectedStartDay && day < selectedEndDay
              return (
                <div
                  key={iso}
                  role="gridcell"
                  aria-selected={selected}
                  className="m3e-date-picker__day-cell"
                  data-m3e-in-range={range && inRange}
                  data-m3e-range-start={range && rangeStart}
                  data-m3e-range-end={range && rangeEnd}
                >
                  <button
                    ref={(node) => {
                      if (node) dayRefs.current.set(iso, node)
                      else dayRefs.current.delete(iso)
                    }}
                    type="button"
                    className="m3e-date-picker__day"
                    tabIndex={iso === focusedIso ? 0 : -1}
                    data-m3e-date-focus={iso === focusedIso || undefined}
                    aria-label={formatCivilDate(date, locale, 'accessible')}
                    aria-disabled={disabled || undefined}
                    aria-current={iso === todayIso ? 'date' : undefined}
                    data-m3e-selected={selected}
                    data-m3e-today={iso === todayIso}
                    data-m3e-disabled={disabled}
                    onFocus={() => onFocusedDateChange(date)}
                    onClick={() => {
                      if (!readOnly && !disabled) onSelect(date)
                    }}
                  >
                    <span className="m3e-date-picker__day-label">
                      {formatLocalizedNumber(date.day, locale)}
                    </span>
                  </button>
                </div>
              )
            })}
              </div>
            ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function chunk<T>(values: readonly T[], size: number): readonly (readonly T[])[] {
  const result: T[][] = []
  for (let index = 0; index < values.length; index += size) result.push(values.slice(index, index + size))
  return result
}

function civilDateToWeekday(date: CivilDate): number {
  return ((civilToEpochDay(date) + 4) % 7 + 7) % 7
}
