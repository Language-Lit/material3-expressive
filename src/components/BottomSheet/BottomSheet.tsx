import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type DialogHTMLAttributes,
  type ForwardedRef,
  type HTMLAttributes,
  type MouseEventHandler,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactEventHandler,
  type ReactNode,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { composeRefs } from '../../internal/composeRefs'
import { useControllableState } from '../../internal/useControllableState'
import type {
  BottomSheetProps,
  BottomSheetState,
  BottomSheetVariant,
} from './BottomSheet.types'

interface BottomSheetImplementationProps extends HTMLAttributes<HTMLElement> {
  readonly variant?: BottomSheetVariant
  readonly value?: BottomSheetState
  readonly defaultValue?: BottomSheetState
  readonly onValueChange?: (value: BottomSheetState) => void
  readonly confirmValueChange?: (value: BottomSheetState) => boolean
  readonly peekHeight?: number
  readonly dragHandle?: boolean
  readonly gesturesEnabled?: boolean
  readonly dismissOnEscape?: boolean
  readonly dismissOnScrimClick?: boolean
  readonly children?: ReactNode
}

interface BottomSheetComponent {
  (props: BottomSheetProps): ReactElement | null
  displayName?: string
}

/**
 * `BottomSheetDefaults.PositionalThreshold` and `VelocityThreshold`. The source
 * settles to the next anchor once a drag passes 56dp of travel, or below that
 * once the release velocity passes 125dp/s.
 */
const POSITIONAL_THRESHOLD = 56
const VELOCITY_THRESHOLD = 125

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`BottomSheet: ${message}`)
  }
}

function warnForInvalidProps({
  value,
  defaultValue,
  onValueChange,
  variant,
  peekHeight,
  hasAccessibleName,
}: {
  readonly value: BottomSheetState | undefined
  readonly defaultValue: BottomSheetState | undefined
  readonly onValueChange: ((value: BottomSheetState) => void) | undefined
  readonly variant: BottomSheetVariant
  readonly peekHeight: number | undefined
  readonly hasAccessibleName: boolean
}): void {
  if (value !== undefined && defaultValue !== undefined) {
    warn('use either value or defaultValue, not both.')
  }
  if (value !== undefined && onValueChange === undefined) {
    warn('a controlled value requires onValueChange.')
  }
  if (variant === 'modal' && peekHeight !== undefined) {
    warn(
      'peekHeight applies to the standard variant only; a modal sheet anchors its partially expanded state at half its container.',
    )
  }
  if (!hasAccessibleName) {
    warn('a bottom sheet requires an accessible name: pass aria-label or aria-labelledby.')
  }
}

/**
 * The source's drag-handle click cycle. `BottomSheet` dismisses an expanded
 * sheet outright, while `BottomSheetScaffold` collapses it when its hidden
 * state is skipped; a standard sheet here always has a peek height to fall
 * back to, so it collapses and only a modal sheet dismisses.
 */
function nextStateForActivation(
  current: BottomSheetState,
  variant: BottomSheetVariant,
): BottomSheetState {
  if (current === 'expanded') {
    return variant === 'modal' ? 'hidden' : 'partiallyExpanded'
  }
  if (current === 'partiallyExpanded') return 'expanded'
  return 'partiallyExpanded'
}

/**
 * Mirrors the source's semantics block, which publishes `dismiss` plus either
 * `expand` (when partially expanded) or `collapse` (when a partial anchor
 * exists to collapse to).
 */
function activationLabel(current: BottomSheetState, variant: BottomSheetVariant): string {
  const next = nextStateForActivation(current, variant)
  if (next === 'hidden') return 'Dismiss bottom sheet'
  if (next === 'expanded') return 'Expand bottom sheet'
  return 'Collapse bottom sheet'
}

interface DragSession {
  readonly pointerId: number
  readonly startY: number
  readonly startState: BottomSheetState
  lastY: number
  lastTime: number
  velocity: number
  offset: number
  dragging: boolean
}

