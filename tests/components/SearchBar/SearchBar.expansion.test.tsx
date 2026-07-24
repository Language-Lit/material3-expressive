// @vitest-environment jsdom

import { useState } from 'react'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, vi } from 'vitest'
import { SearchBar } from '../../../src/components/SearchBar'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'
import {
  installWidthMatchMedia,
  type WidthMatchMediaController,
} from '../NavigationSuite/navigation-suite-native-polyfill'

beforeAll(installDialogPolyfill)
afterEach(cleanup)

const COMPACT = 420
const EXPANDED_WINDOW = 1280

const collapsedBar = (): HTMLElement =>
  document.querySelector('.m3e-search-bar__bar[data-m3e-placement="collapsed"]') as HTMLElement

const collapsedInput = (): HTMLInputElement =>
  collapsedBar().querySelector('.m3e-search-bar__input') as HTMLInputElement

const expandedInput = (): HTMLInputElement | null =>
  document.querySelector(
    '.m3e-search-bar__bar[data-m3e-placement="expanded"] .m3e-search-bar__input',
  )

const dialog = (): HTMLDialogElement =>
  document.querySelector('.m3e-search-bar__full-screen') as HTMLDialogElement

const panel = (): HTMLElement | null => document.querySelector('.m3e-search-bar__panel')

const scrim = (): HTMLElement | null => document.querySelector('.m3e-search-bar__scrim')

function renderAt(width: number, ui: React.ReactElement): WidthMatchMediaController {
  const controller = installWidthMatchMedia(width)
  render(ui)
  return controller
}

