import {
  Children,
  forwardRef,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type DragEvent,
  type ForwardedRef,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { useControllableState } from '../../internal/useControllableState'
import { Text } from '../Text'
import type {
  ChipKind,
  ChipProps,
  ChipShape,
  ChipVariant,
} from './Chip.types'

interface ChipImplementationProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'aria-pressed' | 'children'> {
  readonly children: ReactNode
  readonly kind?: ChipKind
  readonly variant?: ChipVariant
  readonly shape?: ChipShape
  readonly leadingIcon?: ReactNode
  readonly trailingIcon?: ReactNode
  readonly avatar?: ReactNode
  readonly selected?: boolean
  readonly defaultSelected?: boolean
  readonly onSelectedChange?: (selected: boolean) => void
}

interface ChipComponent {
  (props: ChipProps): ReactElement | null
  displayName?: string
}

interface RetainedSlot {
  readonly content: ReactNode
  readonly kind: 'avatar' | 'icon'
}

function hasSlotContent(content: ReactNode): boolean {
  return content !== null && content !== undefined && content !== false
}

function hasVisibleContent(children: ReactNode): boolean {
  let hasContent = false
  Children.forEach(children, (child) => {
    if (hasContent || child === null || child === undefined || typeof child === 'boolean') return
    if (typeof child === 'string') {
      hasContent = child.trim().length > 0
      return
    }
    hasContent = true
  })
  return hasContent
}

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`Chip: ${message}`)
  }
}

function useRetainedSlot(
  content: ReactNode,
  kind: 'avatar' | 'icon',
  retain: boolean,
): RetainedSlot {
  const retained = useRef<RetainedSlot>({ content: null, kind })
  if (hasSlotContent(content)) retained.current = { content, kind }
  return retain ? retained.current : { content, kind }
}

function ChipRender(
  {
    children,
    kind: requestedKind,
    variant: requestedVariant = 'flat',
    shape: requestedShape = 'standard',
    leadingIcon,
    trailingIcon,
    avatar,
    selected,
    defaultSelected,
    onSelectedChange,
    type = 'button',
    disabled = false,
    draggable = false,
    className,
    onClick,
    onDragStart,
    onDragEnd,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...buttonProps
  }: ChipImplementationProps,
  forwardedRef: ForwardedRef<HTMLButtonElement>,
) {
  const validKind =
    requestedKind === 'assist' ||
    requestedKind === 'filter' ||
    requestedKind === 'input' ||
    requestedKind === 'suggestion'
  const kind: ChipKind = validKind ? requestedKind : 'assist'
  const selectable = kind === 'filter' || kind === 'input'
  const variant: ChipVariant =
    kind === 'input' && requestedVariant === 'elevated' ? 'flat' : requestedVariant
  const shape: ChipShape = selectable ? requestedShape : 'standard'

  if (!validKind) warn('provide kind="assist", "filter", "input", or "suggestion".')
  if (kind === 'input' && requestedVariant === 'elevated') {
    warn('input chips have no elevated Material variant; rendering the flat treatment.')
  }
  if (!selectable && requestedShape === 'expressive') {
    warn('shape="expressive" is available only for filter and input chips.')
  }
  if (!selectable && (selected !== undefined || defaultSelected !== undefined)) {
    warn('selected and defaultSelected require kind="filter" or kind="input".')
  }
  if (selected !== undefined && defaultSelected !== undefined) {
    warn('use either selected or defaultSelected, not both.')
  }
  if (selectable && selected !== undefined && onSelectedChange === undefined) {
    warn('a controlled selected value requires onSelectedChange.')
  }
  if (kind !== 'input' && hasSlotContent(avatar)) {
    warn('avatar is available only on input chips.')
  }
  if (kind === 'suggestion' && hasSlotContent(trailingIcon)) {
    warn('suggestion chips support only a leading icon; trailingIcon is ignored.')
  }
  if (!hasVisibleContent(children) && !ariaLabel?.trim() && !ariaLabelledBy?.trim()) {
    warn('provide non-empty label content, aria-label, or aria-labelledby.')
  }

  const [resolvedSelected, setSelected] = useControllableState({
    value: selectable ? selected : undefined,
    defaultValue: selectable ? (defaultSelected ?? false) : false,
    onChange: selectable ? onSelectedChange : undefined,
  })
  const [dragged, setDragged] = useState(false)
  const hasAvatar = kind === 'input' && hasSlotContent(avatar)
  const resolvedLeading = hasAvatar ? avatar : leadingIcon
  const hasLeading = hasSlotContent(resolvedLeading)
  const resolvedTrailing = kind === 'suggestion' ? null : trailingIcon
  const hasTrailing = hasSlotContent(resolvedTrailing)
  const retainedLeading = useRetainedSlot(
    resolvedLeading,
    hasAvatar ? 'avatar' : 'icon',
    selectable,
  )
  const retainedTrailing = useRetainedSlot(resolvedTrailing, 'icon', selectable)
  const mergedClassName = className ? `m3e-chip ${className}` : 'm3e-chip'
  const handleClick = composeEventHandlers<MouseEvent<HTMLButtonElement>>(
    onClick,
    selectable ? () => setSelected(!resolvedSelected) : undefined,
  )
  const handleDragStart = composeEventHandlers<DragEvent<HTMLButtonElement>>(
    onDragStart,
    draggable ? () => setDragged(true) : undefined,
  )
  const handleDragEnd = (event: DragEvent<HTMLButtonElement>) => {
    onDragEnd?.(event)
    setDragged(false)
  }

  return (
    <button
      {...buttonProps}
      ref={forwardedRef}
      type={type}
      disabled={disabled}
      draggable={draggable}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-pressed={selectable ? resolvedSelected : undefined}
      className={mergedClassName}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      data-m3e-kind={kind}
      data-m3e-variant={variant}
      data-m3e-shape={shape}
      data-m3e-selectable={selectable}
      data-m3e-selected={selectable ? resolvedSelected : undefined}
      data-m3e-disabled={disabled}
      data-m3e-dragged={dragged}
      data-m3e-has-leading={hasLeading}
      data-m3e-has-trailing={hasTrailing}
      data-m3e-has-avatar={hasAvatar}
    >
      <span className="m3e-chip__container">
        <span
          className="m3e-chip__slot"
          data-m3e-position="leading"
          data-m3e-slot={retainedLeading.kind}
          data-m3e-visible={hasLeading}
          aria-hidden="true"
        >
          {retainedLeading.content}
        </span>
        <Text as="span" variant="labelLarge" className="m3e-chip__label">
          {children}
        </Text>
        <span
          className="m3e-chip__slot"
          data-m3e-position="trailing"
          data-m3e-slot="icon"
          data-m3e-visible={hasTrailing}
          aria-hidden="true"
        >
          {retainedTrailing.content}
        </span>
      </span>
    </button>
  )
}

const ForwardedChip = forwardRef<HTMLButtonElement, ChipProps>(ChipRender)
ForwardedChip.displayName = 'Chip'

export const Chip = ForwardedChip as ChipComponent
