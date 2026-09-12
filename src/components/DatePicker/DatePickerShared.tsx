import {
  useEffect,
  useRef,
  useState,
  type FocusEventHandler,
  type FormEventHandler,
  type ReactNode,
  type RefObject,
} from 'react'
import { createPortal } from 'react-dom'
import { useAnchoredOverlay } from '../../internal/useAnchoredOverlay'
import { usePortalThemeScope } from '../../theme/contexts'
import {
  clampCivilDate,
  compareCivilDates,
  formatCivilDate,
  formatIsoDate,
  formatLocalizedPaddedNumber,
  localizedDatePattern,
  monthFromDate,
  parseCivilDate,
  parseLocalizedDate,
  type CivilDate,
  type CivilMonth,
} from '../../internal/civilDate'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import { IconButton } from '../IconButton'
import { TextField } from '../TextField'
import { DatePickerCalendar } from './DatePickerCalendar'
import type {
  DatePickerFieldVariant,
  DatePickerLabels,
  DatePickerMode,
  DatePickerPresentation,
} from './DatePicker.types'

export const DEFAULT_DATE_PICKER_LABELS: DatePickerLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  chooseYear: 'Choose year',
  switchToInput: 'Switch to text input',
  switchToCalendar: 'Switch to calendar',
  dateInput: 'Date',
  startDateInput: 'Start date',
  endDateInput: 'End date',
  invalidDate: 'Enter a valid date.',
  dateOutOfRange: 'Date is outside the allowed range.',
  dateUnavailable: 'Date is unavailable.',
  rangeOutOfOrder: 'End date must not be before start date.',
}

export const DEFAULT_MIN_DATE = '1900-01-01'
export const DEFAULT_MAX_DATE = '2100-12-31'

export interface ResolvedDateBounds {
  readonly min: CivilDate
  readonly max: CivilDate
  readonly minIso: string
  readonly maxIso: string
  readonly invalid: boolean
}

export function resolveDateBounds(minValue?: string, maxValue?: string): ResolvedDateBounds {
  const defaultMin = parseCivilDate(DEFAULT_MIN_DATE) as CivilDate
  const defaultMax = parseCivilDate(DEFAULT_MAX_DATE) as CivilDate
  const parsedMin = minValue === undefined ? defaultMin : parseCivilDate(minValue)
  const parsedMax = maxValue === undefined ? defaultMax : parseCivilDate(maxValue)
  const invalid = !parsedMin || !parsedMax || compareCivilDates(parsedMin, parsedMax) > 0
  const safeMin = parsedMin ?? defaultMin
  const safeMax = parsedMax ?? defaultMax
  return invalid
    ? { min: defaultMin, max: defaultMax, minIso: DEFAULT_MIN_DATE, maxIso: DEFAULT_MAX_DATE, invalid: true }
    : { min: safeMin, max: safeMax, minIso: formatIsoDate(safeMin), maxIso: formatIsoDate(safeMax), invalid: false }
}

export type DateValidation = 'valid' | 'empty' | 'invalid' | 'range' | 'disabled'

export function validateDate(
  value: string,
  bounds: ResolvedDateBounds,
  isDisabled: (date: CivilDate) => boolean,
): DateValidation {
  if (bounds.invalid) return 'invalid'
  if (value === '') return 'empty'
  const date = parseCivilDate(value)
  if (!date) return 'invalid'
  if (compareCivilDates(date, bounds.min) < 0 || compareCivilDates(date, bounds.max) > 0) return 'range'
  if (isDisabled(date)) return 'disabled'
  return 'valid'
}

export function validationMessage(validation: DateValidation, labels: DatePickerLabels): string {
  if (validation === 'invalid') return labels.invalidDate
  if (validation === 'range') return labels.dateOutOfRange
  if (validation === 'disabled') return labels.dateUnavailable
  return ''
}

export function CalendarGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path d="M7 3v3m10-3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EditGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
      <path d="m4 16-.8 4 4-.8L18.4 8 16 5.6 4 16Zm10.6-8.6 2.4 2.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export interface DateFormControlProps {
  readonly controlRef?: RefObject<HTMLInputElement | null>
  readonly value: string
  readonly name?: string
  readonly form?: string
  readonly min: string
  readonly max: string
  readonly required?: boolean
  readonly disabled?: boolean
  readonly validation: DateValidation
  readonly message: string
  readonly customValidity?: string
  readonly onReset: () => void
  readonly onInvalidFocus: () => void
  readonly onInvalid?: FormEventHandler<HTMLInputElement>
}

