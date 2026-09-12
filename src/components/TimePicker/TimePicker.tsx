import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { composeRefs } from '../../internal/composeRefs'
import { useControllableState } from '../../internal/useControllableState'
import { Button } from '../Button'
import { Dialog } from '../Dialog'
import { IconButton } from '../IconButton'
import { Text } from '../Text'
import { TextField } from '../TextField'
import type {
  TimePickerLayout,
  TimePickerMode,
  TimePickerPresentation,
  TimePickerProps,
} from './TimePicker.types'
import {
  formatDialNumber,
  hasValidBounds,
  isTimeWithinBounds,
  localizeTimeDigits,
  nearestMinuteInHour,
  nearestTimeInPeriod,
  normalizeTimeDigits,
  parseTimeValue,
  periodLabels,
  resolvedHour12,
  serializeTime,
  validationMessage,
  type ParsedTime,
} from './timeValue'

interface TimePickerImplementationProps {
  readonly value?: string
  readonly defaultValue?: string
  readonly onValueChange?: (value: string) => void
  readonly min?: string
  readonly max?: string
  readonly locale?: string | readonly string[]
  readonly hour12?: boolean
  readonly mode?: TimePickerMode
  readonly defaultMode?: TimePickerMode
  readonly onModeChange?: (mode: TimePickerMode) => void
  readonly presentation?: TimePickerPresentation
  readonly layout?: TimePickerLayout
  readonly open?: boolean
  readonly defaultOpen?: boolean
  readonly onOpenChange?: (open: boolean) => void
  readonly fieldVariant?: 'filled' | 'outlined'
  readonly label: ReactNode
  readonly supportingText?: ReactNode
  readonly error?: boolean
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly required?: boolean
  readonly name?: string
  readonly customValidity?: string
  readonly confirmLabel?: ReactNode
  readonly cancelLabel?: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
  readonly id?: string
  readonly onBlur?: React.FocusEventHandler<HTMLInputElement>
  readonly onFocus?: React.FocusEventHandler<HTMLInputElement>
  readonly onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
  readonly onBeforeInput?: React.FormEventHandler<HTMLInputElement>
  readonly onInvalid?: React.FormEventHandler<HTMLInputElement>
  readonly form?: string
  readonly placeholder?: string
  readonly autoComplete?: string
  readonly 'aria-label'?: string
  readonly 'aria-labelledby'?: string
  readonly 'aria-describedby'?: string
  readonly 'aria-required'?: boolean | 'true' | 'false'
}

interface TimePickerComponent {
  (props: TimePickerProps): ReactElement | null
  displayName?: string
}

type DialSelection = 'hour' | 'minute'

const FALLBACK_TIME: ParsedTime = { hour: 0, minute: 0 }
const OUTER_HOURS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
const INNER_HOURS = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23] as const
const TWELVE_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute)

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`TimePicker: ${message}`)
  }
}

function warnForInvalidProps({
  value,
  defaultValue,
  onValueChange,
  mode,
  defaultMode,
  onModeChange,
  open,
  defaultOpen,
  onOpenChange,
  min,
  max,
  presentation,
}: Pick<
  TimePickerImplementationProps,
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'mode'
  | 'defaultMode'
  | 'onModeChange'
  | 'open'
  | 'defaultOpen'
  | 'onOpenChange'
  | 'min'
  | 'max'
  | 'presentation'
>): void {
  if (value !== undefined && defaultValue !== undefined) warn('use either value or defaultValue, not both.')
  if (value !== undefined && onValueChange === undefined) warn('a controlled value requires onValueChange.')
  if (mode !== undefined && defaultMode !== undefined) warn('use either mode or defaultMode, not both.')
  if (mode !== undefined && onModeChange === undefined) warn('a controlled mode requires onModeChange.')
  if (open !== undefined && defaultOpen !== undefined) warn('use either open or defaultOpen, not both.')
  if (open !== undefined && onOpenChange === undefined) warn('a controlled open state requires onOpenChange.')
  if (!hasValidBounds(min, max)) warn('min and max must use HH:mm and min must not be later than max; overnight ranges are not inferred.')
  if (presentation === 'docked' && (open !== undefined || defaultOpen !== undefined)) {
    warn('open and defaultOpen apply to the modal presentation only.')
  }
}

