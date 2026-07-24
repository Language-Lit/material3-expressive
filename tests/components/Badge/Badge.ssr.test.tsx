// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { Badge, BadgeAnchor } from '../../../src/components/Badge'

describe('Badge server rendering', () => {
  it('renders deterministic markup with no injected style tags', () => {
    const render = () => renderToString(<Badge>3</Badge>)
    const first = render()

    expect(first).toBe(render())
    expect(first).toContain('data-m3e-variant="large"')
    expect(first).not.toContain('<style')
  })

  it('serialises the small variant as an empty span', () => {
    expect(renderToString(<Badge />)).toBe(
      '<span class="m3e-badge" data-m3e-variant="small"></span>',
    )
  })

  it('serialises the named badge as an image with its label', () => {
    const html = renderToString(<Badge label="3 unread">3</Badge>)

    expect(html).toContain('role="img"')
    expect(html).toContain('aria-label="3 unread"')
  })

  it('omits the badge slot entirely when the anchor has no badge', () => {
    const html = renderToString(<BadgeAnchor>icon</BadgeAnchor>)

    expect(html).toContain('class="m3e-badge-anchor"')
    expect(html).not.toContain('m3e-badge-anchor__badge')
  })

  it('hydrates with zero markup delta — the component is a pure function of props', async () => {
    const tree = (
      <BadgeAnchor badge={<Badge label="3 unread">3</Badge>}>
        <span>icon</span>
      </BadgeAnchor>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.append(container)
    const serverHtml = container.innerHTML

    const recoverableErrors: unknown[] = []
    const root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    })

    await act(async () => {})
    expect(recoverableErrors).toEqual([])
    expect(document.querySelector('style')).toBeNull()
    expect(container.innerHTML).toBe(serverHtml)

    await act(async () => root.unmount())
    container.remove()
  })
})