export function DateFormControl({
  controlRef: externalRef,
  value,
  name,
  form,
  min,
  max,
  required,
  disabled,
  validation,
  message,
  customValidity,
  onReset,
  onInvalidFocus,
  onInvalid,
}: DateFormControlProps) {
  const localRef = useRef<HTMLInputElement | null>(null)
  const ref = externalRef ?? localRef
  useEffect(() => {
    const input = ref.current
    if (!input) return
    const invalid = validation !== 'valid' && validation !== 'empty'
    input.setCustomValidity(invalid ? message : (customValidity ?? ''))
  }, [customValidity, message, ref, validation, value])
  useEffect(() => {
    const formElement = ref.current?.form
    if (!formElement) return
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (!event.defaultPrevented) onReset()
      })
    }
    formElement.addEventListener('reset', handleReset)
    return () => formElement.removeEventListener('reset', handleReset)
  }, [form, onReset, ref])
  return (
    <input
      ref={ref}
      className="m3e-date-picker__form-control"
      type="date"
      tabIndex={-1}
      aria-hidden="true"
      name={name}
      form={form}
      value={parseCivilDate(value) ? value : ''}
      min={min}
      max={max}
      required={required}
      disabled={disabled}
      onChange={() => undefined}
      onInvalid={(event) => {
        onInvalid?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        onInvalidFocus()
      }}
    />
  )
}

export interface DateTextInputProps {
  readonly id: string
  readonly label: ReactNode
  readonly value: string
  readonly locale?: string | readonly string[]
  readonly fieldVariant: DatePickerFieldVariant
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly validation: DateValidation
  readonly message: string
  readonly onValueChange: (value: string) => void
  readonly onBlur?: FocusEventHandler<HTMLInputElement>
}

export function DateTextInput({
  id,
  label,
  value,
  locale,
  fieldVariant,
  disabled,
  readOnly,
  validation,
  message,
  onValueChange,
  onBlur,
}: DateTextInputProps) {
  const pattern = localizedDatePattern(locale)
  const date = parseCivilDate(value)
  const [text, setText] = useState(() => date ? formatInputDate(date, locale) : value)
  useEffect(() => setText(date ? formatInputDate(date, locale) : value), [locale, value])
  const invalid = validation !== 'valid' && validation !== 'empty'
  return (
    <TextField
      id={id}
      label={label}
      variant={fieldVariant}
      value={text}
      placeholder={pattern.placeholder}
      inputMode="numeric"
      disabled={disabled}
      readOnly={readOnly}
      error={invalid}
      supportingText={invalid ? message : undefined}
      onChange={(event) => {
        const next = event.currentTarget.value
        setText(next)
        const parsed = parseLocalizedDate(next, locale)
        onValueChange(parsed ? formatIsoDate(parsed) : next)
      }}
      onBlur={onBlur}
    />
  )
}

function formatInputDate(date: CivilDate, locale?: string | readonly string[]): string {
  const pattern = localizedDatePattern(locale)
  const values = {
    day: formatLocalizedPaddedNumber(date.day, 2, locale),
    month: formatLocalizedPaddedNumber(date.month, 2, locale),
    year: formatLocalizedPaddedNumber(date.year, 4, locale),
  }
  return pattern.order.map((part) => values[part]).join(pattern.separator)
}

export interface PickerPanelProps {
  readonly id: string
  readonly locale?: string | readonly string[]
  readonly mode: DatePickerMode
  readonly onModeChange: (mode: DatePickerMode) => void
  readonly labels: DatePickerLabels
  readonly displayedMonth: CivilMonth
  readonly focusedDate: CivilDate
  readonly min: CivilDate
  readonly max: CivilDate
  readonly selectedStart: CivilDate | null
  readonly selectedEnd?: CivilDate | null
  readonly range?: boolean
  readonly today: CivilDate
  readonly readOnly?: boolean
  readonly isDisabled: (date: CivilDate) => boolean
  readonly onDisplayedMonthChange: (month: CivilMonth) => void
  readonly onFocusedDateChange: (date: CivilDate) => void
  readonly onSelect: (date: CivilDate) => void
  readonly input: ReactNode
  readonly headline: ReactNode
}

