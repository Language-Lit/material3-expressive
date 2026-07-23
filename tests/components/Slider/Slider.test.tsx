// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createElement,
  createRef,
  type ComponentType,
} from 'react'
import { afterEach, vi } from 'vitest'
import { RangeSlider, Slider } from '../../../src/components/Slider'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function mockBounds(
  element: Element,
  {
    left = 0,
    top = 0,
    width = 200,
    height = 48,
  }: Partial<Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>> = {},
) {
  const rect = {
    x: left,
    y: top,
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    toJSON: () => ({}),
  } as DOMRect
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(rect)
  return rect
}

function pointerTap(
  root: Element,
  clientX: number,
  clientY = 24,
  pointerId = 1,
) {
  fireEvent.pointerDown(root, {
    pointerId,
    pointerType: 'mouse',
    button: 0,
    clientX,
    clientY,
  })
  fireEvent.pointerUp(root, {
    pointerId,
    pointerType: 'mouse',
    button: 0,
    clientX,
    clientY,
  })
}

describe('Slider', () => {
  it('renders a native range input and the sourced default visual state', () => {
    render(<Slider aria-label="Volume" />)
    const input = screen.getByRole('slider', { name: 'Volume' }) as HTMLInputElement
    const root = input.closest('.m3e-slider')

    expect(input.type).toBe('range')
    expect(input.min).toBe('0')
    expect(input.max).toBe('1')
    expect(input.step).toBe('any')
    expect(input.valueAsNumber).toBe(0)
    expect(input.getAttribute('aria-valuetext')).toBe('0.0')
    expect(root?.getAttribute('data-m3e-orientation')).toBe('horizontal')
    expect(root?.getAttribute('data-m3e-centered')).toBe('false')
    expect(root?.querySelectorAll('.m3e-slider__thumb')).toHaveLength(1)
    expect(root?.querySelectorAll('.m3e-slider__stop')).toHaveLength(1)
  })

  it('keeps a controlled value authoritative while reporting a snapped change', () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        aria-label="Volume"
        value={0.2}
        steps={4}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('slider') as HTMLInputElement

    fireEvent.change(input, { target: { value: '0.74' } })
    expect(onValueChange).toHaveBeenCalledWith(0.8)
    expect(input.valueAsNumber).toBe(0.2)
  })

  it('updates uncontrolled state and lets preventDefault cancel a native change', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <Slider
        aria-label="Volume"
        defaultValue={0.2}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('slider') as HTMLInputElement

    fireEvent.change(input, { target: { value: '0.7' } })
    expect(input.valueAsNumber).toBe(0.7)
    expect(onValueChange).toHaveBeenLastCalledWith(0.7)

    rerender(
      <Slider
        aria-label="Volume"
        defaultValue={0.2}
        onValueChange={onValueChange}
        onChange={(event) => event.preventDefault()}
      />,
    )
    fireEvent.change(input, { target: { value: '0.9' } })
    expect(input.valueAsNumber).toBe(0.7)
    expect(onValueChange).not.toHaveBeenLastCalledWith(0.9)
  })

  it('maps taps and source-slop drags through the authored track and finishes once', () => {
    const onValueChange = vi.fn()
    const onValueChangeFinished = vi.fn()
    render(
      <Slider
        aria-label="Volume"
        onValueChange={onValueChange}
        onValueChangeFinished={onValueChangeFinished}
      />,
    )
    const input = screen.getByRole('slider') as HTMLInputElement
    const root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)

    pointerTap(root, 100)
    expect(input.valueAsNumber).toBeCloseTo(0.5)
    expect(onValueChangeFinished).toHaveBeenCalledTimes(1)

    fireEvent.pointerDown(root, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 40,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 44,
      clientY: 24,
    })
    expect(input.valueAsNumber).toBeCloseTo(0.5)
    fireEvent.pointerMove(root, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 150,
      clientY: 24,
    })
    expect(input.valueAsNumber).toBeCloseTo((150 - 8 - 2) / 196)
    fireEvent.pointerUp(root, {
      pointerId: 2,
      pointerType: 'touch',
      clientX: 150,
      clientY: 24,
    })
    expect(onValueChangeFinished).toHaveBeenCalledTimes(2)
    expect(root.hasAttribute('data-m3e-active-thumb')).toBe(false)
  })

  it('commits the press coordinate when a tap drifts below pointer slop', () => {
    render(<Slider aria-label="Volume" />)
    const input = screen.getByRole('slider') as HTMLInputElement
    const root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 8,
      pointerType: 'touch',
      clientX: 50,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 8,
      pointerType: 'touch',
      clientX: 54,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 8,
      pointerType: 'touch',
      clientX: 54,
      clientY: 24,
    })

    expect(input.valueAsNumber).toBeCloseTo((50 - 2) / 196)
  })

  it('clamps pointer drags out of bounds and resolves a zero-size track', () => {
    const { unmount } = render(<Slider aria-label="Volume" />)
    let input = screen.getByRole('slider') as HTMLInputElement
    let root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 13,
      pointerType: 'touch',
      clientX: 100,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 13,
      pointerType: 'touch',
      clientX: 300,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 13,
      pointerType: 'touch',
      clientX: 300,
      clientY: 24,
    })
    expect(input.valueAsNumber).toBe(1)

    fireEvent.pointerDown(root, {
      pointerId: 14,
      pointerType: 'touch',
      clientX: 100,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 14,
      pointerType: 'touch',
      clientX: -100,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 14,
      pointerType: 'touch',
      clientX: -100,
      clientY: 24,
    })
    expect(input.valueAsNumber).toBe(0)

    unmount()
    render(<Slider aria-label="Zero size" defaultValue={0.5} />)
    input = screen.getByRole('slider') as HTMLInputElement
    root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected zero-size Slider root')
    mockBounds(root, { width: 0, height: 0 })
    pointerTap(root, 100, 100)
    expect(input.valueAsNumber).toBe(0)
  })

  it('can begin an axis drag after moving outside the cross-axis touch area without jumping', () => {
    render(<Slider aria-label="Volume" defaultValue={0.5} />)
    const input = screen.getByRole('slider') as HTMLInputElement
    const root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 9,
      pointerType: 'touch',
      clientX: 100,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 9,
      pointerType: 'touch',
      clientX: 100,
      clientY: 524,
    })
    expect(input.valueAsNumber).toBe(0.5)
    fireEvent.pointerMove(root, {
      pointerId: 9,
      pointerType: 'touch',
      clientX: 150,
      clientY: 524,
    })
    expect(input.valueAsNumber).toBeCloseTo((150 - 8 - 2) / 196)
    fireEvent.pointerUp(root, {
      pointerId: 9,
      pointerType: 'touch',
      clientX: 150,
      clientY: 524,
    })
    expect(input.valueAsNumber).toBeCloseTo((150 - 8 - 2) / 196)
  })

  it('finishes a cancelled active drag but cancels an orthogonal scroll-like press', () => {
    const onValueChange = vi.fn()
    const onValueChangeFinished = vi.fn()
    render(
      <Slider
        aria-label="Volume"
        onValueChange={onValueChange}
        onValueChangeFinished={onValueChangeFinished}
      />,
    )
    const input = screen.getByRole('slider')
    const root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 3,
      pointerType: 'touch',
      clientX: 20,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 3,
      pointerType: 'touch',
      clientX: 80,
      clientY: 24,
    })
    fireEvent.pointerCancel(root, { pointerId: 3, pointerType: 'touch' })
    expect(onValueChangeFinished).toHaveBeenCalledTimes(1)

    const calls = onValueChange.mock.calls.length
    fireEvent.pointerDown(root, {
      pointerId: 4,
      pointerType: 'touch',
      clientX: 80,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 4,
      pointerType: 'touch',
      clientX: 81,
      clientY: 50,
    })
    fireEvent.pointerUp(root, {
      pointerId: 4,
      pointerType: 'touch',
      clientX: 81,
      clientY: 50,
    })
    expect(onValueChange).toHaveBeenCalledTimes(calls)
    expect(onValueChangeFinished).toHaveBeenCalledTimes(1)
  })

  it('maps horizontal RTL and both vertical directions without changing value order', () => {
    const { rerender } = render(
      <div dir="rtl">
        <Slider aria-label="RTL" />
      </div>,
    )
    let input = screen.getByRole('slider') as HTMLInputElement
    let root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)
    pointerTap(root, 51)
    expect(input.valueAsNumber).toBeCloseTo(0.75, 1)

    rerender(<Slider aria-label="Vertical" orientation="vertical" />)
    input = screen.getByRole('slider') as HTMLInputElement
    root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected vertical Slider root')
    mockBounds(root, { width: 48, height: 200 })
    pointerTap(root, 24, 51, 2)
    expect(input.valueAsNumber).toBeCloseTo(0.25, 1)
    expect(input.getAttribute('aria-orientation')).toBe('vertical')

    rerender(
      <Slider
        aria-label="Vertical"
        orientation="vertical"
        topToBottom={false}
      />,
    )
    input = screen.getByRole('slider') as HTMLInputElement
    root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected reversed Slider root')
    mockBounds(root, { width: 48, height: 200 })
    pointerTap(root, 24, 51, 3)
    expect(input.valueAsNumber).toBeCloseTo(0.75, 1)
  })

  it('resolves CSS direction and reverses the painted vertical active segment', () => {
    const { unmount } = render(
      <Slider aria-label="CSS RTL" style={{ direction: 'rtl' }} />,
    )
    let input = screen.getByRole('slider') as HTMLInputElement
    let root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected CSS-directed Slider root')
    mockBounds(root)
    pointerTap(root, 51)
    expect(input.valueAsNumber).toBeCloseTo(0.75, 1)

    unmount()
    render(
      <Slider
        aria-label="Reversed vertical"
        orientation="vertical"
        topToBottom={false}
        defaultValue={0.25}
      />,
    )
    input = screen.getByRole('slider') as HTMLInputElement
    root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected reversed vertical Slider root')
    const active = root.querySelector<HTMLElement>(
      '.m3e-slider__track-segment[data-m3e-active="true"]',
    )
    const inactive = root.querySelector<HTMLElement>(
      '.m3e-slider__track-segment[data-m3e-active="false"]',
    )

    expect(active?.style.insetBlockStart).toContain('75%')
    expect(active?.style.insetBlockStart).toContain('--m3e-slider-thumb-gap')
    expect(active?.style.insetBlockEnd).toBe('calc(0%)')
    expect(inactive?.style.insetBlockStart).toBe('0%')
    expect(inactive?.style.insetBlockEnd).toContain('75%')
    expect(inactive?.style.insetBlockEnd).toContain('--m3e-slider-thumb-gap')
  })

  it('implements source keyboard deltas, RTL arrows, Page asymmetry, and completion', () => {
    const onValueChangeFinished = vi.fn()
    render(
      <div dir="rtl">
        <Slider
          aria-label="Volume"
          defaultValue={0.5}
          onValueChangeFinished={onValueChangeFinished}
        />
      </div>,
    )
    const input = screen.getByRole('slider') as HTMLInputElement
    input.focus()

    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(input.valueAsNumber).toBeCloseTo(0.49)
    fireEvent.keyUp(input, { key: 'ArrowRight' })
    expect(onValueChangeFinished).toHaveBeenCalledTimes(1)

    fireEvent.keyDown(input, { key: 'PageUp' })
    expect(input.valueAsNumber).toBeCloseTo(0.59)
    fireEvent.keyUp(input, { key: 'PageUp' })
    fireEvent.keyDown(input, { key: 'Home' })
    expect(input.valueAsNumber).toBe(0)
    fireEvent.keyUp(input, { key: 'Home' })
    expect(onValueChangeFinished).toHaveBeenCalledTimes(3)
  })

  it('uses vertical keyboard direction and snaps discrete values', () => {
    const { unmount } = render(
      <Slider
        aria-label="Level"
        orientation="vertical"
        defaultValue={0.4}
        steps={4}
      />,
    )
    let input = screen.getByRole('slider') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.valueAsNumber).toBe(0.6)

    unmount()
    render(
      <Slider
        aria-label="Level"
        orientation="vertical"
        topToBottom={false}
        defaultValue={0.4}
        steps={4}
      />,
    )
    input = screen.getByRole('slider') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    expect(input.valueAsNumber).toBe(0.2)
  })

  it('coerces bounds safely and warns about invalid untyped combinations', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const UntypedSlider = Slider as ComponentType<Record<string, unknown>>
    render(
      createElement(UntypedSlider, {
        'aria-label': 'Invalid',
        value: 10,
        defaultValue: 2,
        min: 5,
        max: 2,
        steps: -1,
        orientation: 'diagonal',
      }),
    )
    const input = screen.getByRole('slider') as HTMLInputElement

    expect(input.min).toBe('5')
    expect(input.max).toBe('6')
    expect(input.valueAsNumber).toBe(6)
    expect(warning).toHaveBeenCalledWith(
      'Slider: use either value or defaultValue, not both.',
    )
    expect(warning).toHaveBeenCalledWith(
      'Slider: a controlled value requires onValueChange.',
    )
    expect(warning).toHaveBeenCalledWith(
      'Slider: max must be finite and greater than min.',
    )
    expect(warning).toHaveBeenCalledWith(
      'Slider: steps must be a non-negative integer.',
    )
    expect(warning).toHaveBeenCalledWith(
      'Slider: orientation must be "horizontal" or "vertical".',
    )
  })

  it('selects the lower discrete tick at an exact source snapping tie', () => {
    render(
      <Slider
        aria-label="Discrete"
        defaultValue={0.1}
        steps={4}
      />,
    )
    expect(
      (screen.getByRole('slider') as HTMLInputElement).valueAsNumber,
    ).toBe(0)
  })

  it('selects the upper discrete tick for the source semantic action tie', () => {
    const onValueChange = vi.fn()
    render(
      <Slider
        aria-label="Discrete"
        defaultValue={0}
        steps={4}
        onValueChange={onValueChange}
      />,
    )
    const input = screen.getByRole('slider') as HTMLInputElement

    fireEvent.change(input, { target: { value: '0.1' } })
    expect(input.valueAsNumber).toBe(0.2)
    expect(onValueChange).toHaveBeenCalledWith(0.2)
  })

  it('renders centered segmentation and passive custom visuals without changing semantics', () => {
    const tickStates: number[] = []
    render(
      <Slider
        aria-label="Balance"
        defaultValue={0.25}
        steps={3}
        centered
        thumb={() => null}
        trackContent={<span data-testid="track-art" />}
        renderTick={(state) => {
          tickStates.push(state.index)
          return <span data-testid={`tick-${state.index}`} />
        }}
        renderStopIndicator={(state) => (
          <span data-testid={`stop-${state.edge}`} />
        )}
      />,
    )
    const input = screen.getByRole('slider')
    const root = input.closest('.m3e-slider')

    expect(root?.getAttribute('data-m3e-centered')).toBe('true')
    expect(root?.querySelectorAll('.m3e-slider__track-segment')).toHaveLength(3)
    const segments = [
      ...(root?.querySelectorAll<HTMLElement>(
        '.m3e-slider__track-segment',
      ) ?? []),
    ]
    const tickWindows = [
      ...(root?.querySelectorAll<HTMLElement>(
        '.m3e-slider__tick-window',
      ) ?? []),
    ]
    expect(segments[2]?.style.insetInlineStart).toContain(
      '--m3e-slider-center-gap',
    )
    expect(
      tickWindows[1]?.style.getPropertyValue('--m3e-slider-window-end'),
    ).toContain('--m3e-slider-center-gap')
    expect(root?.querySelector('.m3e-slider__handle')).toBeNull()
    expect(screen.getByTestId('track-art')).not.toBeNull()
    expect(screen.getByTestId('stop-start')).not.toBeNull()
    expect(screen.getByTestId('stop-end')).not.toBeNull()
    expect(tickStates).toEqual([2, 3])
    expect(input.getAttribute('aria-valuenow')).toBe('0.25')
  })

  it('uses native disabled behavior for every interaction path', () => {
    const onValueChange = vi.fn()
    const onValueChangeFinished = vi.fn()
    render(
      <Slider
        aria-label="Locked"
        disabled
        defaultValue={0.5}
        onValueChange={onValueChange}
        onValueChangeFinished={onValueChangeFinished}
      />,
    )
    const input = screen.getByRole('slider') as HTMLInputElement
    const root = input.closest('.m3e-slider')
    if (!root) throw new Error('Expected Slider root')
    mockBounds(root)

    pointerTap(root, 180)
    fireEvent.keyDown(input, { key: 'ArrowRight' })
    expect(input.disabled).toBe(true)
    expect(input.valueAsNumber).toBe(0.5)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onValueChangeFinished).not.toHaveBeenCalled()
  })

  it('participates in forms, resets uncontrolled state, and forwards the input ref', () => {
    const ref = createRef<HTMLInputElement>()
    render(
      <form data-testid="form">
        <label htmlFor="volume">Volume</label>
        <Slider
          ref={ref}
          id="volume"
          name="volume"
          defaultValue={0.2}
          className="consumer-slider"
          style={{ marginBlockStart: 8 }}
          data-owner="consumer"
        />
      </form>,
    )
    const input = screen.getByRole('slider', { name: 'Volume' }) as HTMLInputElement
    const root = input.closest('.m3e-slider') as HTMLElement
    const form = screen.getByTestId('form') as HTMLFormElement

    expect(ref.current).toBe(input)
    expect(input.getAttribute('data-owner')).toBe('consumer')
    expect(root.classList.contains('consumer-slider')).toBe(true)
    expect(root.style.marginBlockStart).toBe('8px')

    fireEvent.change(input, { target: { value: '0.8' } })
    expect(new FormData(form).get('volume')).toBe('0.8')
    fireEvent.reset(form)
    expect(input.valueAsNumber).toBe(0.2)
  })

  it('exposes a stable component name', () => {
    expect(Slider.displayName).toBe('Slider')
  })
})

