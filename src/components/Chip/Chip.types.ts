import type { ComponentPropsWithRef, ReactNode } from 'react'

export type ChipKind = 'assist' | 'filter' | 'input' | 'suggestion'
export type ChipVariant = 'flat' | 'elevated'
export type ChipShape = 'standard' | 'expressive'

interface ChipCommonProps {
  /** Visible text or other non-interactive label content. */
  readonly children: ReactNode
  /** Material chip purpose and semantic state model. */
  readonly kind: ChipKind
  /** Flat or elevated Material treatment. Input chips are flat only. */
  readonly variant?: ChipVariant
  /** Decorative visual at the logical start of the label. */
  readonly leadingIcon?: ReactNode
}

interface MomentaryChipSelectionProps {
  readonly selected?: never
  readonly defaultSelected?: never
  readonly onSelectedChange?: never
}

interface ControlledChipSelectionProps {
  /** Controlled selected state. */
  readonly selected: boolean
  readonly defaultSelected?: never
  readonly onSelectedChange: (selected: boolean) => void
}

interface UncontrolledChipSelectionProps {
  readonly selected?: never
  /** Initial selected state when selection is uncontrolled. */
  readonly defaultSelected?: boolean
  readonly onSelectedChange?: (selected: boolean) => void
}

type SelectableChipSelectionProps =
  | ControlledChipSelectionProps
  | UncontrolledChipSelectionProps

interface AssistChipProps extends ChipCommonProps, MomentaryChipSelectionProps {
  readonly kind: 'assist'
  readonly trailingIcon?: ReactNode
  readonly avatar?: never
  readonly shape?: never
}

interface SuggestionChipProps extends ChipCommonProps, MomentaryChipSelectionProps {
  readonly kind: 'suggestion'
  readonly trailingIcon?: never
  readonly avatar?: never
  readonly shape?: never
}

interface FilterChipOwnProps extends ChipCommonProps {
  readonly kind: 'filter'
  readonly trailingIcon?: ReactNode
  readonly avatar?: never
  /** Static baseline corners or the sourced Expressive selected/pressed morph. */
  readonly shape?: ChipShape
}

interface InputChipOwnProps extends ChipCommonProps {
  readonly kind: 'input'
  readonly variant?: 'flat'
  readonly trailingIcon?: ReactNode
  /** Decorative 24px circular visual. When present it replaces leadingIcon. */
  readonly avatar?: ReactNode
  /** Static baseline corners or the sourced Expressive selected/pressed morph. */
  readonly shape?: ChipShape
}

type ChipOwnProps =
  | AssistChipProps
  | SuggestionChipProps
  | (FilterChipOwnProps & SelectableChipSelectionProps)
  | (InputChipOwnProps & SelectableChipSelectionProps)

type ChipNativeProps = Omit<
  ComponentPropsWithRef<'button'>,
  'aria-pressed' | 'children'
>

/** Props for a native Material 3 chip covering assist, filter, input, and suggestion purposes. */
export type ChipProps = ChipNativeProps & ChipOwnProps