export function PickerPanel(props: PickerPanelProps) {
  return (
    <div className="m3e-date-picker__panel" data-m3e-mode={props.mode}>
      <div className="m3e-date-picker__header">
        <div className="m3e-date-picker__headline">{props.headline}</div>
        <IconButton
          aria-label={props.mode === 'calendar' ? props.labels.switchToInput : props.labels.switchToCalendar}
          size="extra-small"
          onClick={() => props.onModeChange(props.mode === 'calendar' ? 'input' : 'calendar')}
        >
          {props.mode === 'calendar' ? <EditGlyph /> : <CalendarGlyph />}
        </IconButton>
      </div>
      <div className="m3e-date-picker__mode-content">
        {props.mode === 'calendar' ? (
          <DatePickerCalendar
            id={props.id}
            locale={props.locale}
            displayedMonth={props.displayedMonth}
            focusedDate={props.focusedDate}
            min={props.min}
            max={props.max}
            selectedStart={props.selectedStart}
            selectedEnd={props.selectedEnd}
            range={props.range}
            today={props.today}
            readOnly={props.readOnly}
            isDisabled={props.isDisabled}
            previousMonthLabel={props.labels.previousMonth}
            nextMonthLabel={props.labels.nextMonth}
            chooseYearLabel={props.labels.chooseYear}
            onDisplayedMonthChange={props.onDisplayedMonthChange}
            onFocusedDateChange={props.onFocusedDateChange}
            onSelect={props.onSelect}
          />
        ) : props.input}
      </div>
    </div>
  )
}

export interface PickerOverlayProps {
  readonly id: string
  readonly presentation: DatePickerPresentation
  readonly open: boolean
  readonly anchorRef: RefObject<HTMLInputElement | null>
  readonly title: ReactNode
  readonly confirmLabel: string
  readonly cancelLabel: string
  readonly confirmDisabled: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onConfirm: () => void
  readonly onCancel: () => void
  readonly children: ReactNode
  readonly range?: boolean
  readonly direction?: 'ltr' | 'rtl'
}

export function PickerOverlay({
  id,
  presentation,
  open,
  anchorRef,
  title,
  confirmLabel,
  cancelLabel,
  confirmDisabled,
  onOpenChange,
  onConfirm,
  onCancel,
  children,
  range = false,
  direction,
}: PickerOverlayProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null)
  const overlay = useAnchoredOverlay({
    open: presentation === 'docked' && open,
    anchorRef,
    onRequestClose: () => onOpenChange(false),
    gap: 4,
  })
  const themeScope = usePortalThemeScope()

  useEffect(() => {
    if (!open || (presentation === 'docked' && !overlay.mounted)) return
    const frame = requestAnimationFrame(() => {
      const root = presentation === 'modal' ? dialogRef.current : document.getElementById(`${id}-popup`)
      const target = root?.querySelector<HTMLElement>('[data-m3e-date-focus="true"]')
        ?? root?.querySelector<HTMLInputElement>('.m3e-date-picker__mode-content input:not([type="date"])')
      target?.focus()
    })
    return () => cancelAnimationFrame(frame)
  }, [id, open, overlay.mounted, presentation])

  if (presentation === 'modal') {
    return (
      <Dialog
        ref={dialogRef}
        id={`${id}-dialog`}
        className={`m3e-date-picker__dialog${range ? ' m3e-date-range-picker' : ''}`}
        dir={direction}
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        actions={(
          <>
            <Button variant="text" onClick={onCancel}>{cancelLabel}</Button>
            <Button variant="text" disabled={confirmDisabled} onClick={onConfirm}>{confirmLabel}</Button>
          </>
        )}
      >
        {children}
      </Dialog>
    )
  }

  if (!overlay.mounted) return null
  return createPortal(
    <div
      ref={overlay.popoverRef}
      id={`${id}-popup`}
      role="dialog"
      dir={direction}
      aria-label={typeof title === 'string' ? title : undefined}
      className={[themeScope?.className, 'm3e-date-picker__popover', range ? 'm3e-date-range-picker' : undefined].filter(Boolean).join(' ')}
      data-m3e-color-mode={themeScope?.colorMode}
      data-m3e-open={overlay.entered}
      style={{ ...themeScope?.style, ...overlay.style }}
      onTransitionEnd={overlay.handleTransitionEnd}
    >
      {children}
    </div>,
    document.body,
  )
}

export function initialCalendarDate(
  value: string,
  today: CivilDate,
  bounds: ResolvedDateBounds,
): CivilDate {
  return clampCivilDate(parseCivilDate(value) ?? today, bounds.min, bounds.max)
}

export function headlineForDate(value: string, locale?: string | readonly string[]): string {
  const date = parseCivilDate(value)
  return date ? formatCivilDate(date, locale) : 'No date selected'
}

export function mergedLabels(labels?: Partial<DatePickerLabels>): DatePickerLabels {
  return { ...DEFAULT_DATE_PICKER_LABELS, ...labels }
}