function valueForPanel(value: string, min?: string, max?: string): ParsedTime {
  const parsed = parseTimeValue(value)
  if (parsed) return parsed
  if (hasValidBounds(min, max) && min) return parseTimeValue(min) ?? FALLBACK_TIME
  return FALLBACK_TIME
}

function resolvedPixelToken(element: Element, name: string, fallback: number): number {
  const value = Number.parseFloat(getComputedStyle(element).getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

function ClockDisplay({
  value,
  selection,
  onSelectionChange,
  hour12,
  locale,
  disabled,
}: {
  readonly value: ParsedTime
  readonly selection: DialSelection
  readonly onSelectionChange: (selection: DialSelection) => void
  readonly hour12: boolean
  readonly locale: string | readonly string[] | undefined
  readonly disabled: boolean
}) {
  const displayHour = hour12 ? value.hour % 12 || 12 : value.hour
  return (
    <div className="m3e-time-picker__clock-display" role="group" aria-label="Time field">
      <Button
        variant="tonal"
        size="small"
        shape="square"
        className="m3e-time-picker__time-selector"
        aria-pressed={selection === 'hour'}
        disabled={disabled}
        onClick={() => onSelectionChange('hour')}
      >
        <Text as="span" variant="displayLarge">
          {formatDialNumber(displayHour, locale, 2)}
        </Text>
      </Button>
      <span className="m3e-time-picker__separator" aria-hidden="true">:</span>
      <Button
        variant="tonal"
        size="small"
        shape="square"
        className="m3e-time-picker__time-selector"
        aria-pressed={selection === 'minute'}
        disabled={disabled}
        onClick={() => onSelectionChange('minute')}
      >
        <Text as="span" variant="displayLarge">
          {formatDialNumber(value.minute, locale, 2)}
        </Text>
      </Button>
    </div>
  )
}

function PeriodSelector({
  value,
  locale,
  disabled,
  onChange,
  min,
  max,
}: {
  readonly value: ParsedTime
  readonly locale: string | readonly string[] | undefined
  readonly disabled: boolean
  readonly onChange: (value: ParsedTime) => void
  readonly min: string | undefined
  readonly max: string | undefined
}) {
  const [amLabel, pmLabel] = periodLabels(locale)
  const isPm = value.hour >= 12
  const setPeriod = (pm: boolean) => {
    if (pm === isPm) return
    const next = nearestTimeInPeriod(value, pm, min, max)
    if (next) onChange(next)
  }
  const amDisabled = disabled || nearestTimeInPeriod(value, false, min, max) === null
  const pmDisabled = disabled || nearestTimeInPeriod(value, true, min, max) === null
  return (
    <div className="m3e-time-picker__period" role="group" aria-label="Day period">
      <Button
        variant="tonal"
        size="small"
        shape="square"
        className="m3e-time-picker__period-option"
        aria-pressed={!isPm}
        disabled={amDisabled}
        onClick={() => setPeriod(false)}
      >
        <Text as="span" variant="titleMedium">{amLabel}</Text>
      </Button>
      <Button
        variant="tonal"
        size="small"
        shape="square"
        className="m3e-time-picker__period-option"
        aria-pressed={isPm}
        disabled={pmDisabled}
        onClick={() => setPeriod(true)}
      >
        <Text as="span" variant="titleMedium">{pmLabel}</Text>
      </Button>
    </div>
  )
}

function Dial({
  value,
  selection,
  onSelectionChange,
  onChange,
  min,
  max,
  hour12,
  locale,
  disabled,
}: {
  readonly value: ParsedTime
  readonly selection: DialSelection
  readonly onSelectionChange: (selection: DialSelection) => void
  readonly onChange: (value: ParsedTime) => void
  readonly min: string | undefined
  readonly max: string | undefined
  readonly hour12: boolean
  readonly locale: string | readonly string[] | undefined
  readonly disabled: boolean
}) {
  const optionRefs = useRef(new Map<number, HTMLButtonElement>())
  const pointerIdRef = useRef<number | null>(null)
  const pointerStartedOnButtonRef = useRef(false)
  const pointerMappedRef = useRef(false)
  const suppressClickRef = useRef(false)
  const previousSelectionRef = useRef(selection)
  const values = selection === 'minute' ? MINUTES : hour12 ? TWELVE_HOURS : [...OUTER_HOURS, ...INNER_HOURS]
  const selectedValue = selection === 'minute' ? value.minute : hour12 ? value.hour % 12 || 12 : value.hour

  useEffect(() => {
    if (previousSelectionRef.current === 'hour' && selection === 'minute') {
      optionRefs.current.get(value.minute)?.focus()
    }
    previousSelectionRef.current = selection
  }, [selection, value.minute])

  const isEnabled = (option: number) => {
    if (disabled) return false
    if (selection === 'minute') return isTimeWithinBounds({ ...value, minute: option }, min, max)
    const hour = hour12 ? (option % 12) + (value.hour >= 12 ? 12 : 0) : option
    return nearestMinuteInHour(hour, value.minute, min, max) !== null
  }

  const select = (option: number, focus = false, completeHour = true) => {
    if (!isEnabled(option)) return
    if (selection === 'minute') {
      onChange({ ...value, minute: option })
      if (focus) optionRefs.current.get(option)?.focus()
      return
    }
    const hour = hour12 ? (option % 12) + (value.hour >= 12 ? 12 : 0) : option
    const minute = nearestMinuteInHour(hour, value.minute, min, max)
    if (minute === null) return
    onChange({ hour, minute })
    if (focus) optionRefs.current.get(option)?.focus()
    if (completeHour) onSelectionChange('minute')
  }

  const move = (current: number, amount: number) => {
    const start = values.indexOf(current as never)
    for (let offset = 1; offset <= values.length; offset += 1) {
      const index = (start + amount * offset + values.length) % values.length
      const candidate = values[index] as number
      if (isEnabled(candidate)) {
        select(candidate, true, false)
        return
      }
    }
  }

  const handleOptionKeyDown = (event: KeyboardEvent<HTMLButtonElement>, option: number) => {
    const direction = getComputedStyle(event.currentTarget).direction === 'rtl' ? -1 : 1
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault()
      move(option, event.key === 'ArrowRight' ? direction : 1)
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault()
      move(option, event.key === 'ArrowLeft' ? -direction : -1)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      const ordered = event.key === 'Home' ? values : [...values].reverse()
      const candidate = ordered.find(isEnabled)
      if (candidate !== undefined) select(candidate as number, true, false)
    }
  }

  const updateFromPointer = (event: ReactPointerEvent<HTMLDivElement>): boolean => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (rect.width === 0 || rect.height === 0) return false
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2
    const angle = (Math.atan2(y, x) + Math.PI / 2 + Math.PI * 2) % (Math.PI * 2)
    if (selection === 'minute') {
      const minute = Math.round(angle / (Math.PI * 2 / 60)) % 60
      select(minute)
      return true
    }
    const index = Math.round(angle / (Math.PI * 2 / 12)) % 12
    if (hour12) {
      select(index === 0 ? 12 : index, false, false)
      return true
    }
    const distance = Math.hypot(x, y)
    const innerRingThreshold = resolvedPixelToken(
      event.currentTarget,
      '--m3e-comp-time-picker-inner-ring-threshold',
      rect.width * (74 / 256),
    )
    select(distance < innerRingThreshold ? 12 + index : index, false, false)
    return true
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || pointerIdRef.current !== null) return
    pointerIdRef.current = event.pointerId
    pointerStartedOnButtonRef.current = event.target instanceof Element &&
      event.target.closest('button') !== null
    event.currentTarget.setPointerCapture?.(event.pointerId)
    pointerMappedRef.current = updateFromPointer(event)
  }
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerMappedRef.current = updateFromPointer(event) || pointerMappedRef.current
  }
  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerIdRef.current !== event.pointerId) return
    pointerIdRef.current = null
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    const completedPointerSelection = pointerMappedRef.current || !pointerStartedOnButtonRef.current
    if (pointerStartedOnButtonRef.current && pointerMappedRef.current) {
      suppressClickRef.current = true
      window.setTimeout(() => { suppressClickRef.current = false }, 0)
    }
    pointerStartedOnButtonRef.current = false
    pointerMappedRef.current = false
    if (selection === 'hour' && completedPointerSelection) onSelectionChange('minute')
  }

  const selectedIndex = selection === 'minute' ? value.minute / 5 : value.hour % 12
  const selectedRadius = !hour12 && selection === 'hour' && value.hour >= 12 ? 'inner' : 'outer'
  const dialStyle = {
    '--m3e-time-picker-selected-index': selectedIndex,
    '--m3e-time-picker-selected-radius': `var(--m3e-comp-time-picker-${selectedRadius}-radius)`,
  } as CSSProperties

  return (
    <div
      className="m3e-time-picker__dial"
      role="radiogroup"
      aria-label={selection === 'hour' ? 'Select hour' : 'Select minute'}
      style={dialStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        pointerIdRef.current = null
        pointerStartedOnButtonRef.current = false
        pointerMappedRef.current = false
      }}
      onClickCapture={(event) => {
        if (!suppressClickRef.current) return
        suppressClickRef.current = false
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <span className="m3e-time-picker__selector-track" aria-hidden="true" />
      <span className="m3e-time-picker__selector-center" aria-hidden="true" />
      {values.map((option, position) => {
        const inner = selection === 'hour' && !hour12 && option >= 12
        const index = selection === 'minute'
          ? option / 5
          : selection === 'hour' && !hour12
            ? option % 12
            : position
        const selected = option === selectedValue
        const enabled = isEnabled(option)
        const rovingOption = isEnabled(selectedValue)
          ? selectedValue
          : values.find((candidate) => isEnabled(candidate as number))
        const major = selection !== 'minute' || option % 5 === 0
        const style = {
          '--m3e-time-picker-index': index,
          '--m3e-time-picker-option-radius': `var(--m3e-comp-time-picker-${inner ? 'inner' : 'outer'}-radius)`,
        } as CSSProperties
        return (
          <Button
            key={option}
            ref={(node) => {
              if (node) optionRefs.current.set(option, node)
              else optionRefs.current.delete(option)
            }}
            variant="tonal"
            size="small"
            className="m3e-time-picker__dial-option"
            role="radio"
            aria-checked={selected}
            aria-label={`${option} ${selection === 'hour' ? 'hours' : 'minutes'}`}
            tabIndex={option === rovingOption ? 0 : -1}
            disabled={!enabled}
            data-m3e-major={major}
            style={style}
            onKeyDown={(event) => handleOptionKeyDown(event, option)}
            onClick={() => select(option)}
          >
            <span className="m3e-time-picker__dial-label">
              <Text as="span" variant="bodyLarge">{formatDialNumber(option, locale)}</Text>
            </span>
          </Button>
        )
      })}
    </div>
  )
}

