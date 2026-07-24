// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach } from 'vitest'
import { Badge, BadgeAnchor } from '../../../src/components/Badge'

afterEach(cleanup)

describe('Badge', () => {
  it('is the small variant when it has no content', () => {
    const { container } = render(<Badge data-testid="badge" />)
    const badge = container.querySelector('.m3e-badge')

    expect(badge?.getAttribute('data-m3e-variant')).toBe('small')
    expect(badge?.textContent).toBe('')
  })

  it('is the large variant as soon as it has content', () => {
    const { container } = render(<Badge>8</Badge>)
    const badge = container.querySelector('.m3e-badge')

    expect(badge?.getAttribute('data-m3e-variant')).toBe('large')
    expect(badge?.textContent).toBe('8')
  })

  it('keeps a zero count large, which a truthiness test would shrink', () => {
    const { container } = render(<Badge>{0}</Badge>)

    expect(container.querySelector('.m3e-badge')?.getAttribute('data-m3e-variant')).toBe('large')
    expect(container.querySelector('.m3e-badge')?.textContent).toBe('0')
  })

  it('carries the maximum four-character label the specification allows', () => {
    const { container } = render(<Badge>999+</Badge>)

    expect(container.querySelector('.m3e-badge')?.textContent).toBe('999+')
    expect(container.querySelector('.m3e-badge')?.getAttribute('data-m3e-variant')).toBe('large')
  })

  it('merges className after the library class and passes native attributes through', () => {
    const { container } = render(<Badge className="count" id="inbox-badge" title="unread" />)
    const badge = container.querySelector('.m3e-badge')

    expect(badge?.getAttribute('class')).toBe('m3e-badge count')
    expect(badge?.id).toBe('inbox-badge')
    expect(badge?.getAttribute('title')).toBe('unread')
  })

  it('forwards its ref to the rendered element', () => {
    const ref = createRef<HTMLSpanElement>()
    render(<Badge ref={ref}>3</Badge>)

    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(ref.current?.className).toBe('m3e-badge')
  })
})

describe('BadgeAnchor', () => {
  it('renders its content and positions the badge as a sibling', () => {
    const { container } = render(
      <BadgeAnchor badge={<Badge>3</Badge>}>
        <span data-testid="icon">icon</span>
      </BadgeAnchor>,
    )
    const anchor = container.querySelector('.m3e-badge-anchor')

    expect(anchor?.querySelector('[data-testid="icon"]')).not.toBeNull()
    expect(anchor?.querySelector('.m3e-badge-anchor__badge .m3e-badge')).not.toBeNull()
  })

  it('renders no badge slot at all when there is no badge', () => {
    const { container } = render(
      <BadgeAnchor>
        <span>icon</span>
      </BadgeAnchor>,
    )

    expect(container.querySelector('.m3e-badge-anchor')).not.toBeNull()
    expect(container.querySelector('.m3e-badge-anchor__badge')).toBeNull()
  })

  it('accepts an arbitrary node as the badge, not only a Badge', () => {
    render(<BadgeAnchor badge={<em>new</em>}>icon</BadgeAnchor>)

    expect(screen.getByText('new').tagName).toBe('EM')
  })

  it('forwards its ref and merges className', () => {
    const ref = createRef<HTMLSpanElement>()
    const { container } = render(
      <BadgeAnchor ref={ref} className="slot" badge={<Badge />}>
        icon
      </BadgeAnchor>,
    )

    expect(ref.current).toBeInstanceOf(HTMLSpanElement)
    expect(container.querySelector('.m3e-badge-anchor')?.getAttribute('class')).toBe(
      'm3e-badge-anchor slot',
    )
  })
})
