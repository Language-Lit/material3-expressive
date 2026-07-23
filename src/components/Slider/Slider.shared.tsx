import {
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import type {
  RangeSliderValue,
  RangeSliderVisualState,
  SliderOrientation,
  SliderStopIndicatorState,
  SliderTickState,
  SliderVisualState,
} from './Slider.types'

export const DEFAULT_MIN = 0
export const DEFAULT_MAX = 1

const EPSILON = 1e-7

export interface SliderBounds {
  readonly min: number
  readonly max: number
  readonly steps: number
}

export type SliderThumbKind = 'single' | 'start' | 'end'
type SliderGapKind = SliderThumbKind | 'center'

type VisualSlot<TState> = ReactNode | ((state: TState) => ReactNode)

interface SliderTrackProps {
  readonly bounds: SliderBounds
  readonly values: readonly number[]
  readonly disabled: boolean
  readonly orientation: SliderOrientation
  readonly topToBottom: boolean
  readonly centered: boolean
  readonly thumbs: readonly {
    readonly kind: SliderThumbKind
    readonly content?: VisualSlot<SliderVisualState>
  }[]
  readonly trackContent?:
    | VisualSlot<SliderVisualState>
    | VisualSlot<RangeSliderVisualState>
  readonly renderTick?: (state: SliderTickState) => ReactNode
  readonly renderStopIndicator?: (state: SliderStopIndicatorState) => ReactNode
  readonly showStopIndicator: boolean
}

interface Segment {
  readonly start: number
  readonly end: number
  readonly active: boolean
  readonly startGap?: SliderGapKind
  readonly endGap?: SliderGapKind
}

export function normalizeBounds(
  requestedMin: number | undefined,
  requestedMax: number | undefined,
  requestedSteps: number | undefined,
): SliderBounds {
  const min = Number.isFinite(requestedMin) ? (requestedMin as number) : DEFAULT_MIN
  const candidateMax = Number.isFinite(requestedMax) ? (requestedMax as number) : DEFAULT_MAX
  const max = candidateMax > min ? candidateMax : min + 1
  const steps =
    Number.isFinite(requestedSteps) && (requestedSteps as number) >= 0
      ? Math.trunc(requestedSteps as number)
      : 0
  return { min, max, steps }
}

export function clampValue(value: number, { min, max }: SliderBounds): number {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

function snapValueWithTie(
  value: number,
  bounds: SliderBounds,
  preferUpper: boolean,
): number {
  const clamped = clampValue(value, bounds)
  if (bounds.steps === 0) return clamped
  const intervals = bounds.steps + 1
  const scaled =
    ((clamped - bounds.min) / (bounds.max - bounds.min)) * intervals
  const lower = Math.floor(scaled)
  const upper = Math.ceil(scaled)
  // snapValueToTick uses minByOrNull, so an exact midpoint retains the first
  // (lower) tick rather than JavaScript Math.round's upper tick.
  const index =
    scaled - lower < upper - scaled ||
    (!preferUpper && scaled - lower === upper - scaled)
      ? lower
      : upper
  const snapped = bounds.min + (index / intervals) * (bounds.max - bounds.min)
  // Avoid floating-point tails in DOM values and callbacks while retaining
  // non-decimal ranges.
  return Number(snapped.toPrecision(12))
}

export function snapValue(value: number, bounds: SliderBounds): number {
  return snapValueWithTie(value, bounds, false)
}

/**
 * Compose's setProgress loop uses `<=` while walking ticks from low to high,
 * so its exact semantic midpoint resolves to the later (upper) tick even
 * though pointer/state snapping uses first-minimum (lower). Native changes are
 * the web adaptation of that accessibility action.
 */
export function snapValueForSemantics(
  value: number,
  bounds: SliderBounds,
): number {
  return snapValueWithTie(value, bounds, true)
}

export function normalizeRangeValue(
  value: RangeSliderValue,
  bounds: SliderBounds,
): RangeSliderValue {
  const first = snapValue(value[0], bounds)
  const second = snapValue(value[1], bounds)
  return first <= second ? [first, second] : [second, first]
}

export function fractionForValue(value: number, bounds: SliderBounds): number {
  return (clampValue(value, bounds) - bounds.min) / (bounds.max - bounds.min)
}

export function valueFromFraction(fraction: number, bounds: SliderBounds): number {
  const clampedFraction = Math.min(1, Math.max(0, fraction))
  return snapValue(bounds.min + clampedFraction * (bounds.max - bounds.min), bounds)
}

export function formatValueForSemantics(value: number): string {
  const rounded = Math.round(value * 100) / 100
  return Number.isInteger(rounded) ? `${rounded}.0` : String(rounded)
}

export function isRtl(element: Element): boolean {
  const computedDirection =
    element.ownerDocument?.defaultView?.getComputedStyle(element).direction
  if (computedDirection === 'rtl') return true
  if (computedDirection === 'ltr') return false

  let current: Element | null = element
  while (current) {
    const direction = current.getAttribute('dir')
    if (direction === 'rtl') return true
    if (direction === 'ltr') return false
    current = current.parentElement
  }
  return element.ownerDocument?.documentElement.dir === 'rtl'
}

export function valueForPointer(
  clientX: number,
  clientY: number,
  rect: DOMRect,
  bounds: SliderBounds,
  orientation: SliderOrientation,
  rtl: boolean,
  topToBottom: boolean,
): number {
  const mainSize = orientation === 'vertical' ? rect.height : rect.width
  const pointer = orientation === 'vertical' ? clientY - rect.top : clientX - rect.left
  // SliderImpl places the handle center one half of its 4px layout width
  // inside either edge.
  const start = 2
  const end = Math.max(start, mainSize - 2)
  let fraction = end === start ? 0 : (pointer - start) / (end - start)
  fraction = Math.min(1, Math.max(0, fraction))
  if (orientation === 'horizontal' && rtl) fraction = 1 - fraction
  if (orientation === 'vertical' && !topToBottom) fraction = 1 - fraction
  return valueFromFraction(fraction, bounds)
}

function isSliderKey(key: string, orientation: SliderOrientation): boolean {
  if (key === 'Home' || key === 'End' || key === 'PageUp' || key === 'PageDown') return true
  return orientation === 'vertical'
    ? key === 'ArrowUp' || key === 'ArrowDown'
    : key === 'ArrowLeft' || key === 'ArrowRight'
}

export interface KeyValueOptions {
  readonly bounds: SliderBounds
  readonly value: number
  readonly orientation: SliderOrientation
  readonly reverseDirection: boolean
  readonly lowerBound?: number
  readonly upperBound?: number
}

export function valueForKey(
  event: KeyboardEvent<HTMLInputElement>,
  {
    bounds,
    value,
    orientation,
    reverseDirection,
    lowerBound = bounds.min,
    upperBound = bounds.max,
  }: KeyValueOptions,
): number | undefined {
  if (!isSliderKey(event.key, orientation)) return undefined
  const actualSteps = bounds.steps > 0 ? bounds.steps + 1 : 100
  const delta = (bounds.max - bounds.min) / actualSteps
  const page = Math.min(10, Math.max(1, Math.trunc(actualSteps / 10)))
  const sign = reverseDirection ? -1 : 1
  let next = value

  if (event.key === 'Home') next = lowerBound
  else if (event.key === 'End') next = upperBound
  else if (orientation === 'vertical') {
    if (event.key === 'ArrowUp') next = value - sign * delta
    else if (event.key === 'ArrowDown') next = value + sign * delta
    else if (event.key === 'PageUp') next = value - page * sign * delta
    else if (event.key === 'PageDown') next = value + page * sign * delta
  } else {
    if (event.key === 'ArrowRight') next = value + sign * delta
    else if (event.key === 'ArrowLeft') next = value - sign * delta
    // The pinned range and single-slider key paths deliberately do not apply
    // RTL reversal to PageUp/PageDown.
    else if (event.key === 'PageUp') next = value + page * delta
    else if (event.key === 'PageDown') next = value - page * delta
  }

  return snapValue(Math.min(upperBound, Math.max(lowerBound, next)), bounds)
}

export function isHandledSliderKey(key: string, orientation: SliderOrientation): boolean {
  return isSliderKey(key, orientation)
}

function renderVisualSlot<TState>(
  slot: VisualSlot<TState> | undefined,
  state: TState,
): ReactNode {
  return typeof slot === 'function' ? slot(state) : slot
}

function positionExpression(fraction: number, stepped: boolean): string {
  const percentage = `${fraction * 100}%`
  if (!stepped || fraction <= EPSILON || fraction >= 1 - EPSILON) return percentage
  // For discrete interior values SliderImpl positions both ticks and handles
  // inside the external corner radii:
  // corner + fraction * (track - 2 * corner).
  const cornerCoefficient = 1 - 2 * fraction
  return `calc(${percentage} + ${cornerCoefficient} * var(--m3e-comp-slider-track-corner-size))`
}

function gapVariable(kind: SliderGapKind): string {
  if (kind === 'center') return 'var(--m3e-slider-center-gap)'
  if (kind === 'start') return 'var(--m3e-slider-start-gap)'
  if (kind === 'end') return 'var(--m3e-slider-end-gap)'
  return 'var(--m3e-slider-thumb-gap)'
}

function segmentStyle(segment: Segment, stepped: boolean, vertical: boolean): CSSProperties {
  const start = positionExpression(segment.start, stepped)
  const end = positionExpression(segment.end, stepped)
  const startPosition = segment.startGap
    ? `calc((${start}) + ${gapVariable(segment.startGap)})`
    : start
  const endInset = segment.endGap
    ? `calc(100% - (${end}) + ${gapVariable(segment.endGap)})`
    : `calc(100% - (${end}))`

  return vertical
    ? { insetBlockStart: startPosition, insetBlockEnd: endInset }
    : { insetInlineStart: startPosition, insetInlineEnd: endInset }
}

function pointStyle(
  fraction: number,
  stepped: boolean,
  vertical: boolean,
): CSSProperties {
  const position = positionExpression(fraction, stepped)
  return vertical
    ? { insetBlockStart: position }
    : { insetInlineStart: position }
}

interface WindowStyle extends CSSProperties {
  '--m3e-slider-window-start': string
  '--m3e-slider-window-end': string
}

function windowStyle(segment: Segment, stepped: boolean): WindowStyle {
  const start = positionExpression(segment.start, stepped)
  const end = positionExpression(segment.end, stepped)
  return {
    '--m3e-slider-window-start': segment.startGap
      ? `calc((${start}) + ${gapVariable(segment.startGap)})`
      : start,
    '--m3e-slider-window-end': segment.endGap
      ? `calc((${end}) - ${gapVariable(segment.endGap)})`
      : end,
  }
}

function stopStyle(edge: 'start' | 'end', vertical: boolean): CSSProperties {
  const position =
    edge === 'start'
      ? 'var(--m3e-comp-slider-track-corner-size)'
      : 'calc(100% - var(--m3e-comp-slider-track-corner-size))'
  return vertical ? { insetBlockStart: position } : { insetInlineStart: position }
}

function segmentCorners(segment: Segment): {
  readonly start: 'external' | 'inside'
  readonly end: 'external' | 'inside'
} {
  return {
    start:
      segment.startGap == null && segment.start <= EPSILON
        ? 'external'
        : 'inside',
    end:
      segment.endGap == null && segment.end >= 1 - EPSILON
        ? 'external'
        : 'inside',
  }
}

function hasLength(segment: Segment): boolean {
  return segment.end - segment.start > EPSILON
}

function buildSingleSegments(position: number, centered: boolean): readonly Segment[] {
  if (!centered) {
    const segments: Segment[] = [
      { start: 0, end: position, active: true, endGap: 'single' },
      { start: position, end: 1, active: false, startGap: 'single' },
    ]
    return segments.filter(hasLength)
  }

  if (position < 0.5 - EPSILON) {
    const segments: Segment[] = [
      { start: 0, end: position, active: false, endGap: 'single' },
      { start: position, end: 0.5, active: true, startGap: 'single' },
      { start: 0.5, end: 1, active: false, startGap: 'center' },
    ]
    return segments.filter(hasLength)
  }
  if (position > 0.5 + EPSILON) {
    const segments: Segment[] = [
      { start: 0, end: 0.5, active: false, endGap: 'center' },
      { start: 0.5, end: position, active: true, endGap: 'single' },
      { start: position, end: 1, active: false, startGap: 'single' },
    ]
    return segments.filter(hasLength)
  }
  const segments: Segment[] = [
    { start: 0, end: 0.5, active: false, endGap: 'center' },
    { start: 0.5, end: 1, active: false, startGap: 'single' },
  ]
  return segments
}

function buildSingleTickWindows(
  position: number,
  centered: boolean,
): readonly Segment[] {
  const segments = buildSingleSegments(position, centered)
  if (!centered) return segments

  if (position < 0.5 - EPSILON) {
    return segments.map((segment) =>
      segment.active && segment.end >= 0.5 - EPSILON
        ? { ...segment, endGap: 'center' as const }
        : segment,
    )
  }
  if (position > 0.5 + EPSILON) {
    return segments.map((segment) =>
      segment.active && segment.start <= 0.5 + EPSILON
        ? { ...segment, startGap: 'center' as const }
        : segment,
    )
  }

  // At exactly center the source's center-gap and thumb-gap filters overlap.
  // Their union uses the larger, actual-thumb gap on both tick sides, while
  // the painted track remains asymmetrical (6px before, 8px after).
  return segments.map((segment) =>
    segment.end <= 0.5 + EPSILON
      ? { ...segment, endGap: 'single' as const }
      : { ...segment, startGap: 'single' as const },
  )
}

function buildRangeSegments(start: number, end: number): readonly Segment[] {
  const segments: Segment[] = [
    { start: 0, end: start, active: false, endGap: 'start' },
    { start, end, active: true, startGap: 'start', endGap: 'end' },
    { start: end, end: 1, active: false, startGap: 'end' },
  ]
  return segments.filter(hasLength)
}

function reverseSegment(segment: Segment): Segment {
  return {
    start: 1 - segment.end,
    end: 1 - segment.start,
    active: segment.active,
    startGap: segment.endGap,
    endGap: segment.startGap,
  }
}

function windowContains(window: Segment, position: number): boolean {
  return (
    position >= window.start - EPSILON &&
    position <= window.end + EPSILON
  )
}

function tickIsActive(
  position: number,
  values: readonly number[],
  centered: boolean,
): boolean {
  if (values.length === 2) return position >= values[0] && position <= values[1]
  if (centered) return position >= Math.min(0.5, values[0]) && position <= Math.max(0.5, values[0])
  return position <= values[0]
}

function visualState(
  value: number,
  bounds: SliderBounds,
  disabled: boolean,
  orientation: SliderOrientation,
  centered: boolean,
): SliderVisualState {
  return {
    value,
    min: bounds.min,
    max: bounds.max,
    fraction: fractionForValue(value, bounds),
    disabled,
    orientation,
    centered,
  }
}

export function SliderTrack({
  bounds,
  values,
  disabled,
  orientation,
  topToBottom,
  centered,
  thumbs,
  trackContent,
  renderTick,
  renderStopIndicator,
  showStopIndicator,
}: SliderTrackProps) {
  const vertical = orientation === 'vertical'
  const sourceFractions = values.map((value) => fractionForValue(value, bounds))
  const reverseVertical = vertical && !topToBottom
  const positions =
    reverseVertical
      ? sourceFractions.map((fraction) => 1 - fraction)
      : sourceFractions
  const sourceSegments =
    values.length === 2
      ? buildRangeSegments(sourceFractions[0], sourceFractions[1])
      : buildSingleSegments(sourceFractions[0], centered)
  const sourceTickWindows =
    values.length === 2
      ? sourceSegments
      : buildSingleTickWindows(sourceFractions[0], centered)
  const segments = reverseVertical
    ? sourceSegments.map(reverseSegment)
    : sourceSegments
  const tickWindows = reverseVertical
    ? sourceTickWindows.map(reverseSegment)
    : sourceTickWindows
  const stepped = bounds.steps > 0
  const tickFractions = stepped
    ? Array.from({ length: bounds.steps + 2 }, (_, index) => index / (bounds.steps + 1))
    : []
  const thumbPositions = new Map(positions.map((position, index) => [thumbs[index].kind, position]))
  const stopSegments = new Map<'start' | 'end', Segment>()

  if (showStopIndicator) {
    for (const segment of segments) {
      if (segment.active) continue
      if (
        segment.start <= EPSILON &&
        (centered || values.length === 2)
      ) {
        stopSegments.set('start', segment)
      }
      if (segment.end >= 1 - EPSILON) stopSegments.set('end', segment)
    }
  }

  const singleState =
    values.length === 1
      ? visualState(values[0], bounds, disabled, orientation, centered)
      : undefined
  const rangeState: RangeSliderVisualState | undefined =
    values.length === 2
      ? {
          value: [values[0], values[1]],
          min: bounds.min,
          max: bounds.max,
          fractions: [sourceFractions[0], sourceFractions[1]],
          disabled,
        }
      : undefined

  return (
    <span className="m3e-slider__track" aria-hidden="true">
      {segments.map((segment, index) => {
        const corners = segmentCorners(segment)
        return (
          <span
            key={`${segment.start}-${segment.end}-${index}`}
            className="m3e-slider__track-segment"
            data-m3e-active={segment.active}
            data-m3e-start-corner={corners.start}
            data-m3e-end-corner={corners.end}
            style={segmentStyle(segment, stepped, vertical)}
          />
        )
      })}

      {tickWindows.map((window, windowIndex) => (
        <span
          key={`tick-window-${windowIndex}`}
          className="m3e-slider__tick-window"
          style={windowStyle(window, stepped)}
        >
          {tickFractions.map((sourceFraction, index) => {
            const position = reverseVertical
              ? 1 - sourceFraction
              : sourceFraction
            const owningWindow = tickWindows.findIndex((candidate) =>
              windowContains(candidate, position),
            )
            if (owningWindow !== windowIndex) return null
            const onThumb = positions.some(
              (thumbPosition) =>
                Math.abs(thumbPosition - position) <= EPSILON,
            )
            const endpoint =
              sourceFraction <= EPSILON || sourceFraction >= 1 - EPSILON
            if (onThumb || (showStopIndicator && endpoint)) return null
            const active = tickIsActive(
              sourceFraction,
              sourceFractions,
              centered,
            )
            const value =
              bounds.min + sourceFraction * (bounds.max - bounds.min)
            const state: SliderTickState = {
              ...visualState(
                value,
                bounds,
                disabled,
                orientation,
                centered,
              ),
              index,
              active,
            }
            return (
              <span
                key={`tick-${index}`}
                className="m3e-slider__tick"
                data-m3e-active={active}
                data-m3e-custom={renderTick != null}
                data-m3e-fraction={sourceFraction}
                data-m3e-index={index}
                style={pointStyle(position, true, vertical)}
              >
                {renderTick?.(state)}
              </span>
            )
          })}
        </span>
      ))}

      {[...stopSegments].map(([edge, segment]) => {
        const sourceFraction =
          vertical && !topToBottom
            ? edge === 'start'
              ? 1
              : 0
            : edge === 'start'
              ? 0
              : 1
        const value = bounds.min + sourceFraction * (bounds.max - bounds.min)
        const state: SliderStopIndicatorState = {
          ...visualState(value, bounds, disabled, orientation, centered),
          edge,
          active: true,
        }
        return (
          <span
            key={`stop-window-${edge}`}
            className="m3e-slider__stop-window"
            style={windowStyle(segment, stepped)}
          >
            <span
              className="m3e-slider__stop"
              data-m3e-edge={edge}
              data-m3e-custom={renderStopIndicator != null}
              style={stopStyle(edge, vertical)}
            >
              {renderStopIndicator?.(state)}
            </span>
          </span>
        )
      })}

      {trackContent != null ? (
        <span className="m3e-slider__track-content">
          {singleState
            ? renderVisualSlot(trackContent as VisualSlot<SliderVisualState>, singleState)
            : renderVisualSlot(
                trackContent as VisualSlot<RangeSliderVisualState>,
                rangeState as RangeSliderVisualState,
              )}
        </span>
      ) : null}

      {thumbs.map((thumb, index) => {
        const value = values[index]
        const state = visualState(value, bounds, disabled, orientation, centered)
        const customContent = renderVisualSlot(thumb.content, state)
        const hasCustomContent = thumb.content !== undefined
        const position = thumbPositions.get(thumb.kind) ?? 0
        return (
          <span
            key={thumb.kind}
            className="m3e-slider__thumb-anchor"
            data-m3e-thumb={thumb.kind}
            style={pointStyle(position, stepped, vertical)}
          >
            <span
              className="m3e-slider__thumb"
              data-m3e-custom={hasCustomContent}
            >
              {hasCustomContent ? customContent : <span className="m3e-slider__handle" />}
            </span>
          </span>
        )
      })}
    </span>
  )
}