function TimeInput({
  value,
  onChange,
  hour12,
  locale,
  disabled,
  onValidityChange,
  min,
  max,
}: {
  readonly value: ParsedTime
  readonly onChange: (value: ParsedTime) => void
  readonly hour12: boolean
  readonly locale: string | readonly string[] | undefined
  readonly disabled: boolean
  readonly onValidityChange: (valid: boolean) => void
  readonly min: string | undefined
  readonly max: string | undefined
}) {
  const hourId = useId()
  const minuteId = useId()
  const displayHour = hour12 ? value.hour % 12 || 12 : value.hour
  const [hourText, setHourText] = useState(
    localizeTimeDigits(String(displayHour).padStart(2, '0'), locale),
  )
  const [minuteText, setMinuteText] = useState(
    localizeTimeDigits(String(value.minute).padStart(2, '0'), locale),
  )

  const hourIsValid = (text: string) => {
    const normalized = normalizeTimeDigits(text, locale)
    if (!/^\d{1,2}$/.test(normalized)) return false
    const entered = Number(normalized)
    return hour12 ? entered >= 1 && entered <= 12 : entered <= 23
  }
  const minuteIsValid = (text: string) => {
    const normalized = normalizeTimeDigits(text, locale)
    return /^\d{1,2}$/.test(normalized) && Number(normalized) <= 59
  }

  useEffect(() => {
    onValidityChange(hourIsValid(hourText) && minuteIsValid(minuteText))
  }, [hourText, minuteText, hour12, onValidityChange])

  const changeHour = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value.slice(0, 2)
    setHourText(text)
    if (!hourIsValid(text)) return
    const entered = Number(normalizeTimeDigits(text, locale))
    const hour = hour12 ? (entered % 12) + (value.hour >= 12 ? 12 : 0) : entered
    onChange({ ...value, hour })
  }
  const changeMinute = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.currentTarget.value.slice(0, 2)
    setMinuteText(text)
    if (!minuteIsValid(text)) return
    onChange({ ...value, minute: Number(normalizeTimeDigits(text, locale)) })
  }

  return (
    <div className="m3e-time-picker__input-mode">
      <div className="m3e-time-picker__input-fields">
        <div className="m3e-time-picker__time-field">
          <input
            id={hourId}
            className="m3e-time-picker__time-field-input"
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={hourText}
            aria-invalid={!hourIsValid(hourText)}
            disabled={disabled}
            onChange={changeHour}
            onFocus={(event) => event.currentTarget.select()}
          />
          <label className="m3e-time-picker__time-field-label" htmlFor={hourId}>Hour</label>
        </div>
        <span className="m3e-time-picker__separator" aria-hidden="true">:</span>
        <div className="m3e-time-picker__time-field">
          <input
            id={minuteId}
            className="m3e-time-picker__time-field-input"
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={minuteText}
            aria-invalid={!minuteIsValid(minuteText)}
            disabled={disabled}
            onChange={changeMinute}
            onFocus={(event) => event.currentTarget.select()}
          />
          <label className="m3e-time-picker__time-field-label" htmlFor={minuteId}>Minute</label>
        </div>
      </div>
      {hour12 ? (
        <PeriodSelector
          value={value}
          locale={locale}
          disabled={disabled}
          onChange={onChange}
          min={min}
          max={max}
        />
      ) : null}
    </div>
  )
}

