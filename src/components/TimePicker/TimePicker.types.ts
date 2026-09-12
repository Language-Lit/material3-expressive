import type {
  ComponentPropsWithRef,
  FocusEventHandler,
  ReactNode,
} from 'react'
import type { TextFieldVariant } from '../TextField'

/** A local civil time serialized without a date, offset, or time zone. */
export type TimePickerValue = string

/** The two first-party Material time-selection surfaces. */
export type TimePickerMode = 'dial' | 'input'

/** Inline selection or a field-backed native modal dialog. */
export type TimePickerPresentation = 'docked' | 'modal'

/** Portrait-style stacking or the source's landscape clock-and-dial row. */
export type TimePickerLayout = 'vertical' | 'horizontal'

type ControlledValueProps = {
  readonly value: TimePickerValue
  readonly defaultValue?: never
  readonly onValueChange: (value: TimePickerValue) => void
}

type UncontrolledValueProps = {
  readonly value?: never
  readonly defaultValue?: TimePickerValue
  readonly onValueChange?: (value: TimePickerValue) => void
}

type ControlledModeProps = {
  readonly mode: TimePickerMode
  readonly defaultMode?: never
  readonly onModeChange: (mode: TimePickerMode) => void
}

type UncontrolledModeProps = {
  readonly mode?: never
  readonly defaultMode?: TimePickerMode
  readonly onModeChange?: (mode: TimePickerMode) => void
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

interface TimePickerOwnProps {
  /** Earliest selectable civil time, inclusive, in strict `HH:mm` form. */
  readonly min?: TimePickerValue
  /** Latest selectable civil time, inclusive, in strict `HH:mm` form. Overnight ranges are not inferred. */
  readonly max?: TimePickerValue
  /** Locale used for dial numerals and day-period labels. Defaults to deterministic `en-US`. */
  readonly locale?: string | readonly string[]
  /** Overrides the locale's 12/24-hour display preference without changing the stored `HH:mm` value. */
  readonly hour12?: boolean
  readonly presentation?: TimePickerPresentation
  /** Source layout variant. Defaults to `vertical`. */
  readonly layout?: TimePickerLayout
  readonly fieldVariant?: TextFieldVariant
  readonly label: ReactNode
  readonly supportingText?: ReactNode
  readonly error?: boolean
  readonly disabled?: boolean
  readonly readOnly?: boolean
  readonly required?: boolean
  readonly name?: string
  /** Additional consumer-owned validity, merged after this component's own format and bounds checks. */
  readonly customValidity?: string
  /** Passed to the form-associated visible text field. */
  readonly onBlur?: FocusEventHandler<HTMLInputElement>
  readonly confirmLabel?: ReactNode
  readonly cancelLabel?: ReactNode
}

type NativeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  | keyof TimePickerOwnProps
  | 'children'
  | 'defaultValue'
  | 'value'
  | 'onChange'
  | 'type'
  | 'min'
  | 'max'
  | 'pattern'
  | 'inputMode'
  | 'readOnly'
>

/**
 * Props for a Material time picker. `className` and `style` describe the
 * component root; the forwarded ref and remaining native props belong to its
 * visible, form-associated text field.
 */
export type TimePickerProps = TimePickerOwnProps &
  (ControlledValueProps | UncontrolledValueProps) &
  (ControlledModeProps | UncontrolledModeProps) &
  (ControlledOpenProps | UncontrolledOpenProps) &
  NativeInputProps
