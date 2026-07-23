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
  normalizeRangeValue,
  snapValue,
  snapValueForSemantics,
  valueForKey,
  valueForPointer,
  type SliderThumbKind,
} from './Slider.shared'
import type {
  RangeSliderInputProps,
  RangeSliderProps,
  RangeSliderValue,
} from './Slider.types'

interface RangeSliderComponent {
  (props: RangeSliderProps): ReactElement | null
  displayName?: string
}

interface PointerSession {
  readonly pointerId: number
  readonly startX: number
  readonly startY: number
  readonly thumb: Exclude<SliderThumbKind, 'single'>
  dragging: boolean
  cancelled: boolean
}

type RangeThumb = PointerSession['thumb']

const POINTER_SLOP = 8

function warn(message: string): void {
  if (typeof process !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.warn(`RangeSlider: ${message}`)
  }
}

function warnForInvalidProps({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  steps,
  startAriaLabel,
  endAriaLabel,
}: Pick<
  RangeSliderProps,
  | 'defaultValue'
  | 'endAriaLabel'
  | 'max'
  | 'min'
  | 'onValueChange'
  | 'startAriaLabel'
  | 'steps'
  | 'value'
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
  if (!startAriaLabel?.trim()) {
    warn('startAriaLabel must provide a localized accessible name.')
  }
  if (!endAriaLabel?.trim()) {
    warn('endAriaLabel must provide a localized accessible name.')
  }
}

function chooseThumb(pointerValue: number, value: RangeSliderValue): RangeThumb {
  const startDistance = Math.abs(value[0] - pointerValue)
  const endDistance = Math.abs(value[1] - pointerValue)
  if (startDistance < endDistance) return 'start'
  if (endDistance < startDistance) return 'end'
  // This tie path intentionally matches RangeSliderLogic: an overlapping pair
  // selects start only when the pointer is before the raw start offset.
  return pointerValue < value[0] ? 'start' : 'end'
}