function PickerPanel({
  value,
  onChange,
  mode,
  onModeChange,
  min,
  max,
  locale,
  hour12,
  disabled,
  layout,
  onValidityChange,
}: {
  readonly value: ParsedTime
  readonly onChange: (value: ParsedTime) => void
  readonly mode: TimePickerMode
  readonly onModeChange: (mode: TimePickerMode) => void
  readonly min: string | undefined
  readonly max: string | undefined
  readonly locale: string | readonly string[] | undefined
  readonly hour12: boolean
  readonly disabled: boolean
  readonly layout: TimePickerLayout
  readonly onValidityChange: (valid: boolean) => void
}) {
  const [selection, setSelection] = useState<DialSelection>('hour')
  const [inputValid, setInputValid] = useState(true)
  const invalid = !isTimeWithinBounds(value, min, max) || (mode === 'input' && !inputValid)
  useEffect(() => onValidityChange(!invalid), [invalid, onValidityChange])
  return (
    <div
      className="m3e-time-picker__panel"
      data-m3e-mode={mode}
      data-m3e-layout={layout}
      data-m3e-invalid={invalid}
      onKeyDown={(event) => {
        if (event.key === 'Enter' && event.target instanceof HTMLInputElement) event.preventDefault()
      }}
    >
      {mode === 'dial' ? (
        <>
          <div className="m3e-time-picker__display-row">
            <ClockDisplay
              value={value}
              selection={selection}
              onSelectionChange={setSelection}
              hour12={hour12}
              locale={locale}
              disabled={disabled}
            />
            {hour12 ? (
              <PeriodSelector
                value={value}
                locale={locale}
                disabled={disabled}
                onChange={onChange}
                min={min}
                max={max}
              />
            ) : null}
          </div>
          <Dial
            value={value}
            selection={selection}
            onSelectionChange={setSelection}
            onChange={onChange}
            min={min}
            max={max}
            hour12={hour12}
            locale={locale}
            disabled={disabled}
          />
        </>
      ) : (
        <TimeInput
          value={value}
          onChange={onChange}
          hour12={hour12}
          locale={locale}
          disabled={disabled}
          onValidityChange={setInputValid}
          min={min}
          max={max}
        />
      )}
      <div className="m3e-time-picker__panel-footer">
        {invalid ? <span role="alert">Time is outside the allowed range.</span> : <span />}
        <Button
          variant="text"
          size="extra-small"
          type="button"
          disabled={disabled}
          onClick={() => onModeChange(mode === 'dial' ? 'input' : 'dial')}
        >
          {mode === 'dial' ? 'Use keyboard input' : 'Use clock dial'}
        </Button>
      </div>
    </div>
  )
}

