import type {
  ComponentPropsWithRef,
  FocusEventHandler,
  ReactNode,
} from 'react'
import type {
  DatePickerFieldVariant,
  DatePickerLabels,
  DatePickerMode,
  DatePickerPresentation,
} from './DatePicker.types'

export interface DateRangeValue {
  readonly start: string
  readonly end: string
}

type ControlledRangeValueProps = {
  readonly value: DateRangeValue
  readonly defaultValue?: never
  readonly onValueChange: (value: DateRangeValue) => void
}

type UncontrolledRangeValueProps = {
  readonly value?: never
  readonly defaultValue?: DateRangeValue
  readonly onValueChange?: (value: DateRangeValue) => void
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

interface DateRangePickerOwnProps {
  readonly min?: string
  readonly max?: string
  readonly disabledDates?: readonly string[]
  readonly isDateDisabled?: (value: string) => boolean
  readonly locale?: string | readonly string[]
  readonly mode?: DatePickerMode
  readonly defaultMode?: DatePickerMode
  readonly onModeChange?: (mode: DatePickerMode) => void
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
  readonly startName?: string
  readonly endName?: string
  /** Associates both date controls with a non-ancestor form. */
  readonly form?: string
  readonly customValidity?: string
  readonly onBlur?: FocusEventHandler<HTMLInputElement>
  readonly confirmLabel?: string
  readonly cancelLabel?: string
  readonly fieldVariant?: DatePickerFieldVariant
  readonly labels?: Partial<DatePickerLabels>
  readonly today?: string
}

type NativeInputProps = Omit<
  ComponentPropsWithRef<'input'>,
  | keyof DateRangePickerOwnProps
  | 'children'
  | 'defaultValue'
  | 'value'
  | 'onChange'
  | 'type'
  | 'min'
  | 'max'
  | 'name'
  | 'readOnly'
>

/**
 * `className` and `style` describe the component root. The forwarded ref,
 * `id`, native event handlers, and ARIA attributes belong to the visible
 * range trigger field.
 */
export type DateRangePickerProps = DateRangePickerOwnProps &
  (ControlledRangeValueProps | UncontrolledRangeValueProps) &
  (ControlledModeProps | UncontrolledModeProps) &
  (ControlledOpenProps | UncontrolledOpenProps) &
  NativeInputProps