function RangeSliderRender(
  {
    value,
    defaultValue,
    onValueChange,
    onValueChangeFinished,
    min,
    max,
    steps,
    disabled = false,
    startAriaLabel,
    endAriaLabel,
    startThumb,
    endThumb,
    trackContent,
    renderTick,
    renderStopIndicator,
    showStopIndicator = true,
    startInputProps,
    endInputProps,
    startInputRef,
    endInputRef,
    className,
    style,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
    onLostPointerCapture,
    ...rootProps
  }: RangeSliderProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  warnForInvalidProps({
    value,
    defaultValue,
    onValueChange,
    min,
    max,
    steps,
    startAriaLabel,
    endAriaLabel,
  })

  const bounds = normalizeBounds(min, max, steps)
  const initialValue = normalizeRangeValue(
    defaultValue ?? [bounds.min, bounds.max],
    bounds,
  )
  const controlled = value !== undefined
  const [stateValue, setStateValue] = useControllableState({
    value,
    defaultValue: initialValue,
    onChange: onValueChange,
  })
  const resolvedValue = normalizeRangeValue(stateValue, bounds)
  const valueRef = useRef<RangeSliderValue>(resolvedValue)
  valueRef.current = resolvedValue

  const rootRef = useRef<HTMLDivElement | null>(null)
  const startNativeRef = useRef<HTMLInputElement | null>(null)
  const endNativeRef = useRef<HTMLInputElement | null>(null)
  const pointerSessionRef = useRef<PointerSession | null>(null)
  const [activeThumb, setActiveThumb] = useState<RangeThumb | null>(null)

  const setRangeValue = (nextValue: RangeSliderValue): boolean => {
    const current = valueRef.current
    if (Object.is(current[0], nextValue[0]) && Object.is(current[1], nextValue[1])) {
      return false
    }
    setStateValue(nextValue)
    return true
  }

  const setThumbValue = (
    thumb: RangeThumb,
    requestedValue: number,
    semanticAction = false,
  ): boolean => {
    const current = valueRef.current
    const next = semanticAction
      ? snapValueForSemantics(requestedValue, bounds)
      : snapValue(requestedValue, bounds)
    return thumb === 'start'
      ? setRangeValue([Math.min(next, current[1]), current[1]])
      : setRangeValue([current[0], Math.max(next, current[0])])
  }

  useEffect(() => {
    if (controlled) return undefined
    const forms = new Set(
      [startNativeRef.current?.form, endNativeRef.current?.form].filter(
        (form): form is HTMLFormElement => form != null,
      ),
    )
    if (forms.size === 0) return undefined
    const handleReset = () => {
      setStateValue(
        normalizeRangeValue(defaultValue ?? [bounds.min, bounds.max], bounds),
      )
    }
    for (const form of forms) form.addEventListener('reset', handleReset)
    return () => {
      for (const form of forms) form.removeEventListener('reset', handleReset)
    }
  }, [bounds, controlled, defaultValue, setStateValue])

  const pointerValueAt = (clientX: number, clientY: number): number => {
    const root = rootRef.current
    if (!root) return bounds.min
    return valueForPointer(
      clientX,
      clientY,
      root.getBoundingClientRect(),
      bounds,
      'horizontal',
      isRtl(root),
      true,
    )
  }

  const pointerValue = (event: ReactPointerEvent<HTMLDivElement>): number =>
    pointerValueAt(event.clientX, event.clientY)

  const clearPointerSession = (root: HTMLDivElement, pointerId: number) => {
    pointerSessionRef.current = null
    setActiveThumb(null)
    if (root.hasPointerCapture?.(pointerId)) root.releasePointerCapture(pointerId)
  }

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled || pointerSessionRef.current) return
    if (event.pointerType === 'mouse' && event.button !== 0) return

    const thumb = chooseThumb(pointerValue(event), valueRef.current)
    pointerSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      thumb,
      dragging: false,
      cancelled: false,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    ;(thumb === 'start' ? startNativeRef.current : endNativeRef.current)?.focus({
      preventScroll: true,
    })
    setActiveThumb(thumb)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId || session.cancelled) return

    if (!session.dragging) {
      const deltaX = event.clientX - session.startX
      const deltaY = event.clientY - session.startY
      if (Math.hypot(deltaX, deltaY) < POINTER_SLOP) return
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        session.cancelled = true
        setActiveThumb(null)
        return
      }
      session.dragging = true
    }

    event.preventDefault()
    setThumbValue(session.thumb, pointerValue(event))
  }

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    if (!session.cancelled) {
      setThumbValue(
        session.thumb,
        session.dragging
          ? pointerValue(event)
          : pointerValueAt(session.startX, session.startY),
      )
      onValueChangeFinished?.()
    }
    clearPointerSession(event.currentTarget, event.pointerId)
  }

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    if (session.dragging) onValueChangeFinished?.()
    clearPointerSession(event.currentTarget, event.pointerId)
  }

  const handleLostPointerCapture = (event: ReactPointerEvent<HTMLDivElement>) => {
    const session = pointerSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return
    if (session.dragging) onValueChangeFinished?.()
    pointerSessionRef.current = null
    setActiveThumb(null)
  }

  const handleKeyDown =
    (thumb: RangeThumb) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return
      const current = valueRef.current
      const nextValue = valueForKey(event, {
        bounds,
        value: thumb === 'start' ? current[0] : current[1],
        orientation: 'horizontal',
        reverseDirection: isRtl(event.currentTarget),
        lowerBound: thumb === 'start' ? bounds.min : current[0],
        upperBound: thumb === 'start' ? current[1] : bounds.max,
      })
      if (nextValue === undefined) return
      event.preventDefault()
      setThumbValue(thumb, nextValue)
    }

  const handleKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
    if (disabled || !isHandledSliderKey(event.key, 'horizontal')) return
    event.preventDefault()
    onValueChangeFinished?.()
  }

  const createChangeHandler = (
    thumb: RangeThumb,
    consumerHandler: RangeSliderInputProps['onChange'],
  ) =>
    composeEventHandlers<ChangeEvent<HTMLInputElement>>(consumerHandler, (event) => {
      if (setThumbValue(thumb, event.currentTarget.valueAsNumber, true)) {
        onValueChangeFinished?.()
      }
    })

  const {
    onChange: startOnChange,
    'aria-valuetext': requestedStartValueText,
    ...startNativeProps
  } = startInputProps ?? {}
  const {
    onChange: endOnChange,
    'aria-valuetext': requestedEndValueText,
    ...endNativeProps
  } = endInputProps ?? {}

  const mergedClassName = className
    ? `m3e-slider m3e-range-slider ${className}`
    : 'm3e-slider m3e-range-slider'
  const nativeStep =
    bounds.steps > 0 ? (bounds.max - bounds.min) / (bounds.steps + 1) : 'any'

  return (
    <div
      {...rootProps}
      ref={composeRefs(forwardedRef, rootRef)}
      role="group"
      className={mergedClassName}
      style={style}
      data-m3e-orientation="horizontal"
      data-m3e-disabled={disabled}
      data-m3e-centered="false"
      data-m3e-stepped={bounds.steps > 0}
      data-m3e-active-thumb={activeThumb ?? undefined}
      onPointerDown={composeEventHandlers(onPointerDown, handlePointerDown)}
      onPointerMove={composeEventHandlers(onPointerMove, handlePointerMove)}
      onPointerUp={composeEventHandlers(onPointerUp, handlePointerUp)}
      onPointerCancel={composeEventHandlers(onPointerCancel, handlePointerCancel)}
      onLostPointerCapture={composeEventHandlers(
        onLostPointerCapture,
        handleLostPointerCapture,
      )}
    >
      <input
        {...startNativeProps}
        ref={composeRefs(startInputRef, startNativeRef)}
        type="range"
        role="slider"
        className="m3e-slider__input"
        data-m3e-thumb="start"
        aria-label={startAriaLabel}
        disabled={disabled}
        min={bounds.min}
        max={resolvedValue[1]}
        step={nativeStep}
        value={resolvedValue[0]}
        aria-valuemin={bounds.min}
        aria-valuemax={resolvedValue[1]}
        aria-valuenow={resolvedValue[0]}
        aria-valuetext={
          requestedStartValueText ?? formatValueForSemantics(resolvedValue[0])
        }
        aria-orientation="horizontal"
        onChange={createChangeHandler('start', startOnChange)}
        onKeyDown={handleKeyDown('start')}
        onKeyUp={handleKeyUp}
      />
      <input
        {...endNativeProps}
        ref={composeRefs(endInputRef, endNativeRef)}
        type="range"
        role="slider"
        className="m3e-slider__input"
        data-m3e-thumb="end"
        aria-label={endAriaLabel}
        disabled={disabled}
        min={resolvedValue[0]}
        max={bounds.max}
        step={nativeStep}
        value={resolvedValue[1]}
        aria-valuemin={resolvedValue[0]}
        aria-valuemax={bounds.max}
        aria-valuenow={resolvedValue[1]}
        aria-valuetext={
          requestedEndValueText ?? formatValueForSemantics(resolvedValue[1])
        }
        aria-orientation="horizontal"
        onChange={createChangeHandler('end', endOnChange)}
        onKeyDown={handleKeyDown('end')}
        onKeyUp={handleKeyUp}
      />
      <SliderTrack
        bounds={bounds}
        values={resolvedValue}
        disabled={disabled}
        orientation="horizontal"
        topToBottom
        centered={false}
        thumbs={[
          { kind: 'start', content: startThumb },
          { kind: 'end', content: endThumb },
        ]}
        trackContent={trackContent}
        renderTick={renderTick}
        renderStopIndicator={renderStopIndicator}
        showStopIndicator={showStopIndicator}
      />
    </div>
  )
}

const ForwardedRangeSlider = forwardRef<HTMLDivElement, RangeSliderProps>(
  RangeSliderRender,
)
ForwardedRangeSlider.displayName = 'RangeSlider'

export const RangeSlider = ForwardedRangeSlider as RangeSliderComponent
