import type {
  ComponentPropsWithRef,
  FocusEventHandler,
  ReactNode,
} from 'react'

export type DatePickerMode = 'calendar' | 'input'
export type DatePickerPresentation = 'docked' | 'modal'
export type DatePickerFieldVariant = 'filled' | 'outlined'

export interface DatePickerLabels {
  readonly previousMonth: string
  readonly nextMonth: string
  readonly chooseYear: string
  readonly switchToInput: string
  readonly switchToCalendar: string
  readonly dateInput: string
  readonly startDateInput: string
  readonly endDateInput: string
  readonly invalidDate: string
  readonly dateOutOfRange: string
  readonly dateUnavailable: string
  readonly rangeOutOfOrder: string
}

type ControlledValueProps = {
  readonly value: string
  readonly defaultValue?: never
  readonly onValueChange: (value: string) => void
}

type UncontrolledValueProps = {
  readonly value?: never
  readonly defaultValue?: string
  readonly onValueChange?: (value: string) => void
}

type ControlledModeProps = {
  readonly mode: DatePickerMode
  readonly defaultMode?: never
  readonly onModeChange: (mode: DatePickerMode) => void
}

type UncontrolledModeProps = {
  readonly mode?: never
  readonly defaultMode?: DatePickerMode
  readonly onModeChange?: (mode: DatePickerMode) => void
}

type ControlledOpenProps = {
  readonly open: boolean
  readonly defaultOpen?: never
  readonly onOpenChange: (open: boolean) => void
}

type UncontrolledOpenProps = {
  readonly open?: never
  readonly defaultOpen?: boolean
  readonly onOpenChange?: (open: boolean) => void
}

interface DatePickerOwnProps {
  /** Inclusive ISO civil-date bounds. Defaults to the source's 1900–2100 year range. */
  readonly min?: string
  readonly max?: string
  /** ISO dates that remain visible but cannot be selected. */
  readonly disabledDates?: readonly string[]
  /** Called with an ISO date to disable application-specific dates. */
  readonly isDateDisabled?: (value: string) => boolean
  /** BCP 47 locale(s) for Gregorian presentation. Defaults deterministically to `en-US`. */
  readonly locale?: string | readonly string[]
  /** Controlled calendar/text-entry mode. */
  readonly mode?: DatePickerMode
  readonly defaultMode?: DatePickerMode
  readonly onModeChange?: (mode: DatePickerMode) => void
  /** `docked` opens an anchored popup; `modal` opens a native Material Dialog. */
  readonly presentation?: DatePickerPresentation
  readonly open?: boolean
  readonly defaultOpen?: boolean
  readonly onOpenChange?: (open: boolean) => void
  readonly label: ReactNode
  readonly supportingText?: ReactNode
  readonly error?: boolean
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly required?: boolean
  /** Name of the real form-associated ISO date control. */
  readonly name?: string
  /** Associates the date control with a non-ancestor form. */
  readonly form?: string
  /** Additional owner-supplied validity message, merged after picker validation. */
  readonly customValidity?: string
  readonly onBlur?: FocusEventHandler<HTMLInputElement>
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly fieldVariant?: DatePickerFieldVariant
  /** Overrides individual English control/error strings for application localization. */
  readonly labels?: Partial<DatePickerLabels>
  /** ISO date used for the today marker and empty initial month; useful for deterministic SSR. */
  readonly today?: string
}

type NativeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  | keyof DatePickerOwnProps
  | 'children'
  | 'defaultValue'
  | 'value'
  | 'onChange'
  | 'type'
  | 'min'
  | 'max'
  | 'readOnly'
>

/**
 * `className` and `style` describe the component root. The forwarded ref,
 * `id`, native event handlers, and ARIA attributes belong to the visible
 * trigger field.
 */
export type DatePickerProps = DatePickerOwnProps &
  (ControlledValueProps | UncontrolledValueProps) &
  (ControlledModeProps | UncontrolledModeProps) &
  (ControlledOpenProps | UncontrolledOpenProps) &
  NativeInputProps