function TimePickerRender(
  {
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    locale,
    hour12,
    mode,
    defaultMode,
    onModeChange,
    presentation = 'docked',
    layout = 'vertical',
    open,
    defaultOpen,
    onOpenChange,
    fieldVariant = 'filled',
    label,
    supportingText,
    error = false,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    customValidity = '',
    confirmLabel = 'OK',
    cancelLabel = 'Cancel',
    className,
    style,
    id: idProp,
    onBlur,
    onFocus,
    onKeyDown,
    onBeforeInput,
    form,
    'aria-label': ariaLabel,
    ...inputProps
  }: TimePickerImplementationProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  warnForInvalidProps({
    value,
    defaultValue,
    onValueChange,
    mode,
    defaultMode,
    onModeChange,
    open,
    defaultOpen,
    onOpenChange,
    min,
    max,
    presentation,
  })

  const generatedId = useId()
  const fieldId = idProp ?? generatedId
  const inputRef = useRef<HTMLInputElement | null>(null)
  const emittedValueRef = useRef<string | undefined>(undefined)
  const controlled = value !== undefined
  const initialValue = defaultValue ?? ''
  const [uncontrolledValue, setUncontrolledValue] = useState(initialValue)
  const resolvedValue = controlled ? value : uncontrolledValue
  const [fieldText, setFieldText] = useState(() => localizeTimeDigits(resolvedValue, locale))
  const [draft, setDraft] = useState<ParsedTime>(() => valueForPanel(resolvedValue, min, max))
  const [panelValid, setPanelValid] = useState(() =>
    isTimeWithinBounds(valueForPanel(resolvedValue, min, max), min, max),
  )
  const [resolvedMode, setMode] = useControllableState({
    value: mode,
    defaultValue: defaultMode ?? 'dial',
    onChange: onModeChange,
  })
  const [resolvedOpen, setOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  })
  const usesHour12 = resolvedHour12(locale, hour12)
  const canonicalFieldText = normalizeTimeDigits(fieldText, locale)
  const ownMessage = validationMessage(canonicalFieldText, min, max, required)
  const message = ownMessage || customValidity

  useEffect(() => {
    setDraft(valueForPanel(resolvedValue, min, max))
    if (emittedValueRef.current === resolvedValue) {
      emittedValueRef.current = undefined
      return
    }
    emittedValueRef.current = undefined
    setFieldText(localizeTimeDigits(resolvedValue, locale))
  }, [locale, max, min, resolvedValue])

  useEffect(() => {
    inputRef.current?.setCustomValidity(message)
  }, [message])

  useEffect(() => {
    const field = inputRef.current
    const form = field?.form
    if (!form) return undefined
    const handleReset = (event: Event) => {
      queueMicrotask(() => {
        if (event.defaultPrevented) return
        const resetValue = controlled ? value : initialValue
        if (!controlled) setUncontrolledValue(initialValue)
        setFieldText(localizeTimeDigits(resetValue ?? '', locale))
        setDraft(valueForPanel(resetValue ?? '', min, max))
      })
    }
    form.addEventListener('reset', handleReset)
    return () => form.removeEventListener('reset', handleReset)
  }, [controlled, form, initialValue, locale, max, min, value])

  const commitValue = (next: string) => {
    if (next === resolvedValue) return
    emittedValueRef.current = next
    if (!controlled) setUncontrolledValue(next)
    onValueChange?.(next)
  }

  const handleFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    const next = event.currentTarget.value
    const normalized = normalizeTimeDigits(next, locale)
    const formatted = /^\d{3,4}$/.test(normalized)
      ? localizeTimeDigits(`${normalized.slice(0, 2)}:${normalized.slice(2)}`, locale)
      : next
    setFieldText(formatted)
    if (formatted === '') {
      commitValue('')
      return
    }
    const parsed = parseTimeValue(normalizeTimeDigits(formatted, locale))
    if (parsed && isTimeWithinBounds(parsed, min, max)) commitValue(serializeTime(parsed))
    else commitValue('')
  }

  const handleReadOnlyKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (
      readOnly &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      (event.key.length === 1 || event.key === 'Backspace' || event.key === 'Delete')
    ) {
      event.preventDefault()
    }
  }

  const openModal = () => {
    if (disabled || readOnly) return
    setDraft(valueForPanel(resolvedValue, min, max))
    setPanelValid(isTimeWithinBounds(valueForPanel(resolvedValue, min, max), min, max))
    setOpen(true)
  }
  const cancelModal = () => {
    setDraft(valueForPanel(resolvedValue, min, max))
    setOpen(false)
  }
  const confirmModal = () => {
    if (!panelValid || !isTimeWithinBounds(draft, min, max)) return
    const next = serializeTime(draft)
    setFieldText(localizeTimeDigits(next, locale))
    commitValue(next)
    setOpen(false)
  }

  const panelValue = presentation === 'modal' ? draft : valueForPanel(resolvedValue, min, max)
  const changePanelValue = (next: ParsedTime) => {
    if (disabled || readOnly) return
    if (presentation === 'modal') {
      setDraft(next)
      return
    }
    if (!isTimeWithinBounds(next, min, max)) return
    const serialized = serializeTime(next)
    setFieldText(serialized)
    commitValue(serialized)
  }

  const rootClassName = className ? `m3e-time-picker ${className}` : 'm3e-time-picker'
  const pickerLabel = typeof label === 'string' ? label : 'Choose time'
  const effectiveError = error || message.length > 0
  const parsedFieldText = parseTimeValue(canonicalFieldText)
  const submittedValue = parsedFieldText && isTimeWithinBounds(parsedFieldText, min, max)
    ? serializeTime(parsedFieldText)
    : ''

  const panel = (
    <PickerPanel
      key={presentation === 'modal' ? String(resolvedOpen) : 'docked'}
      value={panelValue}
      onChange={changePanelValue}
      mode={resolvedMode}
      onModeChange={setMode}
      min={min}
      max={max}
      locale={locale}
      hour12={usesHour12}
      disabled={disabled || readOnly}
      layout={layout}
      onValidityChange={setPanelValid}
    />
  )

  return (
    <div
      className={rootClassName}
      style={style}
      data-m3e-presentation={presentation}
      data-m3e-mode={resolvedMode}
      data-m3e-layout={layout}
      data-m3e-disabled={disabled}
      data-m3e-readonly={readOnly}
      data-m3e-invalid={effectiveError}
    >
      <div className="m3e-time-picker__field-row">
        <TextField
          {...inputProps}
          ref={composeRefs(forwardedRef, inputRef)}
          id={fieldId}
          className="m3e-time-picker__field"
          variant={fieldVariant}
          label={label}
          supportingText={supportingText}
          error={effectiveError}
          type="text"
          inputMode="numeric"
          maxLength={5}
          form={form}
          required={required}
          disabled={disabled}
          value={fieldText}
          placeholder="HH:mm"
          aria-label={ariaLabel}
          aria-readonly={readOnly || undefined}
          onBeforeInput={composeEventHandlers<FormEvent<HTMLInputElement>>(onBeforeInput, readOnly ? (event) => event.preventDefault() : undefined)}
          onKeyDown={composeEventHandlers(onKeyDown, handleReadOnlyKeyDown)}
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={handleFieldChange}
        />
        {name ? (
          <input type="hidden" name={name} form={form} value={submittedValue} disabled={disabled} />
        ) : null}
        {presentation === 'modal' ? (
          <IconButton
            className="m3e-time-picker__open-button"
            type="button"
            aria-label={`Open ${pickerLabel}`}
            disabled={disabled || readOnly}
            onClick={openModal}
          >
            <span aria-hidden="true">◷</span>
          </IconButton>
        ) : null}
      </div>

      {presentation === 'docked' ? (
        <section className="m3e-time-picker__docked" aria-label={pickerLabel}>
          {panel}
        </section>
      ) : resolvedOpen ? (
        <Dialog
          className="m3e-time-picker__dialog"
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) cancelModal()
          }}
          title={label}
          actions={
            <>
              <Button variant="text" type="button" onClick={cancelModal}>{cancelLabel}</Button>
              <Button
                variant="text"
                type="button"
                disabled={!panelValid || !isTimeWithinBounds(draft, min, max)}
                onClick={confirmModal}
              >
                {confirmLabel}
              </Button>
            </>
          }
          onKeyDown={(event) => {
            if (event.defaultPrevented || event.key !== 'Enter' || event.target instanceof HTMLButtonElement) return
            event.preventDefault()
            confirmModal()
          }}
        >
          {panel}
        </Dialog>
      ) : null}
    </div>
  )
}

const ForwardedTimePicker = forwardRef<HTMLInputElement, TimePickerImplementationProps>(TimePickerRender)
ForwardedTimePicker.displayName = 'TimePicker'

export const TimePicker = ForwardedTimePicker as TimePickerComponent
