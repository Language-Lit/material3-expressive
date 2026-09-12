import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type KeyboardEventHandler,
  type ReactElement,
} from 'react'
import { composeRefs } from '../../internal/composeRefs'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { useControllableState } from '../../internal/useControllableState'
import {
  compareCivilDates,
  formatCivilDate,
  formatIsoDate,
  monthFromDate,
  parseCivilDate,
  type CivilDate,
} from '../../internal/civilDate'
import { TextField } from '../TextField'
import type { DateRangePickerProps, DateRangeValue } from './DateRangePicker.types'
import {
  CalendarGlyph,
  DateFormControl,
  DateTextInput,
  PickerOverlay,
  PickerPanel,
  initialCalendarDate,
  mergedLabels,
  resolveDateBounds,
  validateDate,
  validationMessage,
} from './DatePickerShared'

const EMPTY_RANGE: DateRangeValue = { start: '', end: '' }

interface DateRangePickerComponent {
  (props: DateRangePickerProps): ReactElement | null
  displayName?: string
}

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`DateRangePicker: ${message}`)
  }
}

function DateRangePickerRender(
  {
    value,
    defaultValue = EMPTY_RANGE,
    onValueChange,
    min,
    max,
    disabledDates = [],
    isDateDisabled,
    locale = 'en-US',
    mode,
    defaultMode = 'calendar',
    onModeChange,
    presentation = 'docked',
    open,
    defaultOpen = false,
    onOpenChange,
    label,
    supportingText,
    error = false,
    disabled = false,
    readOnly = false,
    required = false,
    startName,
    endName,
    form,
    customValidity,
    onBlur,
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    fieldVariant = 'filled',
    labels: labelsProp,
    today: todayProp,
    className,
    style,
    id: idProp,
    onFocus,
    onKeyDown,
    onClick,
    onInvalid,
    'aria-invalid': ariaInvalid,
    ...inputProps
  }: DateRangePickerProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const triggerRef = useRef<HTMLInputElement | null>(null)
  const controlled = value !== undefined
  const [resolvedValue, setValue] = useControllableState({ value, defaultValue, onChange: onValueChange })
  const [resolvedMode, setMode] = useControllableState({ value: mode, defaultValue: defaultMode, onChange: onModeChange })
  const [resolvedOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const labels = useMemo(() => mergedLabels(labelsProp), [labelsProp])
  const bounds = useMemo(() => resolveDateBounds(min, max), [min, max])
  const disabledSet = useMemo(() => new Set(disabledDates), [disabledDates])
  const isDisabled = useCallback((date: CivilDate) => {
    const iso = formatIsoDate(date)
    return compareCivilDates(date, bounds.min) < 0 ||
      compareCivilDates(date, bounds.max) > 0 ||
      disabledSet.has(iso) ||
      Boolean(isDateDisabled?.(iso))
  }, [bounds.max, bounds.min, disabledSet, isDateDisabled])
  const explicitToday = parseCivilDate(todayProp ?? '')
  const [today, setToday] = useState(() => explicitToday ?? utcToday())
  useEffect(() => {
    if (explicitToday) setToday(explicitToday)
    else setToday(localToday())
  }, [todayProp])

  const seedValue = resolvedValue.start || resolvedValue.end
  const initial = initialCalendarDate(seedValue, today, bounds)
  const [focusedDate, setFocusedDate] = useState(initial)
  const [displayedMonth, setDisplayedMonth] = useState(monthFromDate(initial))
  const [draft, setDraft] = useState(resolvedValue)
  const [startInput, setStartInput] = useState(resolvedValue.start)
  const [endInput, setEndInput] = useState(resolvedValue.end)
  const [nativeInvalid, setNativeInvalid] = useState(false)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (resolvedOpen && !wasOpen.current) {
      const date = initialCalendarDate(resolvedValue.start || resolvedValue.end, today, bounds)
      setDraft(resolvedValue)
      setStartInput(resolvedValue.start)
      setEndInput(resolvedValue.end)
      setFocusedDate(date)
      setDisplayedMonth(monthFromDate(date))
      setNativeInvalid(false)
    }
    wasOpen.current = resolvedOpen
  }, [bounds, resolvedOpen, resolvedValue, today])

  useEffect(() => {
    if (!resolvedOpen) {
      setStartInput(resolvedValue.start)
      setEndInput(resolvedValue.end)
    }
  }, [resolvedOpen, resolvedValue])

  useEffect(() => {
    if (disabled && resolvedOpen) setOpen(false)
  }, [disabled, resolvedOpen, setOpen])

  const working = presentation === 'modal' ? draft : resolvedValue
  const startValidation = validateDate(startInput, bounds, isDisabled)
  const endValidation = validateDate(endInput, bounds, isDisabled)
  const startDate = parseCivilDate(startInput)
  const endDate = parseCivilDate(endInput)
  const outOfOrder = Boolean(startDate && endDate && compareCivilDates(endDate, startDate) < 0)
  const committedStartValidation = validateDate(resolvedValue.start, bounds, isDisabled)
  const committedEndValidation = validateDate(resolvedValue.end, bounds, isDisabled)
  const committedStart = parseCivilDate(resolvedValue.start)
  const committedEnd = parseCivilDate(resolvedValue.end)
  const committedOrderInvalid = Boolean(committedStart && committedEnd && compareCivilDates(committedEnd, committedStart) < 0)
  const committedPartial = Boolean(resolvedValue.start) !== Boolean(resolvedValue.end)
  const anyInvalid = [committedStartValidation, committedEndValidation].some((state) => state !== 'valid' && state !== 'empty') || committedOrderInvalid || committedPartial
  const requiredEmpty = required && (!resolvedValue.start || !resolvedValue.end)
  const startMessage = validationMessage(startValidation === 'empty' && required ? 'invalid' : startValidation, labels)
  const endMessage = outOfOrder ? labels.rangeOutOfOrder : validationMessage(endValidation === 'empty' && required ? 'invalid' : endValidation, labels)
  const triggerError = error || anyInvalid || (nativeInvalid && requiredEmpty) || Boolean(customValidity)
  const effectiveOpen = resolvedOpen && !disabled
  const direction = triggerRef.current && getComputedStyle(triggerRef.current).direction === 'rtl' ? 'rtl' : 'ltr'

  if (value !== undefined && onValueChange === undefined) warn('a controlled value requires onValueChange.')
  if (open !== undefined && onOpenChange === undefined) warn('a controlled open value requires onOpenChange.')
  if (mode !== undefined && onModeChange === undefined) warn('a controlled mode requires onModeChange.')
  if ((min && !parseCivilDate(min)) || (max && !parseCivilDate(max))) warn('min and max must be ISO YYYY-MM-DD dates.')
  if (bounds.invalid) warn('min and max must be valid ISO dates and min must not be later than max.')
  if (todayProp !== undefined && !explicitToday) warn('today must be an ISO YYYY-MM-DD date.')

  const rangeText = [
    committedStart ? formatCivilDate(committedStart, locale) : resolvedValue.start,
    committedEnd ? formatCivilDate(committedEnd, locale) : resolvedValue.end,
  ]
    .filter(Boolean)
    .join(' – ')

  const selectDate = (date: CivilDate) => {
    const iso = formatIsoDate(date)
    const current = presentation === 'modal' ? draft : resolvedValue
    const currentStart = parseCivilDate(current.start)
    const next = !currentStart || current.end || compareCivilDates(date, currentStart) < 0
      ? { start: iso, end: '' }
      : { start: current.start, end: iso }
    setStartInput(next.start)
    setEndInput(next.end)
    if (presentation === 'modal') setDraft(next)
    else {
      setValue(next)
      if (next.end) {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
  }

  const handleInputPart = (part: 'start' | 'end', next: string) => {
    if (part === 'start') setStartInput(next)
    else setEndInput(next)
    if (!parseCivilDate(next)) {
      if (presentation === 'docked') {
        const current = resolvedValue
        setValue({ ...current, [part]: '' })
      } else if (next === '') {
        setDraft({ ...draft, [part]: '' })
      }
      return
    }
    const nextRange = { ...(presentation === 'modal' ? draft : resolvedValue), [part]: next }
    if (presentation === 'modal') setDraft(nextRange)
    else if (validateDate(next, bounds, isDisabled) === 'valid') setValue(nextRange)
  }

  const workingStart = parseCivilDate(working.start)
  const workingEnd = parseCivilDate(working.end)
  const headline = workingStart
    ? `${formatCivilDate(workingStart, locale)}${workingEnd ? ` – ${formatCivilDate(workingEnd, locale)}` : ' – …'}`
    : 'No date range selected'
  const inputPartial = Boolean(startInput) !== Boolean(endInput)
  const confirmDisabled = outOfOrder || inputPartial ||
    [startValidation, endValidation].some((state) => state !== 'valid' && (required || state !== 'empty'))

  const panel = (
    <PickerPanel
      id={id}
      locale={locale}
      mode={resolvedMode}
      onModeChange={setMode}
      labels={labels}
      displayedMonth={displayedMonth}
      focusedDate={focusedDate}
      min={bounds.min}
      max={bounds.max}
      selectedStart={workingStart}
      selectedEnd={workingEnd}
      range
      today={today}
      readOnly={readOnly || disabled}
      isDisabled={isDisabled}
      onDisplayedMonthChange={setDisplayedMonth}
      onFocusedDateChange={setFocusedDate}
      onSelect={selectDate}
      headline={headline}
      input={(
        <div className="m3e-date-picker__range-inputs">
          <DateTextInput
            id={`${id}-start-input`}
            label={labels.startDateInput}
            value={startInput}
            locale={locale}
            fieldVariant="outlined"
            disabled={disabled}
            readOnly={readOnly}
            validation={startValidation}
            message={startMessage}
            onValueChange={(next) => handleInputPart('start', next)}
          />
          <DateTextInput
            id={`${id}-end-input`}
            label={labels.endDateInput}
            value={endInput}
            locale={locale}
            fieldVariant="outlined"
            disabled={disabled}
            readOnly={readOnly}
            validation={outOfOrder ? 'invalid' : endValidation}
            message={endMessage}
            onValueChange={(next) => handleInputPart('end', next)}
          />
        </div>
      )}
    />
  )

  const reset = useCallback(() => {
    if (!controlled) setValue(defaultValue)
    setStartInput(defaultValue.start)
    setEndInput(defaultValue.end)
    setNativeInvalid(false)
  }, [controlled, defaultValue, setValue])

  const triggerKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (!['Enter', ' ', 'ArrowDown'].includes(event.key) || disabled || readOnly) return
    event.preventDefault()
    setOpen(true)
  }

  const mergedClassName = className ? `m3e-date-picker m3e-date-range-picker ${className}` : 'm3e-date-picker m3e-date-range-picker'
  return (
    <div
      className={mergedClassName}
      style={style}
      data-m3e-presentation={presentation}
      data-m3e-open={effectiveOpen}
      data-m3e-invalid={triggerError}
    >
      <DateFormControl
        value={resolvedValue.start}
        name={startName}
        form={form}
        min={bounds.minIso}
        max={bounds.maxIso}
        required={required}
        disabled={disabled}
        validation={resolvedOpen && presentation === 'docked' && resolvedMode === 'input'
          ? (inputPartial ? 'invalid' : startValidation)
          : (committedPartial ? 'invalid' : committedStartValidation)}
        message={resolvedOpen && presentation === 'docked' && resolvedMode === 'input'
          ? (inputPartial ? labels.rangeOutOfOrder : startMessage)
          : (committedOrderInvalid || committedPartial ? labels.rangeOutOfOrder : validationMessage(committedStartValidation, labels))}
        customValidity={customValidity}
        onInvalid={onInvalid}
        onReset={reset}
        onInvalidFocus={() => { setNativeInvalid(true); triggerRef.current?.focus() }}
      />
      <DateFormControl
        value={resolvedValue.end}
        name={endName}
        form={form}
        min={resolvedValue.start && parseCivilDate(resolvedValue.start) ? resolvedValue.start : bounds.minIso}
        max={bounds.maxIso}
        required={required}
        disabled={disabled}
        validation={resolvedOpen && presentation === 'docked' && resolvedMode === 'input'
          ? (outOfOrder ? 'invalid' : endValidation)
          : (committedOrderInvalid || committedPartial ? 'invalid' : committedEndValidation)}
        message={resolvedOpen && presentation === 'docked' && resolvedMode === 'input'
          ? endMessage
          : (committedOrderInvalid || committedPartial ? labels.rangeOutOfOrder : validationMessage(committedEndValidation, labels))}
        onInvalid={onInvalid}
        onReset={reset}
        onInvalidFocus={() => { setNativeInvalid(true); triggerRef.current?.focus() }}
      />
      <TextField
        {...inputProps}
        ref={composeRefs(forwardedRef, triggerRef)}
        id={id}
        label={label}
        variant={fieldVariant}
        value={rangeText}
        readOnly
        form={form}
        disabled={disabled}
        trailingIcon={<CalendarGlyph />}
        supportingText={triggerError ? (customValidity || (committedOrderInvalid ? labels.rangeOutOfOrder : supportingText)) : supportingText}
        error={triggerError}
        aria-haspopup="dialog"
        aria-expanded={effectiveOpen}
        aria-controls={`${id}-${presentation === 'modal' ? 'dialog' : 'popup'}`}
        aria-readonly={readOnly || undefined}
        aria-invalid={triggerError || ariaInvalid}
        onClick={composeEventHandlers(onClick, () => { if (!disabled && !readOnly) setOpen(!resolvedOpen) })}
        onKeyDown={composeEventHandlers(onKeyDown, triggerKeyDown)}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <PickerOverlay
        id={id}
        presentation={presentation}
        open={effectiveOpen}
        anchorRef={triggerRef}
        title={label}
        confirmLabel={confirmLabel}
        cancelLabel={cancelLabel}
        confirmDisabled={confirmDisabled}
        range
        direction={direction}
        onOpenChange={setOpen}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (confirmDisabled) return
          setValue({ start: startInput, end: endInput })
          setOpen(false)
          triggerRef.current?.focus()
        }}
      >
        {panel}
      </PickerOverlay>
    </div>
  )
}

function utcToday() {
  const now = new Date()
  return { year: now.getUTCFullYear(), month: now.getUTCMonth() + 1, day: now.getUTCDate() }
}

function localToday() {
  const now = new Date()
  return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() }
}

const ForwardedDateRangePicker = forwardRef<HTMLInputElement, DateRangePickerProps>(DateRangePickerRender)
ForwardedDateRangePicker.displayName = 'DateRangePicker'

export const DateRangePicker = ForwardedDateRangePicker as DateRangePickerComponent
