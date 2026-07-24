// @vitest-environment jsdom

import { createRef, useState } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { SearchBar } from '../../../src/components/SearchBar'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'
import { installWidthMatchMedia } from '../NavigationSuite/navigation-suite-native-polyfill'

beforeAll(installDialogPolyfill)
beforeEach(() => {
  installWidthMatchMedia(1280)
})
afterEach(cleanup)

const collapsedInput = (): HTMLInputElement =>
  document.querySelector(
    '.m3e-search-bar__bar[data-m3e-placement="collapsed"] .m3e-search-bar__input',
  ) as HTMLInputElement

const expandedInput = (): HTMLInputElement | null =>
  document.querySelector(
    '.m3e-search-bar__bar[data-m3e-placement="expanded"] .m3e-search-bar__input',
  )

describe('SearchBar', () => {
  it('renders one collapsed bar carrying a combobox input', () => {
    render(<SearchBar placeholder="Search your messages" />)
    const input = collapsedInput()

    expect(input.tagName).toBe('INPUT')
    expect(input.getAttribute('type')).toBe('search')
    expect(input.getAttribute('role')).toBe('combobox')
    expect(input.getAttribute('aria-expanded')).toBe('false')
    expect(expandedInput()).toBeNull()
  })

  it('uses the hinted search text as the accessible name, and lets aria-label win', () => {
    const { rerender } = render(<SearchBar placeholder="Search replies" />)
    expect(collapsedInput().getAttribute('aria-label')).toBe('Search replies')

    rerender(<SearchBar placeholder="Search replies" aria-label="Search all mail" />)
    expect(collapsedInput().getAttribute('aria-label')).toBe('Search all mail')
  })

  it('renders the appearance and layout as data attributes for styling', () => {
    render(
      <SearchBar
        placeholder="Search"
        appearance="divided"
        layout="docked"
        data-testid="bar"
      />,
    )
    const root = document.querySelector('.m3e-search-bar') as HTMLElement

    expect(root.getAttribute('data-m3e-appearance')).toBe('divided')
    expect(root.getAttribute('data-m3e-layout')).toBe('docked')
    expect(root.hasAttribute('data-m3e-expanded')).toBe(false)
  })

  it('defaults to the contained treatment the design site recommends', () => {
    render(<SearchBar placeholder="Search" />)
    expect(
      (document.querySelector('.m3e-search-bar') as HTMLElement).getAttribute(
        'data-m3e-appearance',
      ),
    ).toBe('contained')
  })

  it('keeps an uncontrolled query in the field and reports every change', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(<SearchBar placeholder="Search" defaultQuery="ma" onQueryChange={onQueryChange} />)

    expect(collapsedInput().value).toBe('ma')
    await user.click(collapsedInput())
    await user.keyboard('p')

    expect(onQueryChange).toHaveBeenCalledWith('map')
  })

  it('holds a controlled query authoritative until the consumer moves it', async () => {
    const user = userEvent.setup()
    const onQueryChange = vi.fn()
    render(
      <SearchBar placeholder="Search" query="fixed" onQueryChange={onQueryChange} />,
    )
    await user.click(collapsedInput())
    await user.keyboard('x')

    expect(onQueryChange).toHaveBeenCalledWith('fixedx')
    expect(collapsedInput().value).toBe('fixed')
  })

  it('expands when the field is activated by pointer', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(<SearchBar placeholder="Search" onExpandedChange={onExpandedChange} />)

    await user.click(collapsedInput())
    expect(onExpandedChange).toHaveBeenCalledWith(true)
  })

  it('expands when the query grows, and never when it shrinks', async () => {
    const user = userEvent.setup()

    function Harness() {
      const [expanded, setExpanded] = useState(false)
      const [query, setQuery] = useState('ab')
      return (
        <>
          <span data-testid="state">{String(expanded)}</span>
          <SearchBar
            placeholder="Search"
            query={query}
            onQueryChange={setQuery}
            expanded={expanded}
            onExpandedChange={setExpanded}
          />
        </>
      )
    }

    render(<Harness />)
    // Deleting a character must not expand: the source watches for a query
    // that grew, so backspacing in a collapsed bar leaves it collapsed.
    collapsedInput().focus()
    await user.keyboard('{Backspace}')
    expect(screen.getByTestId('state').textContent).toBe('false')

    await user.keyboard('c')
    expect(screen.getByTestId('state').textContent).toBe('true')
  })

  it('expands on the down key while collapsed', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(<SearchBar placeholder="Search" onExpandedChange={onExpandedChange} />)

    collapsedInput().focus()
    await user.keyboard('{ArrowDown}')
    expect(onExpandedChange).toHaveBeenCalledWith(true)
  })

  it('reports a search on Enter and keeps the results showing', async () => {
    const user = userEvent.setup()
    const onSearch = vi.fn()
    const onExpandedChange = vi.fn()
    render(
      <SearchBar
        placeholder="Search"
        defaultQuery="tickets"
        defaultExpanded
        onSearch={onSearch}
        onExpandedChange={onExpandedChange}
      />,
    )

    ;(expandedInput() as HTMLInputElement).focus()
    await user.keyboard('{Enter}')

    expect(onSearch).toHaveBeenCalledWith('tickets')
    expect(onExpandedChange).not.toHaveBeenCalled()
  })

  it('collapses on Escape', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(
      <SearchBar placeholder="Search" defaultExpanded onExpandedChange={onExpandedChange} />,
    )

    ;(expandedInput() as HTMLInputElement).focus()
    await user.keyboard('{Escape}')
    expect(onExpandedChange).toHaveBeenCalledWith(false)
  })

  it('never expands while disabled', async () => {
    const user = userEvent.setup()
    const onExpandedChange = vi.fn()
    render(<SearchBar placeholder="Search" disabled onExpandedChange={onExpandedChange} />)

    await user.click(collapsedInput())
    expect(collapsedInput().disabled).toBe(true)
    expect(onExpandedChange).not.toHaveBeenCalled()
  })

  it('renders the leading, trailing, and avatar slots in anatomy order', () => {
    render(
      <SearchBar
        placeholder="Search"
        leadingIcon={<span data-testid="leading">L</span>}
        trailingIcon={<span data-testid="trailing">T</span>}
        avatar={<img alt="" src="data:," />}
      />,
    )
    const bar = document.querySelector(
      '.m3e-search-bar__bar[data-m3e-placement="collapsed"]',
    ) as HTMLElement
    const classes = [...bar.children].map((child) => child.className)

    expect(classes).toEqual([
      'm3e-search-bar__leading',
      'm3e-search-bar__input',
      'm3e-search-bar__avatar',
      'm3e-search-bar__trailing',
    ])
  })

  it('names the in-page field only, so an expanded copy cannot double-submit', () => {
    render(<SearchBar placeholder="Search" name="q" defaultExpanded />)

    expect(collapsedInput().getAttribute('name')).toBe('q')
    expect(expandedInput()?.hasAttribute('name')).toBe(false)
  })

  it('forwards the ref to the field, not the wrapper', () => {
    const ref = createRef<HTMLInputElement>()
    render(<SearchBar placeholder="Search" ref={ref} />)

    expect(ref.current).toBe(collapsedInput())
  })

  it('composes a consumer keydown handler and honors its cancellation', async () => {
    const user = userEvent.setup()
    const onKeyDown = vi.fn((event: { preventDefault: () => void }) => event.preventDefault())
    const onSearch = vi.fn()
    render(
      <SearchBar placeholder="Search" onKeyDown={onKeyDown} onSearch={onSearch} />,
    )

    collapsedInput().focus()
    await user.keyboard('{Enter}')

    expect(onKeyDown).toHaveBeenCalled()
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('warns for contradictory or incomplete control props', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    render(<SearchBar placeholder="Search" query="a" defaultQuery="b" onQueryChange={() => {}} />)
    cleanup()
    render(<SearchBar placeholder="Search" query="a" />)
    cleanup()
    render(
      <SearchBar
        placeholder="Search"
        expanded
        defaultExpanded
        onExpandedChange={() => {}}
      />,
    )
    cleanup()
    render(<SearchBar placeholder="Search" expanded />)

    const messages = warn.mock.calls.map((call) => String(call[0]))
    expect(messages.some((message) => message.includes('query or defaultQuery'))).toBe(true)
    expect(messages.some((message) => message.includes('controlled query'))).toBe(true)
    expect(messages.some((message) => message.includes('expanded or defaultExpanded'))).toBe(true)
    expect(messages.some((message) => message.includes('controlled expanded'))).toBe(true)
    warn.mockRestore()
  })

  it('never warns for a valid uncontrolled bar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<SearchBar placeholder="Search" defaultQuery="a" defaultExpanded={false} />)

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
