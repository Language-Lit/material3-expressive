'use client'

import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ForwardedRef,
  type ReactElement,
} from 'react'
import { parseCivilDate } from '../../internal/civilDate'
import { composeRefs } from '../../internal/composeRefs'
import { DatePicker } from '../DatePicker'
import { Text } from '../Text'
import { TimePicker } from '../TimePicker'
import type { DateTimePickerProps } from './DateTimePicker.types'

interface DateTimePickerComponent {
  (props: DateTimePickerProps): ReactElement | null
  displayName?: string
}

const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

interface DateTimeParts {
  readonly date: string
  readonly time: string
}

type PartStatus = 'empty' | 'partial' | 'complete'

interface DateTimeDraft {
  readonly parts: DateTimeParts
  readonly dateStatus: PartStatus
  readonly timeStatus: PartStatus
}

function splitValue(value: string | undefined): DateTimeParts {
  if (!value) return { date: '', time: '' }
  const separator = value.indexOf('T')
  if (separator === -1) return { date: value, time: '' }
  return { date: value.slice(0, separator), time: value.slice(separator + 1) }
}

function serializeParts(parts: DateTimeParts): string {
  return parseCivilDate(parts.date) && TIME_PATTERN.test(parts.time)
    ? `${parts.date}T${parts.time}`
    : ''
}

function draftFromValue(value: string | undefined): DateTimeDraft {
  const parts = splitValue(value)
  return {
    parts,
    dateStatus: parts.date === '' ? 'empty' : parseCivilDate(parts.date) ? 'complete' : 'partial',
    timeStatus: parts.time === '' ? 'empty' : TIME_PATTERN.test(parts.time) ? 'complete' : 'partial',
  }
}

function submittedDraftValue(draft: DateTimeDraft): string {
  return draft.dateStatus === 'complete' && draft.timeStatus === 'complete'
    ? serializeParts(draft.parts)
    : ''
}

function parseBound(value: string | undefined): DateTimeParts | null {
  if (value === undefined) return null
  const parts = splitValue(value)
  return serializeParts(parts) === value ? parts : null
}

function validationMessage(
  draft: DateTimeDraft,
  min: string | undefined,
  max: string | undefined,
  required: boolean,
): string {
  const minParts = parseBound(min)
  const maxParts = parseBound(max)
  if ((min !== undefined && !minParts) || (max !== undefined && !maxParts) ||
      (min !== undefined && max !== undefined && min > max)) {
    return 'Date-time bounds must use YYYY-MM-DDTHH:mm, and minimum must not exceed maximum.'
  }
  if (draft.dateStatus === 'empty' && draft.timeStatus === 'empty') {
    return required ? 'Select a date and time.' : ''
  }
  const serialized = submittedDraftValue(draft)
  if (!serialized) return 'Enter both a valid date and a valid time.'
  if (min && serialized < min) return `Select a date and time at or after ${min}.`
  if (max && serialized > max) return `Select a date and time at or before ${max}.`
  return ''
}

