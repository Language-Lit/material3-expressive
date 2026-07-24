// @vitest-environment jsdom

import { createRef } from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { AppBar } from '../../../src/components/AppBar'

afterEach(cleanup)

describe('AppBar', () => {
  it('renders a header element with the small single-row anatomy by default', () => {
    render(<AppBar data-testid="bar" title="Inbox" />)
    const bar = screen.getByTestId('bar')

    expect(bar.tagName).toBe('HEADER')
    expect(bar.getAttribute('data-m3e-size')).toBe('small')
    expect(bar.className).toBe('m3e-app-bar')
    expect(bar.querySelectorAll('.m3e-app-bar__row')).toHaveLength(1)
    expect(bar.querySelector('.m3e-app-bar__expanded-row')).toBeNull()
  })

  it('renders the two-row anatomy for medium and large bars', () => {
    render(
      <div>
        <AppBar data-testid="medium" size="medium" title="Inbox" />
        <AppBar data-testid="large" size="large" title="Inbox" />
      </div>,
    )

    for (const id of ['medium', 'large']) {
      const bar = screen.getByTestId(id)
      expect(bar.getAttribute('data-m3e-size')).toBe(id)
      expect(bar.querySelector('.m3e-app-bar__row')).not.toBeNull()
      expect(bar.querySelector('.m3e-app-bar__expanded-row')).not.toBeNull()
    }
  })

  it('marks the flexible variant and its subtitle on the element', () => {
    render(
      <AppBar data-testid="bar" size="large" flexible title="Inbox" subtitle="All accounts" />,
    )
    const bar = screen.getByTestId('bar')

    expect(bar.getAttribute('data-m3e-flexible')).toBe('true')
    expect(bar.getAttribute('data-m3e-subtitle')).toBe('true')
  })

  it('renders the title twice on a two-row bar, once per row, as the source does', () => {
    render(<AppBar data-testid="bar" size="medium" title="Inbox" />)
    const titles = screen.getByTestId('bar').querySelectorAll('.m3e-app-bar__title')

    expect(titles).toHaveLength(2)
    expect(titles[0]?.textContent).toBe('Inbox')
    expect(titles[1]?.textContent).toBe('Inbox')
  })

  it('renders the title once on a small bar', () => {
    render(<AppBar data-testid="bar" title="Inbox" />)
    expect(screen.getByTestId('bar').querySelectorAll('.m3e-app-bar__title')).toHaveLength(1)
  })

  it('renders the subtitle in both rows of a flexible bar', () => {
    render(
      <AppBar data-testid="bar" size="medium" flexible title="Inbox" subtitle="All accounts" />,
    )
    expect(screen.getByTestId('bar').querySelectorAll('.m3e-app-bar__subtitle')).toHaveLength(2)
  })

  it('places navigation and action slots around the title group', () => {
    render(
      <AppBar
        data-testid="bar"
        title="Inbox"
        navigationIcon={<button type="button">Menu</button>}
        actions={<button type="button">Search</button>}
      />,
    )
    const row = screen.getByTestId('bar').querySelector('.m3e-app-bar__row')
    const children = [...(row?.children ?? [])].map((child) => child.className)

    expect(children).toEqual([
      'm3e-app-bar__navigation',
      'm3e-app-bar__title-group',
      'm3e-app-bar__actions',
    ])
  })

  it('omits the slot wrappers when the slots are empty', () => {
    render(<AppBar data-testid="bar" title="Inbox" />)
    const bar = screen.getByTestId('bar')

    expect(bar.querySelector('.m3e-app-bar__navigation')).toBeNull()
    expect(bar.querySelector('.m3e-app-bar__actions')).toBeNull()
  })

  it('keeps the title group first in the row when there is no navigation icon', () => {
    // The stylesheet's :first-child inset rule depends on this: the source
    // insets an icon-less title to 16px from the edge.
    render(<AppBar data-testid="bar" title="Inbox" />)
    const row = screen.getByTestId('bar').querySelector('.m3e-app-bar__row')

    expect(row?.firstElementChild?.className).toBe('m3e-app-bar__title-group')
  })

  it('exposes the title alignment for styling', () => {
    render(<AppBar data-testid="bar" title="Inbox" titleAlignment="center" />)
    expect(screen.getByTestId('bar').getAttribute('data-m3e-title-alignment')).toBe('center')
  })

  it('exposes the scroll behavior for styling and defaults to none', () => {
    const { rerender } = render(<AppBar data-testid="bar" title="Inbox" />)
    expect(screen.getByTestId('bar').getAttribute('data-m3e-scroll-behavior')).toBe('none')

    rerender(<AppBar data-testid="bar" title="Inbox" scrollBehavior="pinned" />)
    expect(screen.getByTestId('bar').getAttribute('data-m3e-scroll-behavior')).toBe('pinned')
  })

  it('merges a consumer class after its own rather than replacing it', () => {
    render(<AppBar data-testid="bar" title="Inbox" className="custom" />)
    expect(screen.getByTestId('bar').className).toBe('m3e-app-bar custom')
  })

  it('forwards a ref to the header element', () => {
    const ref = createRef<HTMLElement>()
    render(<AppBar ref={ref} data-testid="bar" title="Inbox" />)
    expect(ref.current).toBe(screen.getByTestId('bar'))
  })

  it('passes native attributes through to the header', () => {
    render(<AppBar data-testid="bar" title="Inbox" id="page-bar" lang="en" />)
    const bar = screen.getByTestId('bar')

    expect(bar.id).toBe('page-bar')
    expect(bar.getAttribute('lang')).toBe('en')
  })

  it('accepts arbitrary nodes in the title slot rather than coercing a heading', () => {
    render(
      <AppBar
        data-testid="bar"
        title={<h1 data-testid="heading">Inbox</h1>}
      />,
    )
    expect(screen.getByTestId('heading').tagName).toBe('H1')
  })
})