describe('RangeSlider', () => {
  it('renders two independently named native sliders with dynamic bounds', () => {
    const rootRef = createRef<HTMLDivElement>()
    const startRef = createRef<HTMLInputElement>()
    const endRef = createRef<HTMLInputElement>()
    const { rerender } = render(
      <RangeSlider
        ref={rootRef}
        startInputRef={startRef}
        endInputRef={endRef}
        startAriaLabel="Minimum price"
        endAriaLabel="Maximum price"
        defaultValue={[20, 80]}
        min={0}
        max={100}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Minimum price' })
    const end = screen.getByRole('slider', { name: 'Maximum price' })

    expect(rootRef.current?.getAttribute('role')).toBe('group')
    expect(startRef.current).toBe(start)
    expect(endRef.current).toBe(end)
    expect(start.getAttribute('aria-valuemin')).toBe('0')
    expect(start.getAttribute('aria-valuemax')).toBe('80')
    expect(start.getAttribute('aria-valuenow')).toBe('20')
    expect(end.getAttribute('aria-valuemin')).toBe('20')
    expect(end.getAttribute('aria-valuemax')).toBe('100')
    expect(end.getAttribute('aria-valuenow')).toBe('80')
  })

  it('keeps a controlled pair authoritative and uses the semantic upper tie', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        value={[0.2, 0.8]}
        steps={4}
        onValueChange={onValueChange}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement

    fireEvent.change(start, { target: { value: '0.3' } })
    expect(onValueChange).toHaveBeenCalledWith([0.4, 0.8])
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0.2, 0.8])

    rerender(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        value={[0.4, 0.6]}
        steps={4}
        onValueChange={onValueChange}
      />,
    )
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0.4, 0.6])
  })

  it('orders initial values and prevents either native thumb from crossing', () => {
    const onValueChange = vi.fn()
    render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.8, 0.2]}
        onValueChange={onValueChange}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement

    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0.2, 0.8])
    fireEvent.change(start, { target: { value: '1' } })
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0.8, 0.8])
    fireEvent.change(end, { target: { value: '0' } })
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0.8, 0.8])
    expect(onValueChange).toHaveBeenLastCalledWith([0.8, 0.8])
  })

  it('selects the nearest thumb and preserves the source overlap tie-break', () => {
    const { unmount } = render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.2, 0.8]}
      />,
    )
    let start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    let end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    let root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RangeSlider root')
    mockBounds(root)
    pointerTap(root, 61)
    expect(start.valueAsNumber).toBeCloseTo(0.3, 1)
    expect(end.valueAsNumber).toBe(0.8)

    unmount()
    render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.5, 0.5]}
      />,
    )
    start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected overlap RangeSlider root')
    mockBounds(root)
    pointerTap(root, 150, 24, 2)
    expect(start.valueAsNumber).toBe(0.5)
    expect(end.valueAsNumber).toBeCloseTo(0.75, 1)
  })

  it('selects start just before exactly overlapping thumbs', () => {
    render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.5, 0.5]}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    const root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RangeSlider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 3,
      pointerType: 'mouse',
      button: 0,
      clientX: 99,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 3,
      pointerType: 'mouse',
      clientX: 50,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 3,
      pointerType: 'mouse',
      clientX: 50,
      clientY: 24,
    })
    expect(start.valueAsNumber).toBeCloseTo(0.25, 1)
    expect(end.valueAsNumber).toBe(0.5)
  })

  it('uses the press coordinate for a sub-slop tap and the full pointer for a drag', () => {
    const onValueChangeFinished = vi.fn()
    render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.2, 0.8]}
        onValueChangeFinished={onValueChangeFinished}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RangeSlider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 10,
      pointerType: 'touch',
      clientX: 60,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 10,
      pointerType: 'touch',
      clientX: 64,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 10,
      pointerType: 'touch',
      clientX: 64,
      clientY: 24,
    })
    expect(start.valueAsNumber).toBeCloseTo((60 - 2) / 196)

    fireEvent.pointerDown(root, {
      pointerId: 11,
      pointerType: 'touch',
      clientX: 60,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 11,
      pointerType: 'touch',
      clientX: 100,
      clientY: 24,
    })
    expect(start.valueAsNumber).toBeCloseTo(0.5)
    fireEvent.pointerCancel(root, {
      pointerId: 11,
      pointerType: 'touch',
    })
    expect(onValueChangeFinished).toHaveBeenCalledTimes(2)
  })

  it('maps range pointers in RTL and cancels orthogonal touch movement', () => {
    const onValueChange = vi.fn()
    const onValueChangeFinished = vi.fn()
    render(
      <div dir="rtl">
        <RangeSlider
          startAriaLabel="Start"
          endAriaLabel="End"
          defaultValue={[0.2, 0.8]}
          onValueChange={onValueChange}
          onValueChangeFinished={onValueChangeFinished}
        />
      </div>,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    const root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RangeSlider root')
    mockBounds(root)

    pointerTap(root, 51)
    expect(start.valueAsNumber).toBe(0.2)
    expect(end.valueAsNumber).toBeCloseTo(0.75, 1)
    expect(onValueChangeFinished).toHaveBeenCalledTimes(1)

    const calls = onValueChange.mock.calls.length
    fireEvent.pointerDown(root, {
      pointerId: 12,
      pointerType: 'touch',
      clientX: 51,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 12,
      pointerType: 'touch',
      clientX: 52,
      clientY: 50,
    })
    fireEvent.pointerUp(root, {
      pointerId: 12,
      pointerType: 'touch',
      clientX: 52,
      clientY: 50,
    })
    expect(onValueChange).toHaveBeenCalledTimes(calls)
    expect(onValueChangeFinished).toHaveBeenCalledTimes(1)
  })

  it('clamps pointer collisions and RTL out-of-bounds drags', () => {
    const { unmount } = render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.4, 0.6]}
      />,
    )
    let start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    let end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    let root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RangeSlider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 15,
      pointerType: 'touch',
      clientX: 80,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 15,
      pointerType: 'touch',
      clientX: 190,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 15,
      pointerType: 'touch',
      clientX: 190,
      clientY: 24,
    })
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0.6, 0.6])

    unmount()
    const outsideRange = render(
      <div dir="rtl">
        <RangeSlider
          startAriaLabel="Start"
          endAriaLabel="End"
          defaultValue={[-10, 10]}
        />
      </div>,
    )
    start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RTL RangeSlider root')
    mockBounds(root)
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([0, 1])

    outsideRange.unmount()
    render(
      <div dir="rtl">
        <RangeSlider
          startAriaLabel="Start"
          endAriaLabel="End"
          defaultValue={[0.2, 0.8]}
        />
      </div>,
    )
    start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement
    root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected draggable RTL RangeSlider root')
    mockBounds(root)

    fireEvent.pointerDown(root, {
      pointerId: 16,
      pointerType: 'touch',
      clientX: 41,
      clientY: 24,
    })
    fireEvent.pointerMove(root, {
      pointerId: 16,
      pointerType: 'touch',
      clientX: -100,
      clientY: 24,
    })
    fireEvent.pointerUp(root, {
      pointerId: 16,
      pointerType: 'touch',
      clientX: -100,
      clientY: 24,
    })
    expect(end.valueAsNumber).toBe(1)
  })

  it('applies constrained keyboard values and RTL arrow reversal independently', () => {
    const onValueChangeFinished = vi.fn()
    render(
      <div dir="rtl">
        <RangeSlider
          startAriaLabel="Start"
          endAriaLabel="End"
          defaultValue={[0.4, 0.6]}
          steps={4}
          onValueChangeFinished={onValueChangeFinished}
        />
      </div>,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const end = screen.getByRole('slider', { name: 'End' }) as HTMLInputElement

    fireEvent.keyDown(start, { key: 'ArrowLeft' })
    expect(start.valueAsNumber).toBe(0.6)
    fireEvent.keyUp(start, { key: 'ArrowLeft' })
    fireEvent.keyDown(end, { key: 'ArrowLeft' })
    expect(end.valueAsNumber).toBe(0.8)
    fireEvent.keyUp(end, { key: 'ArrowLeft' })
    fireEvent.keyDown(end, { key: 'Home' })
    expect(end.valueAsNumber).toBe(0.6)
    fireEvent.keyUp(end, { key: 'Home' })
    expect(onValueChangeFinished).toHaveBeenCalledTimes(3)
  })

  it('runs root pointer handlers consumer-first and honors cancellation', () => {
    const onValueChange = vi.fn()
    render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.2, 0.8]}
        onValueChange={onValueChange}
        onPointerDown={(event) => event.preventDefault()}
      />,
    )
    const root = screen.getByRole('group')
    mockBounds(root)
    pointerTap(root, 100)

    expect(onValueChange).not.toHaveBeenCalled()
    expect(root.hasAttribute('data-m3e-active-thumb')).toBe(false)
  })

  it('ignores range pointer and keyboard interaction while disabled', () => {
    const onValueChange = vi.fn()
    const onValueChangeFinished = vi.fn()
    render(
      <RangeSlider
        startAriaLabel="Start"
        endAriaLabel="End"
        defaultValue={[0.2, 0.8]}
        disabled
        onValueChange={onValueChange}
        onValueChangeFinished={onValueChangeFinished}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Start' }) as HTMLInputElement
    const root = start.closest('.m3e-range-slider')
    if (!root) throw new Error('Expected RangeSlider root')
    mockBounds(root)

    pointerTap(root, 100)
    fireEvent.keyDown(start, { key: 'ArrowRight' })
    fireEvent.keyUp(start, { key: 'ArrowRight' })

    expect(start.disabled).toBe(true)
    expect(start.valueAsNumber).toBe(0.2)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(onValueChangeFinished).not.toHaveBeenCalled()
  })

  it('submits both native values and restores its uncontrolled default on reset', () => {
    render(
      <form data-testid="range-form">
        <RangeSlider
          startAriaLabel="Minimum"
          endAriaLabel="Maximum"
          defaultValue={[20, 80]}
          min={0}
          max={100}
          startInputProps={{ name: 'minimum' }}
          endInputProps={{ name: 'maximum' }}
        />
      </form>,
    )
    const form = screen.getByTestId('range-form') as HTMLFormElement
    const start = screen.getByRole('slider', { name: 'Minimum' }) as HTMLInputElement
    const end = screen.getByRole('slider', { name: 'Maximum' }) as HTMLInputElement

    fireEvent.change(start, { target: { value: '30' } })
    fireEvent.change(end, { target: { value: '70' } })
    const submitted = new FormData(form)
    expect(submitted.get('minimum')).toBe('30')
    expect(submitted.get('maximum')).toBe('70')

    fireEvent.reset(form)
    expect([start.valueAsNumber, end.valueAsNumber]).toEqual([20, 80])
  })

  it('warns for missing names and invalid runtime state without throwing', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const UntypedRangeSlider = RangeSlider as ComponentType<Record<string, unknown>>
    render(
      createElement(UntypedRangeSlider, {
        value: [0.2, 0.8],
        defaultValue: [0, 1],
        min: 1,
        max: 0,
        steps: -1,
      }),
    )

    expect(screen.getAllByRole('slider')).toHaveLength(2)
    expect(warning).toHaveBeenCalledWith(
      'RangeSlider: use either value or defaultValue, not both.',
    )
    expect(warning).toHaveBeenCalledWith(
      'RangeSlider: a controlled value requires onValueChange.',
    )
    expect(warning).toHaveBeenCalledWith(
      'RangeSlider: startAriaLabel must provide a localized accessible name.',
    )
    expect(warning).toHaveBeenCalledWith(
      'RangeSlider: endAriaLabel must provide a localized accessible name.',
    )
  })

  it('exposes a stable component name', () => {
    expect(RangeSlider.displayName).toBe('RangeSlider')
  })
})
