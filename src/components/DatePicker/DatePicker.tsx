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
import type { DatePickerProps } from './DatePicker.types'
import {
  CalendarGlyph,
  DateFormControl,
  DateTextInput,
  PickerOverlay,
  PickerPanel,
  headlineForDate,
  initialCalendarDate,
  mergedLabels,
  resolveDateBounds,
  validateDate,
  validationMessage,
} from './DatePickerShared'

interface DatePickerComponent {
  (props: DatePickerProps): ReactElement | null
  displayName?: string
}

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`DatePicker: ${message}`)
  }
}

function DatePickerRender(
  {
    value,
    defaultValue = '',
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
    name,
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
  }: DatePickerProps,
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

  const initial = initialCalendarDate(resolvedValue, today, bounds)
  const [focusedDate, setFocusedDate] = useState(initial)
  const [displayedMonth, setDisplayedMonth] = useState(monthFromDate(initial))
  const [draft, setDraft] = useState(resolvedValue)
  const [inputDraft, setInputDraft] = useState(resolvedValue)
  const [nativeInvalid, setNativeInvalid] = useState(false)
  const wasOpen = useRef(false)

  useEffect(() => {
    if (resolvedOpen && !wasOpen.current) {
      const date = initialCalendarDate(resolvedValue, today, bounds)
      setDraft(resolvedValue)
      setInputDraft(resolvedValue)
      setFocusedDate(date)
      setDisplayedMonth(monthFromDate(date))
      setNativeInvalid(false)
    }
    wasOpen.current = resolvedOpen
  }, [bounds, resolvedOpen, resolvedValue, today])

  useEffect(() => {
    if (!resolvedOpen) setInputDraft(resolvedValue)
  }, [resolvedOpen, resolvedValue])

  useEffect(() => {
    if (disabled && resolvedOpen) setOpen(false)
  }, [disabled, resolvedOpen, setOpen])

  const workingValue = presentation === 'modal' ? draft : resolvedValue
  const inputValue = resolvedMode === 'input' ? inputDraft : workingValue
  const committedValidation = validateDate(resolvedValue, bounds, isDisabled)
  const workingValidation = validateDate(inputValue, bounds, isDisabled)
  const committedInvalid = committedValidation !== 'valid' && committedValidation !== 'empty'
  const requiredEmpty = required && resolvedValue === ''
  const message = validationMessage(
    workingValidation === 'empty' && required ? 'invalid' : workingValidation,
    labels,
  )
  const visibleMessage = (error || committedInvalid || nativeInvalid) ? (message || supportingText) : supportingText

  if (value !== undefined && onValueChange === undefined) warn('a controlled value requires onValueChange.')
  if (value !== undefined && defaultValue !== '') warn('use either value or defaultValue, not both.')
  if (open !== undefined && onOpenChange === undefined) warn('a controlled open value requires onOpenChange.')
  if (mode !== undefined && onModeChange === undefined) warn('a controlled mode requires onModeChange.')
  if ((min && !parseCivilDate(min)) || (max && !parseCivilDate(max))) warn('min and max must be ISO YYYY-MM-DD dates.')
  if (bounds.invalid) warn('min and max must be valid ISO dates and min must not be later than max.')
  if (todayProp !== undefined && !explicitToday) warn('today must be an ISO YYYY-MM-DD date.')

  const triggerDate = parseCivilDate(resolvedValue)
  const triggerText = triggerDate ? formatCivilDate(triggerDate, locale) : resolvedValue
  const triggerError = error || committedInvalid || (nativeInvalid && requiredEmpty) || Boolean(customValidity)
  const effectiveOpen = resolvedOpen && !disabled
  const direction = triggerRef.current && getComputedStyle(triggerRef.current).direction === 'rtl' ? 'rtl' : 'ltr'

  const handleTriggerKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'ArrowDown') return
    if (disabled || readOnly) return
    event.preventDefault()
    setOpen(true)
  }

  const commitSelection = (iso: string) => {
    if (presentation === 'modal') {
      setDraft(iso)
      setInputDraft(iso)
      return
    }
    setValue(iso)
    setInputDraft(iso)
    setOpen(false)
    triggerRef.current?.focus()
  }

  const handleInputChange = (next: string) => {
    setInputDraft(next)
    const parsed = parseCivilDate(next)
    if (!parsed) {
      if (presentation === 'docked') setValue('')
      else if (next === '') setDraft('')
      return
    }
    const validation = validateDate(next, bounds, isDisabled)
    if (presentation === 'modal') setDraft(next)
    else setValue(validation === 'valid' ? next : '')
  }

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
      selectedStart={parseCivilDate(workingValue)}
      today={today}
      readOnly={readOnly || disabled}
      isDisabled={isDisabled}
      onDisplayedMonthChange={setDisplayedMonth}
      onFocusedDateChange={setFocusedDate}
      onSelect={(date) => commitSelection(formatIsoDate(date))}
      headline={headlineForDate(workingValue, locale)}
      input={(
        <DateTextInput
          id={`${id}-input`}
          label={labels.dateInput}
          value={inputDraft}
          locale={locale}
          fieldVariant="outlined"
          disabled={disabled}
          readOnly={readOnly}
          validation={workingValidation}
          message={message}
          onValueChange={handleInputChange}
        />
      )}
    />
  )

  const reset = useCallback(() => {
    if (!controlled) setValue(defaultValue)
    setInputDraft(defaultValue)
    setNativeInvalid(false)
  }, [controlled, defaultValue, setValue])

  const mergedClassName = className ? `m3e-date-picker ${className}` : 'm3e-date-picker'
  return (
    <div
      className={mergedClassName}
      style={style}
      data-m3e-presentation={presentation}
      data-m3e-open={effectiveOpen}
      data-m3e-invalid={triggerError}
    >
      <DateFormControl
        value={resolvedValue}
        name={name}
        form={form}
        min={bounds.minIso}
        max={bounds.maxIso}
        required={required}
        disabled={disabled}
        validation={resolvedOpen && presentation === 'docked' && resolvedMode === 'input' ? workingValidation : committedValidation}
        message={resolvedOpen && presentation === 'docked' && resolvedMode === 'input' ? message : validationMessage(committedValidation, labels)}
        customValidity={customValidity}
        onInvalid={onInvalid}
        onReset={reset}
        onInvalidFocus={() => {
          setNativeInvalid(true)
          triggerRef.current?.focus()
        }}
      />
      <TextField
        {...inputProps}
        ref={composeRefs(forwardedRef, triggerRef)}
        id={id}
        label={label}
        variant={fieldVariant}
        value={triggerText}
        readOnly
        form={form}
        disabled={disabled}
        trailingIcon={<CalendarGlyph />}
        supportingText={visibleMessage}
        error={triggerError}
        aria-haspopup="dialog"
        aria-expanded={effectiveOpen}
        aria-controls={`${id}-${presentation === 'modal' ? 'dialog' : 'popup'}`}
        aria-readonly={readOnly || undefined}
        aria-invalid={triggerError || ariaInvalid}
        onClick={composeEventHandlers(onClick, () => {
          if (!disabled && !readOnly) setOpen(!resolvedOpen)
        })}
        onKeyDown={composeEventHandlers(onKeyDown, handleTriggerKeyDown)}
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
        confirmDisabled={workingValidation !== 'valid' && (required || workingValidation !== 'empty')}
        direction={direction}
        onOpenChange={setOpen}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          if (workingValidation !== 'valid' && (required || workingValidation !== 'empty')) return
          setValue(inputValue)
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

const ForwardedDatePicker = forwardRef<HTMLInputElement, DatePickerProps>(DatePickerRender)
ForwardedDatePicker.displayName = 'DatePicker'

export const DatePicker = ForwardedDatePicker as DatePickerComponent