function DateTimePickerRender(
  {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    locale,
    hour12,
    presentation = 'modal',
    fieldVariant,
    label,
    dateLabel = 'Date',
    timeLabel = 'Time',
    supportingText,
    error = false,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    form,
    onBlur,
    confirmLabel,
    cancelLabel,
    dateMode,
    defaultDateMode,
    onDateModeChange,
    timeMode,
    defaultTimeMode,
    onTimeModeChange,
    className,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...rootProps
  }: DateTimePickerProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  const controlled = value !== undefined
  const initialValue = controlled ? value : defaultValue
  const [draftState, setDraftState] = useState<DateTimeDraft>(() => draftFromValue(initialValue))
  const { parts } = draftState
  const draftRef = useRef(draftState)
  const dateInputRef = useRef<HTMLInputElement | null>(null)
  const timeInputRef = useRef<HTMLInputElement | null>(null)
  const previousControlledValue = useRef(value)
  const lastEmittedValue = useRef<string | undefined>(undefined)
  const lastNotifiedValue = useRef(submittedDraftValue(draftState))
  const generatedLabelId = useId()
  const labelId = ariaLabelledBy ?? generatedLabelId

  useEffect(() => {
    if (!controlled || value === previousControlledValue.current) return
    previousControlledValue.current = value
    if (value === lastEmittedValue.current) {
      lastEmittedValue.current = undefined
      return
    }
    const nextDraft = draftFromValue(value)
    draftRef.current = nextDraft
    lastNotifiedValue.current = submittedDraftValue(nextDraft)
    setDraftState(nextDraft)
  }, [controlled, value])

  const minParts = useMemo(() => parseBound(min), [min])
  const maxParts = useMemo(() => parseBound(max), [max])
  const timeMin = minParts && parts.date === minParts.date ? minParts.time : undefined
  const timeMax = maxParts && parts.date === maxParts.date ? maxParts.time : undefined
  const submittedValue = submittedDraftValue(draftState)
  const message = validationMessage(draftState, min, max, required)

  useEffect(() => {
    const formElement = form
      ? document.getElementById(form) as HTMLFormElement | null
      : dateInputRef.current?.closest('form')
    if (controlled || !formElement) return undefined
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (event.defaultPrevented) return
        const nextDraft = draftFromValue(defaultValue)
        draftRef.current = nextDraft
        setDraftState(nextDraft)
        const nextValue = submittedDraftValue(nextDraft)
        if (nextValue === lastNotifiedValue.current) return
        lastNotifiedValue.current = nextValue
        lastEmittedValue.current = nextValue
        onValueChange?.(nextValue)
      })
    }
    formElement.addEventListener('reset', handleReset)
    return () => formElement.removeEventListener('reset', handleReset)
  }, [controlled, defaultValue, form, onValueChange])

  const updateDraft = (nextDraft: DateTimeDraft) => {
    draftRef.current = nextDraft
    setDraftState(nextDraft)
    const nextValue = submittedDraftValue(nextDraft)
    if (nextValue === lastNotifiedValue.current) return
    lastNotifiedValue.current = nextValue
    lastEmittedValue.current = nextValue
    onValueChange?.(nextValue)
  }

  const dateModeProps = dateMode === undefined
    ? { defaultMode: defaultDateMode, onModeChange: onDateModeChange }
    : { mode: dateMode, onModeChange: onDateModeChange }
  const timeModeProps = timeMode === undefined
    ? { defaultMode: defaultTimeMode, onModeChange: onTimeModeChange }
    : { mode: timeMode, onModeChange: onTimeModeChange }
  const mergedClassName = className
    ? `m3e-date-time-picker ${className}`
    : 'm3e-date-time-picker'

  return (
    <div
      {...rootProps}
      className={mergedClassName}
      role="group"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabel ? ariaLabelledBy : labelId}
      data-m3e-disabled={disabled}
      data-m3e-invalid={message.length > 0 || error}
    >
      <Text as="span" id={generatedLabelId} variant="labelLarge" className="m3e-date-time-picker__label">
        {label}
      </Text>
      <div className="m3e-date-time-picker__fields">
        <DatePicker
          {...dateModeProps}
          className="m3e-date-time-picker__date"
          ref={composeRefs(forwardedRef, dateInputRef)}
          value={parts.date}
          onValueChange={(date) => {
            const current = draftRef.current
            updateDraft({
              ...current,
              parts: { ...current.parts, date },
              dateStatus: date === '' ? 'empty' : parseCivilDate(date) ? 'complete' : 'partial',
            })
          }}
          min={minParts?.date}
          max={maxParts?.date}
          locale={locale}
          presentation={presentation}
          fieldVariant={fieldVariant}
          label={dateLabel}
          error={error}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          form={form}
          onBlur={onBlur}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          customValidity={message}
        />
        <TimePicker
          {...timeModeProps}
          className="m3e-date-time-picker__time"
          ref={timeInputRef}
          value={parts.time}
          onValueChange={(time) => {
            const current = draftRef.current
            updateDraft({
              ...current,
              parts: { ...current.parts, time },
              timeStatus: time === '' ? 'empty' : TIME_PATTERN.test(time) ? 'complete' : 'partial',
            })
          }}
          min={timeMin}
          max={timeMax}
          locale={locale}
          hour12={hour12}
          presentation={presentation}
          fieldVariant={fieldVariant}
          label={timeLabel}
          supportingText={supportingText}
          error={error || message.length > 0}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          form={form}
          onBlur={onBlur}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          customValidity={message}
        />
      </div>
      <input
        type="hidden"
        name={name}
        form={form}
        value={submittedValue}
        disabled={disabled}
      />
    </div>
  )
}

const ForwardedDateTimePicker = forwardRef<HTMLInputElement, DateTimePickerProps>(DateTimePickerRender)
ForwardedDateTimePicker.displayName = 'DateTimePicker'

export const DateTimePicker = ForwardedDateTimePicker as DateTimePickerComponent
