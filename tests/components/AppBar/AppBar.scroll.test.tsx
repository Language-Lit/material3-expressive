// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { AppBar } from '../../../src/components/AppBar'
import { topTitleAlphaEasing } from '../../../src/internal/useAppBarScroll'

afterEach(cleanup)

function setWindowScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true })
  fireEvent.scroll(window)
}

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
})

/** jsdom has no layout, so the bar's own height is supplied explicitly. */
function mockHeight(element: HTMLElement, height: number) {
  Object.defineProperty(element, 'offsetHeight', { value: height, configurable: true })
}

describe('AppBar scroll coupling', () => {
  it('does not observe scrolling at all without a behavior', () => {
    render(<AppBar data-testid="bar" title="Inbox" />)
    setWindowScroll(200)

    expect(screen.getByTestId('bar').hasAttribute('data-m3e-scrolled')).toBe(false)
  })

  it('marks a pinned bar scrolled on any overlap and unmarks it at the top', () => {
    render(<AppBar data-testid="bar" title="Inbox" scrollBehavior="pinned" />)
    const bar = screen.getByTestId('bar')

    setWindowScroll(1)
    expect(bar.getAttribute('data-m3e-scrolled')).toBe('true')

    setWindowScroll(0)
    expect(bar.hasAttribute('data-m3e-scrolled')).toBe(false)
  })

  it('applies a pre-existing scroll position at mount rather than waiting for an event', () => {
    Object.defineProperty(window, 'scrollY', { value: 120, writable: true, configurable: true })
    render(<AppBar data-testid="bar" title="Inbox" scrollBehavior="pinned" />)

    expect(screen.getByTestId('bar').getAttribute('data-m3e-scrolled')).toBe('true')
  })

  it('observes an explicit scroll container instead of the window', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const containerRef = createRef<HTMLDivElement>()
    Object.assign(containerRef, { current: container })

    render(
      <AppBar
        data-testid="bar"
        title="Inbox"
        scrollBehavior="pinned"
        scrollContainer={containerRef}
      />,
    )

    container.scrollTop = 40
    fireEvent.scroll(container)
    expect(screen.getByTestId('bar').getAttribute('data-m3e-scrolled')).toBe('true')

    // Window scrolling is not observed when a container is named.
    container.scrollTop = 0
    fireEvent.scroll(container)
    setWindowScroll(300)
    expect(screen.getByTestId('bar').hasAttribute('data-m3e-scrolled')).toBe(false)

    container.remove()
  })

  it('hides an enter-always bar by its accumulated offset, clamped to its height', () => {
    render(<AppBar data-testid="bar" title="Inbox" scrollBehavior="enterAlways" />)
    const bar = screen.getByTestId('bar')
    mockHeight(bar, 64)

    setWindowScroll(200)
    expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('64px')
  })

  it('begins revealing an enter-always bar on any upward scroll', () => {
    render(<AppBar data-testid="bar" title="Inbox" scrollBehavior="enterAlways" />)
    const bar = screen.getByTestId('bar')
    mockHeight(bar, 64)

    setWindowScroll(200)
    setWindowScroll(190)
    expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('54px')
  })

  it('snaps a partially hidden enter-always bar once scrolling goes idle', () => {
    vi.useFakeTimers()
    try {
      render(<AppBar data-testid="bar" title="Inbox" scrollBehavior="enterAlways" />)
      const bar = screen.getByTestId('bar')
      mockHeight(bar, 64)

      setWindowScroll(200)
      setWindowScroll(190) // offset 54, past halfway: snaps hidden
      vi.advanceTimersByTime(200)
      expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('64px')
      expect(bar.getAttribute('data-m3e-settling')).toBe('true')

      setWindowScroll(160) // offset 34
      setWindowScroll(130) // offset 4, under halfway: snaps shown
      vi.advanceTimersByTime(200)
      expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('0px')
    } finally {
      vi.useRealTimers()
    }
  })

  it('reveals a hidden enter-always bar when focus lands inside it', () => {
    render(
      <AppBar
        data-testid="bar"
        title="Inbox"
        scrollBehavior="enterAlways"
        actions={<button type="button">Search</button>}
      />,
    )
    const bar = screen.getByTestId('bar')
    mockHeight(bar, 64)

    setWindowScroll(200)
    expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('64px')

    fireEvent.focusIn(screen.getByRole('button'))
    expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('0px')
    expect(bar.getAttribute('data-m3e-settling')).toBe('true')
  })

  it('drives the collapse fraction from scroll position over the sourced range', () => {
    // Medium: 112 − 64 = 48px of collapse range (the sourced fallback, since
    // jsdom measures no layout).
    render(<AppBar data-testid="bar" size="medium" title="Inbox" scrollBehavior="exitUntilCollapsed" />)
    const bar = screen.getByTestId('bar')

    setWindowScroll(12)
    expect(bar.style.getPropertyValue('--m3e-app-bar-collapsed-fraction')).toBe('0.25')

    setWindowScroll(48)
    expect(bar.style.getPropertyValue('--m3e-app-bar-collapsed-fraction')).toBe('1')

    setWindowScroll(500)
    expect(bar.style.getPropertyValue('--m3e-app-bar-collapsed-fraction')).toBe('1')

    setWindowScroll(0)
    expect(bar.style.getPropertyValue('--m3e-app-bar-collapsed-fraction')).toBe('0')
  })

  it('selects the taller sourced range when a flexible bar has a subtitle', () => {
    // Large flexible with subtitle: 152 − 64 = 88.
    render(
      <AppBar
        data-testid="bar"
        size="large"
        flexible
        title="Inbox"
        subtitle="All accounts"
        scrollBehavior="exitUntilCollapsed"
      />,
    )
    const bar = screen.getByTestId('bar')

    setWindowScroll(44)
    expect(bar.style.getPropertyValue('--m3e-app-bar-collapsed-fraction')).toBe('0.5')
  })

  it('eases the collapsed title alpha with the sourced curve, not linearly', () => {
    render(<AppBar data-testid="bar" size="medium" title="Inbox" scrollBehavior="exitUntilCollapsed" />)
    const bar = screen.getByTestId('bar')

    setWindowScroll(24) // fraction 0.5
    const alpha = Number.parseFloat(bar.style.getPropertyValue('--m3e-app-bar-top-title-alpha'))

    // CubicBezierEasing(.8, 0, .8, .15) holds the collapsed title back: at
    // fraction 0.5 it has barely begun to appear.
    expect(alpha).toBeCloseTo(topTitleAlphaEasing(0.5), 5)
    expect(alpha).toBeGreaterThan(0)
    expect(alpha).toBeLessThan(0.2)

    setWindowScroll(48)
    expect(bar.style.getPropertyValue('--m3e-app-bar-top-title-alpha')).toBe('1')
  })

  it('swaps the two titles’ semantics at fraction 0.5, as the source hides one row from the other', () => {
    render(<AppBar data-testid="bar" size="medium" title="Inbox" scrollBehavior="exitUntilCollapsed" />)
    const bar = screen.getByTestId('bar')
    const collapsedTitle = bar.querySelector('.m3e-app-bar__row .m3e-app-bar__title-group')
    const expandedTitle = bar.querySelector('.m3e-app-bar__expanded-row .m3e-app-bar__title-group')

    // At rest the expanded title speaks and the collapsed copy is hidden.
    expect(collapsedTitle?.getAttribute('aria-hidden')).toBe('true')
    expect(expandedTitle?.hasAttribute('aria-hidden')).toBe(false)

    setWindowScroll(36) // fraction 0.75
    expect(bar.getAttribute('data-m3e-collapsed')).toBe('true')
    expect(collapsedTitle?.getAttribute('aria-hidden')).toBe('false')
    expect(expandedTitle?.getAttribute('aria-hidden')).toBe('true')

    setWindowScroll(0)
    expect(bar.hasAttribute('data-m3e-collapsed')).toBe(false)
    expect(collapsedTitle?.getAttribute('aria-hidden')).toBe('true')
    expect(expandedTitle?.getAttribute('aria-hidden')).toBe('false')
  })

  it('tears the coupling down when the behavior is removed', () => {
    const { rerender } = render(
      <AppBar data-testid="bar" title="Inbox" scrollBehavior="pinned" />,
    )
    const bar = screen.getByTestId('bar')

    setWindowScroll(100)
    expect(bar.getAttribute('data-m3e-scrolled')).toBe('true')

    rerender(<AppBar data-testid="bar" title="Inbox" scrollBehavior="none" />)
    expect(bar.hasAttribute('data-m3e-scrolled')).toBe(false)

    setWindowScroll(300)
    expect(bar.hasAttribute('data-m3e-scrolled')).toBe(false)
  })

  it('evaluates the sourced easing exactly at its endpoints', () => {
    expect(topTitleAlphaEasing(0)).toBe(0)
    expect(topTitleAlphaEasing(1)).toBe(1)
    // Monotonic and held back below the diagonal through the midrange.
    let previous = 0
    for (const fraction of [0.1, 0.25, 0.5, 0.75, 0.9]) {
      const value = topTitleAlphaEasing(fraction)
      expect(value).toBeGreaterThanOrEqual(previous)
      expect(value).toBeLessThan(fraction)
      previous = value
    }
  })
})
