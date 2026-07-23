import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ForwardedRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'
import { composeEventHandlers } from '../../internal/composeEventHandlers'
import { composeRefs } from '../../internal/composeRefs'
import { useControllableState } from '../../internal/useControllableState'
import {
  DEFAULT_MIN,
  SliderTrack,
  formatValueForSemantics,
  isHandledSliderKey,
  isRtl,
  normalizeBounds,
  snapValue,
  snapValueForSemantics,
  valueForKey,
  valueForPointer,
} from './Slider.shared'
import type { SliderOrientation, SliderProps } from './Slider.types'

interface SliderComponent {
  (props: SliderProps): ReactElement | null
  displayName?: string
}

interface PointerSession {
  readonly pointerId: number
  readonly startX: number
  readonly startY: number
  dragging: boolean
  tapCancelled: boolean
  pointerAdjustment: number
}

const POINTER_SLOP = 8

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`Slider: ${message}`)
  }
}

function warnForInvalidProps({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  steps,
  orientation,
}: Pick<
  SliderProps,
  'defaultValue' | 'max' | 'min' | 'onValueChange' | 'orientation' | 'steps' | 'value'
>): void {
  if (value !== undefined && defaultValue !== undefined) {
    warn('use either value or defaultValue, not both.')
  }
  if (value !== undefined && onValueChange === undefined) {
    warn('a controlled value requires onValueChange.')
  }
  if (min !== undefined && !Number.isFinite(min)) {
    warn(`min must be finite; received ${String(min)}.`)
  }
  if (max !== undefined && (!Number.isFinite(max) || max <= (min ?? DEFAULT_MIN))) {
    warn('max must be finite and greater than min.')
  }
  if (steps !== undefined && (!Number.isInteger(steps) || steps < 0)) {
    warn('steps must be a non-negative integer.')
  }
  if (orientation !== undefined && orientation !== 'horizontal' && orientation !== 'vertical') {
    warn('orientation must be "horizontal" or "vertical".')
  }
}

