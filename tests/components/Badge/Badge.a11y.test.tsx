// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { Badge, BadgeAnchor } from '../../../src/components/Badge'
import { NavigationBar } from '../../../src/components/NavigationBar'
import { NavigationDrawer } from '../../../src/components/NavigationDrawer'
import { NavigationRail } from '../../../src/components/NavigationRail'
import { Tabs } from '../../../src/components/Tabs'
import { installTabsNativePolyfills } from '../Tabs/tabs-native-polyfill'

installTabsNativePolyfills()
afterEach(cleanup)

const items = [
  { value: 'inbox', label: 'Inbox', icon: <span>in</span>, badge: <Badge label="3 unread">3</Badge> },
  { value: 'sent', label: 'Sent', icon: <span>se</span> },
]

describe('Badge accessibility', () => {
  it('names the badge and prunes the duplicate glyph when a label is given', () => {
    render(<Badge label="3 unread messages">3</Badge>)

    // Resolving by accessible name proves the label is the computed name;
    // `img` prunes descendants, so the visible "3" is not announced again.
    const badge = screen.getByRole('img', { name: '3 unread messages' })
    expect(badge.textContent).toBe('3')
  })

  it('exposes no role at all without a label, matching the unlabelled source badge', () => {
    const { container } = render(<Badge>3</Badge>)
    const badge = container.querySelector('.m3e-badge')

    expect(badge?.hasAttribute('role')).toBe(false)
    expect(badge?.hasAttribute('aria-label')).toBe(false)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('lets an unlabelled dot stay silent rather than announcing an empty image', () => {
    const { container } = render(<Badge />)

    expect(container.querySelector('.m3e-badge')?.hasAttribute('role')).toBe(false)
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('names a dot when the label supplies the meaning it cannot show', () => {
    render(<Badge label="New notifications" />)

    expect(screen.getByRole('img', { name: 'New notifications' })).not.toBeNull()
  })

  it('leaves the anchor itself semantically transparent', () => {
    const { container } = render(<BadgeAnchor badge={<Badge />}>icon</BadgeAnchor>)
    const anchor = container.querySelector('.m3e-badge-anchor')

    expect(anchor?.hasAttribute('role')).toBe(false)
    expect(anchor?.hasAttribute('aria-hidden')).toBe(false)
  })
})

describe('Badge inside the components that anchor one', () => {
  it('escapes the NavigationBar icon slot, whose aria-hidden would silence it', () => {
    render(<NavigationBar items={items} />)

    expect(screen.getByRole('img', { name: '3 unread' })).not.toBeNull()
  })

  it('escapes the NavigationRail icon slot', () => {
    render(<NavigationRail items={items} />)

    expect(screen.getByRole('img', { name: '3 unread' })).not.toBeNull()
  })

  it('keeps the indicator hidden for items that carry no badge', () => {
    const { container } = render(<NavigationBar items={items} />)
    const indicators = container.querySelectorAll('.m3e-navigation-bar__indicator')

    expect(indicators).toHaveLength(2)
    expect(indicators[0]?.hasAttribute('aria-hidden')).toBe(false)
    expect(indicators[1]?.getAttribute('aria-hidden')).toBe('true')
  })

  it('announces a Tabs badge, whose tab-icon slot is also hidden', () => {
    render(
      <Tabs
        items={[
          {
            value: 'all',
            label: 'All',
            icon: <span>ic</span>,
            badge: <Badge label="2 new">2</Badge>,
          },
          { value: 'unread', label: 'Unread' },
        ]}
      />,
    )

    expect(screen.getByRole('img', { name: '2 new' })).not.toBeNull()
  })

  it('anchors a badge to the label when a tab has no icon', () => {
    const { container } = render(
      <Tabs items={[{ value: 'all', label: 'All', badge: <Badge label="2 new">2</Badge> }]} />,
    )

    expect(container.querySelector('.m3e-badge-anchor > .m3e-tabs__tab-label')).not.toBeNull()
  })

  it('renders the drawer badge as end-side content rather than an anchored pill', () => {
    const { container } = render(
      <NavigationDrawer
        variant="permanent"
        items={[{ value: 'inbox', label: 'Inbox', icon: <span>in</span>, badge: '24' }]}
      />,
    )

    expect(container.querySelector('.m3e-navigation-drawer__badge')?.textContent).toBe('24')
    expect(container.querySelector('.m3e-navigation-drawer__item .m3e-badge-anchor')).toBeNull()
  })
})
