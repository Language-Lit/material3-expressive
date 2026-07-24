// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { AppBar } from '../../../src/components/AppBar'

afterEach(cleanup)

beforeEach(() => {
  Object.defineProperty(window, 'scrollY', { value: 0, writable: true, configurable: true })
})

describe('AppBar accessibility', () => {
  it('is a banner landmark through the native header element', () => {
    render(<AppBar title="Inbox" />)
    expect(screen.getByRole('banner').className).toBe('m3e-app-bar')
  })

  it('leaves document structure to the consumer instead of coercing a heading', () => {
    render(<AppBar title="Inbox" />)
    // The title is plain slotted content: no heading role appears unless the
    // consumer renders one, per the specification's rule that typography
    // roles never determine the element.
    expect(screen.queryByRole('heading')).toBeNull()

    cleanup()
    render(<AppBar title={<h1>Inbox</h1>} />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Inbox')
  })

  it('keeps slotted controls reachable in DOM order: navigation, then actions', async () => {
    render(
      <AppBar
        title="Inbox"
        navigationIcon={<button type="button">Open menu</button>}
        actions={<button type="button">Search</button>}
      />,
    )
    const buttons = screen.getAllByRole('button')

    expect(buttons.map((button) => button.textContent)).toEqual(['Open menu', 'Search'])
  })

  it('exposes exactly one title to assistive technology on a two-row bar', () => {
    render(<AppBar data-testid="bar" size="large" title="Inbox" />)
    const bar = screen.getByTestId('bar')
    const hidden = bar.querySelectorAll('[aria-hidden="true"]')

    // The collapsed copy rests hidden; the expanded copy speaks. The swap at
    // collapse fraction 0.5 is covered in the scroll suite.
    expect(hidden).toHaveLength(1)
    expect(hidden[0]?.className).toBe('m3e-app-bar__title-group')
    expect(hidden[0]?.closest('.m3e-app-bar__row')).not.toBeNull()
  })

  it('exposes the single-row title with no aria-hidden bookkeeping at all', () => {
    render(<AppBar data-testid="bar" title="Inbox" />)
    expect(screen.getByTestId('bar').querySelectorAll('[aria-hidden]')).toHaveLength(0)
  })

  it('reveals an enter-always bar when a keyboard user tabs into it', () => {
    // The Material accessibility page requires app bar actions to stay
    // reachable while content is scrolled; the focus-within reveal is how
    // this port satisfies it. Covered mechanically in the scroll suite; this
    // asserts the contract end to end from the control's perspective.
    render(
      <AppBar
        data-testid="bar"
        title="Inbox"
        scrollBehavior="enterAlways"
        actions={<button type="button">Search</button>}
      />,
    )
    const bar = screen.getByTestId('bar')
    Object.defineProperty(bar, 'offsetHeight', { value: 64, configurable: true })

    Object.defineProperty(window, 'scrollY', { value: 300, writable: true, configurable: true })
    fireEvent.scroll(window)
    expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('64px')

    screen.getByRole('button').focus()
    fireEvent.focusIn(screen.getByRole('button'))
    expect(bar.style.getPropertyValue('--m3e-app-bar-offset')).toBe('0px')
  })

  it('warns when flexible is passed to a small bar, which the source does not have', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error the type system rejects this; the warning covers JS consumers.
    render(<AppBar title="Inbox" size="small" flexible />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('flexible'))
    warn.mockRestore()
  })

  it('warns when a subtitle is passed to a baseline two-row bar', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error rejected statically; the warning covers JS consumers.
    render(<AppBar title="Inbox" size="medium" subtitle="All accounts" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('subtitle'))
    warn.mockRestore()
  })

  it('warns when exitUntilCollapsed is asked of a bar with no row to collapse', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    // @ts-expect-error rejected statically; the warning covers JS consumers.
    render(<AppBar title="Inbox" scrollBehavior="exitUntilCollapsed" />)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('collapse'))
    warn.mockRestore()
  })

  it('does not warn for any valid variant combination', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <div>
        <AppBar title="A" />
        <AppBar title="B" subtitle="b" titleAlignment="center" />
        <AppBar title="C" size="medium" />
        <AppBar title="D" size="medium" flexible subtitle="d" />
        <AppBar title="E" size="large" scrollBehavior="exitUntilCollapsed" />
        <AppBar title="F" size="large" flexible subtitle="f" titleAlignment="center" />
      </div>,
    )

    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