function SliderRender(
  {
    value,
    defaultValue,
    onValueChange,
    onValueChangeFinished,
    min,
    max,
    steps,
    disabled = false,
    orientation: requestedOrientation = 'horizontal',
    topToBottom = true,
    centered = false,
    thumb,
    trackContent,
    renderTick,
    renderStopIndicator,
    showStopIndicator = true,
    className,
    style,
    onChange,
    ...inputProps
  }: SliderProps,
  forwardedRef: ForwardedRef<HTMLInputElement>,
) {
  warnForInvalidProps({
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    steps,
    orientation: requestedOrientation,
  })

  const orientation: SliderOrientation =
    requestedOrientation === 'vertical' ? 'vertical' : 'horizontal'
  const bounds = normalizeBounds(min, max, steps)
  const initialValue = snapValue(defaultValue ?? bounds.min, bounds)
  const controlled = value !== undefined
  const [stateValue, setValue] = useControllableState({
    value,
    defaultValue: initialValue,
    onChange: onValueChange,
  })
  const resolvedValue = snapValue(stateValue, bounds)
  const valueRef = useRef(resolvedValue)
  valueRef.current = resolvedValue

  const rootRef = useRef<HTMLSpanElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pointerSessionRef = useRef<PointerSession | null>(null)
  const [activeThumb, setActiveThumb] = useState(false)

  useEffect(() => {
    const form = inputRef.current?.form
    if (controlled || !form) return undefined
    const handleReset = () => setValue(snapValue(defaultValue ?? bounds.min, bounds))
    form.addEventListener('reset', handleReset)
    return () => form.removeEventListener('reset', handleReset)
  }, [bounds, controlled, defaultValue, setValue])

  const updateFromCoordinates = (
    clientX: number,
    clientY: number,
    pointerAdjustment = 0,
  ) => {
    const root = rootRef.current
    if (!root) return
    const adjustedX =
      orientation === 'horizontal'
        ? clientX + pointerAdjustment
        : clientX
    const adjustedY =
      orientation === 'vertical'
        ? clientY + pointerAdjustment
        : clientY
    const nextValue = valueForPointer(
      adjustedX,
      adjustedY,
      root.getBoundingClientRect(),
      bounds,
      orientation,
      isRtl(root),
      topToBottom,
    )
    setValue(nextValue)
  }

  const updateFromPointer = (
    event: ReactPointerEvent<HTMLSpanElement>,
    session: PointerSession,
  ) => {
    updateFromCoordinates(
      event.clientX,
      event.clientY,
      session.pointerAdjustment,
    )
  }

  const clearPointerSession = (root: HTMLSpanElement, pointerId: number) => {
    pointerSessionRef.current = null
    setActiveThumb(false)
    if (root.hasPointerCapture?.(pointerId)) root.releasePointerCapture(pointerId)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (disabled || pointerSessionRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    pointerSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
      tapCancelled: false,
      pointerAdjustment: 0,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    inputRef.current?.focus({ preventScroll: true })
    setActiveThumb(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    if (!session.dragging) {
      const deltaX = event.clientX - session.startX
      const deltaY = event.clientY - session.startY
      const mainDelta = orientation === 'vertical' ? deltaY : deltaX
      if (Math.hypot(deltaX, deltaY) >= POINTER_SLOP) {
        session.tapCancelled = true
      }
      if (Math.abs(mainDelta) < POINTER_SLOP) {
        if (session.tapCancelled) setActiveThumb(false)
        return
      }
      session.pointerAdjustment = -Math.sign(mainDelta) * POINTER_SLOP
      session.dragging = true
      if (session.tapCancelled) {
        // A cross-axis move cancels the press interaction, but the source's
        // axis-specific draggable can still begin later if the browser has
        // not already converted the gesture into native scrolling.
        session.tapCancelled = false
      }
      if (disabled) {
        setActiveThumb(false)
        return
      }
      setActiveThumb(true)
    }

    event.preventDefault()
    updateFromPointer(event, session)
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    if (session.dragging) {
      updateFromPointer(event, session)
      onValueChangeFinished?.()
    } else if (!session.tapCancelled) {
      // detectTapGestures commits the press coordinate, not a sub-slop release
      // coordinate that may have drifted a few pixels.
      updateFromCoordinates(session.startX, session.startY)
      onValueChangeFinished?.()
    }
    clearPointerSession(event.currentTarget, event.pointerId)
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    if (session.dragging) onValueChangeFinished?.()
    clearPointerSession(event.currentTarget, event.pointerId)
  }

  const handleLostPointerCapture = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    if (session.dragging) onValueChangeFinished?.()
    pointerSessionRef.current = null
    setActiveThumb(false)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return
    const nextValue = valueForKey(event, {
      bounds,
      value: valueRef.current,
      orientation,
      reverseDirection:
        orientation === 'vertical' ? !topToBottom : isRtl(event.currentTarget),
    })
    if (nextValue === undefined) return
    event.preventDefault()
    setValue(nextValue)
  }

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !isHandledSliderKey(event.key, orientation)) return
    event.preventDefault()
    onValueChangeFinished?.()
  }

  const handleChange = composeEventHandlers<ChangeEvent<HTMLInputElement>>(
    onChange,
    (event) => {
      const nextValue = snapValueForSemantics(
        event.currentTarget.valueAsNumber,
        bounds,
      )
      if (Object.is(nextValue, valueRef.current)) return
      setValue(nextValue)
      onValueChangeFinished?.()
    },
  )

  const mergedClassName = className ? `m3e-slider ${className}` : 'm3e-slider'
  const nativeStep =
    bounds.steps > 0 ? (bounds.max - bounds.min) / (bounds.steps + 1) : 'any'
  const ariaValueText =
    inputProps['aria-valuetext'] ?? formatValueForSemantics(resolvedValue)

  return (
    <span
      ref={rootRef}
      className={mergedClassName}
      style={style}
      data-m3e-orientation={orientation}
      data-m3e-disabled={disabled}
      data-m3e-centered={centered}
      data-m3e-stepped={bounds.steps > 0}
      data-m3e-active-thumb={activeThumb ? 'single' : undefined}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onLostPointerCapture={handleLostPointerCapture}
    >
      <input
        {...inputProps}
        ref={composeRefs(forwardedRef, inputRef)}
        type="range"
        role="slider"
        className="m3e-slider__input"
        data-m3e-thumb="single"
        disabled={disabled}
        min={bounds.min}
        max={bounds.max}
        step={nativeStep}
        value={resolvedValue}
        aria-valuemin={bounds.min}
        aria-valuemax={bounds.max}
        aria-valuenow={resolvedValue}
        aria-valuetext={ariaValueText}
        aria-orientation={orientation}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      />
      <SliderTrack
        bounds={bounds}
        values={[resolvedValue]}
        disabled={disabled}
        orientation={orientation}
        topToBottom={topToBottom}
        centered={centered}
        thumbs={[{ kind: 'single', content: thumb }]}
        trackContent={trackContent}
        renderTick={renderTick}
        renderStopIndicator={renderStopIndicator}
        showStopIndicator={showStopIndicator}
      />
    </span>
  )
}

const ForwardedSlider = forwardRef<HTMLInputElement, SliderProps>(SliderRender)
ForwardedSlider.displayName = 'Slider'

export const Slider = ForwardedSlider as SliderComponent
