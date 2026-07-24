// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { SearchAppBar, SearchBar } from '../../../src/components/SearchBar'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'
import { installWidthMatchMedia } from '../NavigationSuite/navigation-suite-native-polyfill'

beforeAll(installDialogPolyfill)
beforeEach(() => {
  installWidthMatchMedia(1280)
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
})
afterEach(cleanup)

function setWindowScroll(y: number) {
  Object.defineProperty(window, 'scrollY', { value: y, writable: true, configurable: true })
  fireEvent.scroll(window)
}

/** jsdom has no layout, so the bar's own height is supplied explicitly. */
function mockHeight(element: HTMLElement, height: number) {
  Object.defineProperty(element, 'offsetHeight', { value: height, configurable: true })
}

const bar = () => screen.getByTestId('app-bar')

describe('SearchAppBar', () => {
  it('is a banner landmark carrying the search bar it wraps', () => {
    render(
      <SearchAppBar data-testid="app-bar">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    expect(bar().tagName).toBe('HEADER')
    expect(bar().className).toBe('m3e-search-app-bar')
    expect(bar().querySelector('.m3e-search-bar')).not.toBeNull()
  })

  it('renders the navigation and action slots around the search container', () => {
    render(
      <SearchAppBar
        data-testid="app-bar"
        navigationIcon={<button type="button">Menu</button>}
        actions={<button type="button">Account</button>}
      >
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    expect([...bar().children].map((child) => child.className)).toEqual([
      'm3e-search-app-bar__navigation',
      'm3e-search-app-bar__search',
      'm3e-search-app-bar__actions',
    ])
  })

  it('omits both slots when neither is given', () => {
    render(
      <SearchAppBar data-testid="app-bar">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    expect([...bar().children].map((child) => child.className)).toEqual([
      'm3e-search-app-bar__search',
    ])
  })

  it('does not observe scrolling at all without a behavior', () => {
    render(
      <SearchAppBar data-testid="app-bar">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )
    setWindowScroll(200)

    expect(bar().getAttribute('data-m3e-scroll-behavior')).toBe('none')
    expect(bar().hasAttribute('data-m3e-scrolled')).toBe(false)
  })

  it('marks a pinned bar scrolled on any overlap and unmarks it at the top', () => {
    render(
      <SearchAppBar data-testid="app-bar" scrollBehavior="pinned">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    setWindowScroll(1)
    expect(bar().getAttribute('data-m3e-scrolled')).toBe('true')

    setWindowScroll(0)
    expect(bar().hasAttribute('data-m3e-scrolled')).toBe(false)
  })

  it('hides an enter-always bar under its own variable namespace', () => {
    render(
      <SearchAppBar data-testid="app-bar" scrollBehavior="enterAlways">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )
    mockHeight(bar(), 72)

    setWindowScroll(200)
    expect(bar().style.getPropertyValue('--m3e-search-app-bar-offset')).toBe('72px')
    // The shared primitive must not write the app bar's own names here.
    expect(bar().style.getPropertyValue('--m3e-app-bar-offset')).toBe('')

    setWindowScroll(190)
    expect(bar().style.getPropertyValue('--m3e-search-app-bar-offset')).toBe('62px')
  })

  it('snaps a partially hidden bar once scrolling goes idle', () => {
    vi.useFakeTimers()
    try {
      render(
        <SearchAppBar data-testid="app-bar" scrollBehavior="enterAlways">
          <SearchBar placeholder="Search mail" />
        </SearchAppBar>,
      )
      mockHeight(bar(), 72)

      setWindowScroll(200)
      setWindowScroll(190) // offset 62, past halfway: snaps hidden
      vi.advanceTimersByTime(200)

      expect(bar().style.getPropertyValue('--m3e-search-app-bar-offset')).toBe('72px')
      expect(bar().getAttribute('data-m3e-settling')).toBe('true')
    } finally {
      vi.useRealTimers()
    }
  })

  it('reveals a hidden bar when focus lands inside it', () => {
    render(
      <SearchAppBar data-testid="app-bar" scrollBehavior="enterAlways">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )
    mockHeight(bar(), 72)
    setWindowScroll(200)
    expect(bar().style.getPropertyValue('--m3e-search-app-bar-offset')).toBe('72px')

    fireEvent.focusIn(bar())
    expect(bar().style.getPropertyValue('--m3e-search-app-bar-offset')).toBe('0px')
  })

  it('observes an explicit scroll container instead of the window', () => {
    const container = document.createElement('div')
    document.body.append(container)
    const containerRef = createRef<HTMLDivElement>()
    Object.assign(containerRef, { current: container })

    render(
      <SearchAppBar
        data-testid="app-bar"
        scrollBehavior="pinned"
        scrollContainer={containerRef}
      >
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    container.scrollTop = 40
    fireEvent.scroll(container)
    expect(bar().getAttribute('data-m3e-scrolled')).toBe('true')

    container.scrollTop = 0
    fireEvent.scroll(container)
    setWindowScroll(300)
    expect(bar().hasAttribute('data-m3e-scrolled')).toBe(false)

    container.remove()
  })

  it('leaves the page markup clean when nothing has scrolled yet', () => {
    render(
      <SearchAppBar data-testid="app-bar" scrollBehavior="enterAlways">
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    expect(bar().getAttribute('style')).toBeNull()
  })

  it('forwards the ref to the header', () => {
    const ref = createRef<HTMLElement>()
    render(
      <SearchAppBar data-testid="app-bar" ref={ref}>
        <SearchBar placeholder="Search mail" />
      </SearchAppBar>,
    )

    expect(ref.current).toBe(bar())
  })
})
