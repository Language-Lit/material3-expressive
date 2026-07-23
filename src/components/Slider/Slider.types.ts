import type {
  ComponentPropsWithRef,
  ComponentPropsWithoutRef,
  CSSProperties,
  ReactNode,
  Ref,
} from 'react'

export type SliderOrientation = 'horizontal' | 'vertical'
export type RangeSliderValue = readonly [start: number, end: number]

export interface SliderVisualState {
  readonly value: number
  readonly min: number
  readonly max: number
  readonly fraction: number
  readonly disabled: boolean
  readonly orientation: SliderOrientation
  readonly centered: boolean
}

export interface SliderTickState extends SliderVisualState {
  readonly index: number
  readonly active: boolean
}

export interface SliderStopIndicatorState extends SliderVisualState {
  readonly edge: 'start' | 'end'
  readonly active: boolean
}

export interface RangeSliderVisualState {
  readonly value: RangeSliderValue
  readonly min: number
  readonly max: number
  readonly fractions: RangeSliderValue
  readonly disabled: boolean
}

type SliderVisualSlot<TState> = ReactNode | ((state: TState) => ReactNode)

interface SliderCommonOwnProps {
  /** Lowest value accepted by the slider. */
  readonly min?: number
  /** Highest value accepted by the slider. Must be greater than `min`. */
  readonly max?: number
  /**
   * Number of discrete values between the two endpoints. Zero (default)
   * keeps pointer interaction continuous and uses the source's 1% keyboard
   * increment.
   */
  readonly steps?: number
  readonly disabled?: boolean
  /** Called once when a pointer, keyboard, or accessibility value change finishes. */
  readonly onValueChangeFinished?: () => void
  /** Passive replacement for the sourced default handle visual. */
  readonly thumb?: SliderVisualSlot<SliderVisualState>
  /** Passive artwork layered over the authored track. */
  readonly trackContent?: SliderVisualSlot<SliderVisualState>
  /** Passive replacement for an individual discrete tick. */
  readonly renderTick?: (state: SliderTickState) => ReactNode
  /** Passive replacement for an endpoint stop indicator. */
  readonly renderStopIndicator?: (state: SliderStopIndicatorState) => ReactNode
  /** Set false to mirror `drawStopIndicator = null`. */
  readonly showStopIndicator?: boolean
}

interface ControlledSliderValueProps {
  readonly value: number
  readonly defaultValue?: never
  readonly onValueChange: (value: number) => void
}

interface UncontrolledSliderValueProps {
  readonly value?: never
  readonly defaultValue?: number
  readonly onValueChange?: (value: number) => void
}

type SliderNativeProps = Omit<
  ComponentPropsWithRef<'input'>,
  | 'aria-orientation'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'children'
  | 'className'
  | 'defaultValue'
  | 'disabled'
  | 'max'
  | 'min'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
  | 'role'
  | 'size'
  | 'step'
  | 'style'
  | 'type'
  | 'value'
>

/**
 * Props for a single native-range-backed Material slider. `className` and
 * `style` describe the visual root; the forwarded ref and remaining native
 * attributes belong to the input.
 */
export type SliderProps = SliderNativeProps &
  SliderCommonOwnProps &
  (ControlledSliderValueProps | UncontrolledSliderValueProps) & {
    readonly className?: string
    readonly style?: CSSProperties
    readonly orientation?: SliderOrientation
    /** Vertical direction only. The source default is minimum at the top. */
    readonly topToBottom?: boolean
    /** Draw the active track from its geometric center. */
    readonly centered?: boolean
  }

export type RangeSliderInputProps = Omit<
  ComponentPropsWithoutRef<'input'>,
  | 'aria-orientation'
  | 'aria-valuemax'
  | 'aria-valuemin'
  | 'aria-valuenow'
  | 'children'
  | 'className'
  | 'defaultValue'
  | 'disabled'
  | 'max'
  | 'min'
  | 'onKeyDown'
  | 'onKeyUp'
  | 'onPointerCancel'
  | 'onPointerDown'
  | 'onPointerMove'
  | 'onPointerUp'
  | 'role'
  | 'size'
  | 'step'
  | 'style'
  | 'type'
  | 'value'
>

interface RangeSliderCommonOwnProps
  extends Omit<SliderCommonOwnProps, 'thumb' | 'trackContent'> {
  /** Localized accessible name for the lower-value thumb. */
  readonly startAriaLabel: string
  /** Localized accessible name for the upper-value thumb. */
  readonly endAriaLabel: string
  readonly startThumb?: SliderVisualSlot<SliderVisualState>
  readonly endThumb?: SliderVisualSlot<SliderVisualState>
  readonly trackContent?: SliderVisualSlot<RangeSliderVisualState>
  readonly startInputProps?: RangeSliderInputProps
  readonly endInputProps?: RangeSliderInputProps
  readonly startInputRef?: Ref<HTMLInputElement>
  readonly endInputRef?: Ref<HTMLInputElement>
}

interface ControlledRangeSliderValueProps {
  readonly value: RangeSliderValue
  readonly defaultValue?: never
  readonly onValueChange: (value: RangeSliderValue) => void
}

interface UncontrolledRangeSliderValueProps {
  readonly value?: never
  readonly defaultValue?: RangeSliderValue
  readonly onValueChange?: (value: RangeSliderValue) => void
}

type RangeSliderRootProps = Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'defaultValue' | 'onChange' | 'role'
>

/**
 * Props for a two-thumb Material range slider. The forwarded ref belongs to
 * the grouping root; `startInputRef` and `endInputRef` expose its two native
 * range controls.
 */
export type RangeSliderProps = RangeSliderRootProps &
  RangeSliderCommonOwnProps &
  (ControlledRangeSliderValueProps | UncontrolledRangeSliderValueProps)