describe('SearchBar expansion surfaces', () => {
  it('opens the full-screen surface through showModal in a compact window', async () => {
    const user = userEvent.setup()
    renderAt(COMPACT, <SearchBar placeholder="Search">results</SearchBar>)

    expect(dialog().hasAttribute('open')).toBe(false)
    await user.click(collapsedInput())

    expect(dialog().hasAttribute('open')).toBe(true)
    expect(panel()).toBeNull()
    expect(dialog().textContent).toContain('results')
  })

  it('opens the docked surface in a portal above the compact breakpoint', async () => {
    const user = userEvent.setup()
    renderAt(EXPANDED_WINDOW, <SearchBar placeholder="Search">results</SearchBar>)
    await user.click(collapsedInput())

    expect(dialog().hasAttribute('open')).toBe(false)
    expect(panel()).not.toBeNull()
    expect(panel()?.parentElement?.parentElement).toBe(document.body)
    expect(panel()?.textContent).toContain('results')
  })

  it('follows the window across the adaptive breakpoint while expanded', async () => {
    const user = userEvent.setup()
    const controller = renderAt(
      COMPACT,
      <SearchBar placeholder="Search" defaultExpanded>
        results
      </SearchBar>,
    )
    await user.click(collapsedInput())
    expect(dialog().hasAttribute('open')).toBe(true)

    act(() => controller.setWidth(EXPANDED_WINDOW))

    // The surface changes; the expansion itself survives.
    expect(dialog().hasAttribute('open')).toBe(false)
    expect(panel()).not.toBeNull()
    expect(collapsedInput().getAttribute('aria-expanded')).toBe('true')
  })

  it('honors an explicit layout regardless of the window', async () => {
    const user = userEvent.setup()
    renderAt(
      EXPANDED_WINDOW,
      <SearchBar placeholder="Search" layout="fullScreen">
        results
      </SearchBar>,
    )
    await user.click(collapsedInput())

    expect(dialog().hasAttribute('open')).toBe(true)
    expect(panel()).toBeNull()
  })

  it('divides bar from results only in the divided treatment', () => {
    renderAt(
      COMPACT,
      <SearchBar placeholder="Search" appearance="divided" defaultExpanded>
        results
      </SearchBar>,
    )
    expect(dialog().querySelector('.m3e-search-bar__divider')).not.toBeNull()

    cleanup()
    renderAt(
      COMPACT,
      <SearchBar placeholder="Search" appearance="contained" defaultExpanded>
        results
      </SearchBar>,
    )
    expect(dialog().querySelector('.m3e-search-bar__divider')).toBeNull()
  })

  it('dims the page behind a contained drop-down and never behind a divided one', async () => {
    const user = userEvent.setup()
    renderAt(
      EXPANDED_WINDOW,
      <SearchBar placeholder="Search" appearance="contained">
        results
      </SearchBar>,
    )
    await user.click(collapsedInput())
    expect(scrim()).not.toBeNull()

    cleanup()
    installWidthMatchMedia(EXPANDED_WINDOW)
    render(
      <SearchBar placeholder="Search" appearance="divided">
        results
      </SearchBar>,
    )
    await user.click(collapsedInput())
    expect(scrim()).toBeNull()
  })

  it('moves focus and the caret into the expanded field', async () => {
    const user = userEvent.setup()
    renderAt(
      COMPACT,
      <SearchBar placeholder="Search" defaultQuery="messages">
        results
      </SearchBar>,
    )

    // Expanded from the keyboard, so the caret is wherever the user left it —
    // a pointer press would have moved it to the press point first.
    collapsedInput().focus()
    collapsedInput().setSelectionRange(2, 5)
    await user.keyboard('{ArrowDown}')

    const expanded = expandedInput() as HTMLInputElement
    expect(document.activeElement).toBe(expanded)
    expect(expanded.value).toBe('messages')
    expect(expanded.selectionStart).toBe(2)
    expect(expanded.selectionEnd).toBe(5)
  })

  it('makes the in-page bar inert while a surface is open, and restores it', async () => {
    const user = userEvent.setup()
    const controller = renderAt(
      COMPACT,
      <SearchBar placeholder="Search">results</SearchBar>,
    )
    expect(collapsedBar().inert).toBe(false)

    await user.click(collapsedInput())
    expect(collapsedBar().inert).toBe(true)

    await user.keyboard('{Escape}')
    expect(collapsedBar().inert).toBe(false)
    expect(controller).toBeDefined()
  })

  it('moves focus into the results on the down key while expanded', async () => {
    const user = userEvent.setup()
    renderAt(
      COMPACT,
      <SearchBar placeholder="Search">
        <button type="button">Recent: invoices</button>
        <button type="button">Recent: receipts</button>
      </SearchBar>,
    )
    await user.click(collapsedInput())
    await user.keyboard('{ArrowDown}')

    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Recent: invoices' }),
    )
  })

  it('collapses when the native dialog closes, whatever closed it', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()

    function Harness() {
      const [expanded, setExpanded] = useState(false)
      return (
        <SearchBar
          placeholder="Search"
          layout="fullScreen"
          expanded={expanded}
          onExpandedChange={(next) => {
            onExpandedChange(next)
            setExpanded(next)
          }}
        >
          results
        </SearchBar>
      )
    }

    installWidthMatchMedia(COMPACT)
    render(<Harness />)
    await user.click(collapsedInput())
    expect(dialog().hasAttribute('open')).toBe(true)

    // Escape reaches the dialog itself in a browser; the polyfilled close()
    // stands in for that, and the close event is the single path back.
    act(() => dialog().close())
    expect(onExpandedChange).toHaveBeenLastCalledWith(false)
  })

  it('collapses the docked surface on an outside pointer press', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    renderAt(
      EXPANDED_WINDOW,
      <SearchBar placeholder="Search" onExpandedChange={onExpandedChange}>
        results
      </SearchBar>,
    )
    await user.click(collapsedInput())
    onExpandedChange.mockClear()

    await user.click(document.body)
    expect(onExpandedChange).toHaveBeenCalledWith(false)
  })

  it('returns focus to the in-page field when the surface dismissed itself', async () => {
    const user = userEvent.setup()
    renderAt(
      EXPANDED_WINDOW,
      <SearchBar placeholder="Search">results</SearchBar>,
    )
    await user.click(collapsedInput())
    expect(document.activeElement).toBe(expandedInput())

    await user.keyboard('{Escape}')
    expect(document.activeElement).toBe(collapsedInput())
  })

  it('points aria-controls at the results only while they exist', async () => {
    const user = userEvent.setup()
    renderAt(COMPACT, <SearchBar placeholder="Search">results</SearchBar>)
    expect(collapsedInput().hasAttribute('aria-controls')).toBe(false)

    await user.click(collapsedInput())
    const controls = expandedInput()?.getAttribute('aria-controls')
    expect(controls).not.toBeNull()
    expect(document.getElementById(controls as string)?.className).toBe(
      'm3e-search-bar__results',
    )
  })
})
