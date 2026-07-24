// @vitest-environment jsdom

import { cleanup, createEvent, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, vi } from 'vitest'
import { BottomSheet } from '../../../src/components/BottomSheet'
import type { BottomSheetState } from '../../../src/components/BottomSheet'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)
afterEach(cleanup)

const NAME = { 'aria-label': 'Details' } as const

/**
 * `Event.timeStamp` is read-only, so it cannot be supplied through a
 * `fireEvent` init object — jsdom stamps the real creation time instead, which
 * makes any velocity assertion a race against the test machine. Constructing
 * the event and redefining `timeStamp` before dispatch is the only way to make
 * the velocity threshold deterministic.
 *
 * The stamps must be non-zero: a falsy `timeStamp` is treated as absent and
 * silently replaced with the real clock, which reintroduces exactly the
 * nondeterminism this helper exists to remove. Hence `TIME_ORIGIN`.
 */
const TIME_ORIGIN = 5000

function dispatch(
  handle: Element,
  type: 'pointerDown' | 'pointerMove' | 'pointerUp',
  init: Record<string, unknown>,
  timeStamp: number,
) {
  const event = createEvent[type](handle, init)
  Object.defineProperty(event, 'timeStamp', { value: timeStamp })
  fireEvent(handle, event)
}

/**
 * The source settles to the next anchor once a drag passes
 * `BottomSheetDefaults.PositionalThreshold` (56dp) of travel, or below that
 * once the release velocity passes `VelocityThreshold` (125dp/s).
 */
function drag(
  handle: Element,
  { distance, milliseconds = 1000 }: { distance: number; milliseconds?: number },
) {
  const pointer = { pointerId: 1, pointerType: 'mouse', button: 0 }
  dispatch(handle, 'pointerDown', { ...pointer, clientY: 0 }, TIME_ORIGIN)
  dispatch(handle, 'pointerMove', { ...pointer, clientY: distance }, TIME_ORIGIN + milliseconds)
  dispatch(handle, 'pointerUp', { ...pointer, clientY: distance }, TIME_ORIGIN + milliseconds)
}

function renderSheet(
  value: BottomSheetState,
  props: Record<string, unknown> = {},
) {
  const onValueChange = vi.fn()
  render(<BottomSheet {...NAME} value={value} onValueChange={onValueChange} {...props} />)
  return { onValueChange, handle: screen.getByRole('button') }
}

describe('BottomSheet drag', () => {
  it('settles an expanded sheet down to partiallyExpanded past the positional threshold', () => {
    const { onValueChange, handle } = renderSheet('expanded')

    drag(handle, { distance: 80 })
    expect(onValueChange).toHaveBeenCalledWith('partiallyExpanded')
  })

  it('dismisses a modal sheet dragged down from partiallyExpanded', () => {
    const { onValueChange, handle } = renderSheet('partiallyExpanded')

    drag(handle, { distance: 80 })
    expect(onValueChange).toHaveBeenCalledWith('hidden')
  })

  it('holds a standard sheet at its peek height, which has no hidden anchor', () => {
    const { onValueChange, handle } = renderSheet('partiallyExpanded', {
      variant: 'standard',
    })

    drag(handle, { distance: 80 })
    // The source builds a standard sheet with
    // `enabledValues = setOf(PartiallyExpanded, Expanded)`, so there is nothing
    // below the peek height to settle onto.
    expect(onValueChange).not.toHaveBeenCalledWith('hidden')
  })

  it('expands a sheet dragged upward past the threshold', () => {
    const { onValueChange, handle } = renderSheet('partiallyExpanded')

    drag(handle, { distance: -80 })
    expect(onValueChange).toHaveBeenCalledWith('expanded')
  })

  it('returns to the starting state when the drag stays under both thresholds', () => {
    const { onValueChange, handle } = renderSheet('expanded')

    // 40px of travel over a full second: under 56px and under 125px/s.
    drag(handle, { distance: 40, milliseconds: 1000 })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('settles a short but fast flick, where velocity alone passes the threshold', () => {
    const { onValueChange, handle } = renderSheet('expanded')

    // 40px in 100ms is 400px/s — under the positional threshold, over the
    // velocity one, which is exactly the case the source's fling behavior
    // exists to catch.
    drag(handle, { distance: 40, milliseconds: 100 })
    expect(onValueChange).toHaveBeenCalledWith('partiallyExpanded')
  })

  it('ignores a drag when gestures are disabled', () => {
    const { onValueChange, handle } = renderSheet('expanded', { gesturesEnabled: false })

    drag(handle, { distance: 200 })
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('leaves the state untouched when a drag is cancelled', () => {
    const { onValueChange, handle } = renderSheet('expanded')

    fireEvent.pointerDown(handle, {
      pointerId: 1,
      pointerType: 'mouse',
      button: 0,
      clientY: 0,
    })
    fireEvent.pointerMove(handle, { pointerId: 1, pointerType: 'mouse', clientY: 200 })
    fireEvent.pointerCancel(handle, { pointerId: 1, pointerType: 'mouse', clientY: 200 })

    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('tracks the pointer with a live offset and clears it once settled', () => {
    render(<BottomSheet {...NAME} value="expanded" onValueChange={() => {}} />)
    const handle = screen.getByRole('button')
    const container = document.querySelector<HTMLElement>('.m3e-bottom-sheet__container')

    fireEvent.pointerDown(handle, { pointerId: 1, pointerType: 'mouse', button: 0, clientY: 0 })
    fireEvent.pointerMove(handle, { pointerId: 1, pointerType: 'mouse', clientY: 30 })

    expect(container?.style.getPropertyValue('--m3e-bottom-sheet-drag-offset')).toBe('30px')
    expect(container?.getAttribute('data-m3e-dragging')).toBe('true')

    fireEvent.pointerUp(handle, { pointerId: 1, pointerType: 'mouse', button: 0, clientY: 30 })

    expect(container?.style.getPropertyValue('--m3e-bottom-sheet-drag-offset')).toBe('')
    expect(container?.hasAttribute('data-m3e-dragging')).toBe(false)
  })

  it('does not fire the activation cycle for a press that never moved', () => {
    const { onValueChange, handle } = renderSheet('expanded')

    fireEvent.pointerDown(handle, { pointerId: 1, pointerType: 'mouse', button: 0, clientY: 0 })
    fireEvent.pointerUp(handle, { pointerId: 1, pointerType: 'mouse', button: 0, clientY: 0 })

    // The drag path settles nothing; the button's own click handler owns that
    // case, and no click was dispatched here.
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('honours a confirmValueChange veto on a drag, not only on a click', () => {
    const onValueChange = vi.fn()
    render(
      <BottomSheet
        {...NAME}
        value="expanded"
        onValueChange={onValueChange}
        confirmValueChange={() => false}
      />,
    )

    drag(screen.getByRole('button'), { distance: 200 })
    expect(onValueChange).not.toHaveBeenCalled()
  })
})
