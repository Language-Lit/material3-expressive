import type { FocusEventHandler, HTMLAttributes, ReactNode, Ref } from 'react'
import type { DatePickerMode, DatePickerPresentation } from '../DatePicker'
import type { TextFieldVariant } from '../TextField'
import type { TimePickerMode } from '../TimePicker'

/** A local civil date and time serialized without an offset or time zone. */
export type DateTimePickerValue = string

type ControlledValueProps = {
  readonly value: DateTimePickerValue
  readonly defaultValue?: never
  readonly onValueChange: (value: DateTimePickerValue) => void
}

type UncontrolledValueProps = {
  readonly value?: never
  readonly defaultValue?: DateTimePickerValue
  readonly onValueChange?: (value: DateTimePickerValue) => void
}

type ControlledDateModeProps = {
  readonly dateMode: DatePickerMode
  readonly defaultDateMode?: never
  readonly onDateModeChange: (mode: DatePickerMode) => void
}

type UncontrolledDateModeProps = {
  readonly dateMode?: never
  readonly defaultDateMode?: DatePickerMode
  readonly onDateModeChange?: (mode: DatePickerMode) => void
}

type ControlledTimeModeProps = {
  readonly timeMode: TimePickerMode
  readonly defaultTimeMode?: never
  readonly onTimeModeChange: (mode: TimePickerMode) => void
}

type UncontrolledTimeModeProps = {
  readonly timeMode?: never
  readonly defaultTimeMode?: TimePickerMode
  readonly onTimeModeChange?: (mode: TimePickerMode) => void
}

interface DateTimePickerOwnProps {
  /** Earliest allowed local civil value, inclusive, in strict `YYYY-MM-DDTHH:mm` form. */
  readonly min?: DateTimePickerValue
  /** Latest allowed local civil value, inclusive, in strict `YYYY-MM-DDTHH:mm` form. */
  readonly max?: DateTimePickerValue
  /** Locale used only to present the two civil fields. It never changes the stored value. */
  readonly locale?: string | readonly string[]
  readonly hour12?: boolean
  readonly presentation?: DatePickerPresentation
  readonly fieldVariant?: TextFieldVariant
  /** Visible label for the composed date-and-time group. */
  readonly label: ReactNode
  /** Visible label for the date field. Defaults to `Date`. */
  readonly dateLabel?: ReactNode
  /** Visible label for the time field. Defaults to `Time`. */
  readonly timeLabel?: ReactNode
  readonly supportingText?: ReactNode
  readonly error?: boolean
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly required?: boolean
  /** Name of the single submitted `YYYY-MM-DDTHH:mm` form value. */
  readonly name?: string
  /** Associates both visible validity controls and the submitted value with an external form. */
  readonly form?: string
  readonly onBlur?: FocusEventHandler<HTMLInputElement>
  readonly confirmLabel?: string
  readonly cancelLabel?: string
}

type NativeRootProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  keyof DateTimePickerOwnProps | 'defaultValue' | 'onChange'
>

/**
 * Props for the date-time composition. The forwarded ref targets the visible
 * date field; `className`, `style`, and other native attributes describe the
 * group root.
 */
export type DateTimePickerProps = DateTimePickerOwnProps &
  (ControlledValueProps | UncontrolledValueProps) &
  (ControlledDateModeProps | UncontrolledDateModeProps) &
  (ControlledTimeModeProps | UncontrolledTimeModeProps) &
  NativeRootProps & {
    readonly ref?: Ref<HTMLInputElement>
  }
