// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { Divider } from '../../../src/components/Divider'

afterEach(cleanup)

describe('Divider accessibility', () => {
  it('is a separator by default, because a Material divider groups content', () => {
    render(<Divider />)
    expect(screen.getByRole('separator')).not.toBeNull()
  })

  it('relies on the implicit role of hr rather than restating it', () => {
    render(<Divider data-testid="divider" />)
    expect(screen.getByTestId('divider').hasAttribute('role')).toBe(false)
  })

  it('states the separator role on elements that have no implicit one', () => {
    render(
      <>
        <Divider as="div" data-testid="div" />
        <ul>
          <Divider as="li" data-testid="li" />
        </ul>
      </>,
    )

    expect(screen.getByTestId('div').getAttribute('role')).toBe('separator')
    expect(screen.getByTestId('li').getAttribute('role')).toBe('separator')
  })

  it('exposes a vertical separator orientation', () => {
    render(<Divider orientation="vertical" />)
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical')
  })

  it('omits aria-orientation when horizontal, which is the role default', () => {
    render(<Divider data-testid="divider" />)
    expect(screen.getByTestId('divider').hasAttribute('aria-orientation')).toBe(false)
  })

  it('removes a decorative divider from the accessibility tree', () => {
    render(<Divider decorative />)
    expect(screen.queryByRole('separator')).toBeNull()
  })

  it('strips the implicit listitem role from a decorative li', () => {
    render(
      <ul>
        <li>Item</li>
        <Divider as="li" decorative data-testid="divider" />
      </ul>,
    )

    expect(screen.getByTestId('divider').getAttribute('role')).toBe('none')
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('adds no role to a decorative div, which has no implicit semantics to remove', () => {
    render(<Divider as="div" decorative data-testid="divider" />)
    expect(screen.getByTestId('divider').hasAttribute('role')).toBe(false)
  })

  it('carries no orientation on a decorative divider, which exposes no role to qualify', () => {
    render(<Divider decorative orientation="vertical" data-testid="divider" />)
    expect(screen.getByTestId('divider').hasAttribute('aria-orientation')).toBe(false)
  })

  it('is not focusable and exposes no keyboard model, matching the source', () => {
    render(<Divider data-testid="divider" />)
    expect(screen.getByTestId('divider').hasAttribute('tabindex')).toBe(false)
  })

  it('accepts an accessible name when a separator labels a group', () => {
    render(<Divider aria-label="End of results" />)
    expect(screen.getByRole('separator', { name: 'End of results' })).not.toBeNull()
  })

  it('keeps its semantics inside an RTL scope', () => {
    render(
      <div dir="rtl">
        <Divider orientation="vertical" />
      </div>,
    )
    expect(screen.getByRole('separator').getAttribute('aria-orientation')).toBe('vertical')
  })
})