function BottomSheetRender(
  {
    variant = 'modal',
    value,
    // Deliberately not defaulted here: `warnForInvalidProps` has to be able to
    // tell "no defaultValue given" from "defaultValue given", or every
    // controlled sheet would be warned for passing both.
    defaultValue,
    onValueChange,
    confirmValueChange,
    peekHeight,
    dragHandle = true,
    gesturesEnabled = true,
    dismissOnEscape = true,
    dismissOnScrimClick = true,
    children,
    className,
    style,
    id: idProp,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    ...elementProps
  }: BottomSheetImplementationProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const rootRef = useRef<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const sessionRef = useRef<DragSession | null>(null)
  // Suppresses the settle transition while a finger is down, so the sheet
  // tracks the pointer instead of easing toward each intermediate offset.
  const [isDragging, setIsDragging] = useState(false)
  const generatedId = useId()
  const sheetId = idProp ?? generatedId

  warnForInvalidProps({
    value,
    defaultValue,
    onValueChange,
    variant,
    peekHeight,
    hasAccessibleName: ariaLabel != null || ariaLabelledBy != null,
  })

  const [resolvedValue, setValueUnchecked] = useControllableState({
    value,
    defaultValue: defaultValue ?? 'hidden',
    onChange: onValueChange,
  })

  // `confirmValueChange` gates every path into a new state — drag, click,
  // keyboard, Escape and scrim alike — exactly as the source gates `animateTo`.
  const setValue = (next: BottomSheetState) => {
    if (confirmValueChange && !confirmValueChange(next)) return
    setValueUnchecked(next)
  }
  const setValueRef = useRef(setValue)
  setValueRef.current = setValue

  const isModal = variant === 'modal'
  const isOpen = resolvedValue !== 'hidden'

  // Native `<dialog>`'s modal behavior — backdrop, focus trap, inert
  // background, focus restoration — only exists once `showModal()` runs, so
  // SSR always paints closed and this effect performs every open and close
  // imperatively. Same lifecycle Dialog and NavigationDrawer run (ADR 0016).
  useEffect(() => {
    if (!isModal) return
    const dialogEl = rootRef.current as HTMLDialogElement | null
    if (!dialogEl) return
    if (isOpen && !dialogEl.open) dialogEl.showModal()
    else if (!isOpen && dialogEl.open) dialogEl.close()
  }, [isModal, isOpen])

  // The native `close` event is the single path back to the controlled value,
  // firing for Escape and for the scrim handler's own `close()` call alike.
  useEffect(() => {
    if (!isModal) return undefined
    const dialogEl = rootRef.current as HTMLDialogElement | null
    if (!dialogEl) return undefined
    const handleNativeClose = () => setValueRef.current('hidden')
    dialogEl.addEventListener('close', handleNativeClose)
    return () => dialogEl.removeEventListener('close', handleNativeClose)
  }, [isModal])

  const handleCancel: ReactEventHandler<HTMLElement> = (event) => {
    if (!dismissOnEscape) event.preventDefault()
  }

  // Native `<dialog>` has no automatic light dismissal at this library's
  // browser floor, so a click landing on the dialog element itself — never a
  // descendant — is a click on the scrim. The sheet is a child, so unlike
  // Dialog no bounding-rect test is needed to tell the two apart.
  const handleScrimClick: MouseEventHandler<HTMLElement> = (event) => {
    if (!isModal || !dismissOnScrimClick) return
    if (event.target !== rootRef.current) return
    setValue('hidden')
  }

  const handleActivate = () => {
    setValue(nextStateForActivation(resolvedValue, variant))
  }

  const applyDragOffset = (offset: number) => {
    const container = containerRef.current
    if (!container) return
    container.style.setProperty('--m3e-bottom-sheet-drag-offset', `${offset}px`)
  }

  const clearDragOffset = () => {
    containerRef.current?.style.removeProperty('--m3e-bottom-sheet-drag-offset')
  }

  /**
   * Settles to the state the source's fling behavior would choose: the next
   * anchor along the drag direction once the travel passes the positional
   * threshold or the release passes the velocity threshold, otherwise back to
   * where the drag started.
   *
   * Dragging down out of `partiallyExpanded` only reaches `hidden` on a modal
   * sheet. The source's standard sheet is created with
   * `enabledValues = setOf(PartiallyExpanded, Expanded)`, so it has no hidden
   * anchor to settle onto and stays at its peek height.
   */
  const settle = (session: DragSession): BottomSheetState => {
    const passedPosition = Math.abs(session.offset) >= POSITIONAL_THRESHOLD
    const passedVelocity = Math.abs(session.velocity) >= VELOCITY_THRESHOLD
    if (!passedPosition && !passedVelocity) return session.startState

    const downward = session.offset > 0
    if (!downward) return 'expanded'
    if (session.startState === 'expanded') return 'partiallyExpanded'
    return isModal ? 'hidden' : 'partiallyExpanded'
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!gesturesEnabled || sessionRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    sessionRef.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startState: resolvedValue,
      lastY: event.clientY,
      lastTime: event.timeStamp,
      velocity: 0,
      offset: 0,
      dragging: false,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const session = sessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    const offset = event.clientY - session.startY
    if (!session.dragging) {
      if (Math.abs(offset) < 1) return
      session.dragging = true
      setIsDragging(true)
    }
    const elapsed = event.timeStamp - session.lastTime
    if (elapsed > 0) {
      session.velocity = ((event.clientY - session.lastY) / elapsed) * 1000
      session.lastY = event.clientY
      session.lastTime = event.timeStamp
    }
    session.offset = offset
    event.preventDefault()
    applyDragOffset(offset)
  }

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>, settled: boolean) => {
    const session = sessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    sessionRef.current = null
    clearDragOffset()
    setIsDragging(false)
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    // A press that never moved is a click; the button's own click handler
    // runs the source's activation cycle, so nothing is settled here.
    if (!session.dragging) return
    if (settled) setValue(settle(session))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLButtonElement>) => endDrag(event, true)
  const handlePointerCancel = (event: ReactPointerEvent<HTMLButtonElement>) =>
    endDrag(event, false)

  const mergedClassName = className ? `m3e-bottom-sheet ${className}` : 'm3e-bottom-sheet'
  const containerStyle =
    peekHeight !== undefined && !isModal
      ? ({ '--m3e-comp-bottom-sheet-peek-height': `${peekHeight}px` } as CSSProperties)
      : undefined

  // The accessible name belongs on the root, not on this box. A modal sheet's
  // root is a native `<dialog>`, which already carries the `dialog` role and —
  // once `showModal()` runs — native modality; naming an inner box instead
  // would leave an unnamed dialog wrapping a named one. A standard sheet is
  // not a dialog at all: it docks inline and leaves the page live, so it is
  // named as a `region`, the web semantic for the source's `paneTitle`.
  const sheet = (
    <div
      ref={containerRef}
      className="m3e-bottom-sheet__container"
      style={containerStyle}
      data-m3e-dragging={isDragging || undefined}
    >
      {dragHandle && (
        <button
          type="button"
          className="m3e-bottom-sheet__drag-handle"
          aria-label={activationLabel(resolvedValue, variant)}
          aria-expanded={resolvedValue === 'expanded'}
          aria-controls={`${sheetId}-content`}
          onClick={handleActivate}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <span className="m3e-bottom-sheet__drag-handle-bar" aria-hidden="true" />
        </button>
      )}
      <div className="m3e-bottom-sheet__content" id={`${sheetId}-content`}>
        {children}
      </div>
    </div>
  )

  if (isModal) {
    const dialogProps = elementProps as DialogHTMLAttributes<HTMLDialogElement>
    return (
      <dialog
        {...dialogProps}
        ref={composeRefs(forwardedRef, rootRef) as ForwardedRef<HTMLDialogElement>}
        id={sheetId}
        className={mergedClassName}
        style={style as CSSProperties}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledBy}
        data-m3e-variant={variant}
        data-m3e-state={resolvedValue}
        onCancel={composeEventHandlers(dialogProps.onCancel, handleCancel)}
        onClick={composeEventHandlers(dialogProps.onClick, handleScrimClick)}
      >
        {sheet}
      </dialog>
    )
  }

  return (
    <div
      {...elementProps}
      ref={composeRefs(forwardedRef, rootRef) as ForwardedRef<HTMLDivElement>}
      id={sheetId}
      className={mergedClassName}
      style={style as CSSProperties}
      role="region"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      data-m3e-variant={variant}
      data-m3e-state={resolvedValue}
    >
      {sheet}
    </div>
  )
}

const ForwardedBottomSheet = forwardRef<HTMLElement, BottomSheetImplementationProps>(
  BottomSheetRender,
)
ForwardedBottomSheet.displayName = 'BottomSheet'

export const BottomSheet = ForwardedBottomSheet as BottomSheetComponent
