// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { AppBar } from '../../../src/components/AppBar'

describe('AppBar server rendering', () => {
  it('renders deterministic markup with no injected style tags', () => {
    const render = () => renderToString(<AppBar title="Inbox" scrollBehavior="pinned" />)
    const first = render()

    expect(first).toBe(render())
    expect(first).toContain('class="m3e-app-bar"')
    expect(first).not.toContain('<style')
  })

  it('always serialises the resting scroll state, whatever the scroll position will be', () => {
    // The scroll coupling is a client measurement; the server has no scroll
    // position, so the resting state (not scrolled, fraction 0) is the only
    // deterministic output.
    const html = renderToString(
      <AppBar size="large" title="Inbox" scrollBehavior="exitUntilCollapsed" />,
    )

    expect(html).not.toContain('data-m3e-scrolled')
    expect(html).not.toContain('data-m3e-collapsed=')
    expect(html).not.toContain('--m3e-app-bar-collapsed-fraction')
  })

  it('serialises the two-row anatomy with the collapsed copy already hidden', () => {
    const html = renderToString(<AppBar size="medium" title="Inbox" />)

    expect(html).toContain('m3e-app-bar__expanded-row')
    expect(html).toContain('aria-hidden="true"')
  })

  it('hydrates a small pinned bar with zero markup delta', async () => {
    const tree = (
      <AppBar title="Inbox" scrollBehavior="pinned" actions={<button type="button">Search</button>} />
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

  it('hydrates a large flexible collapsing bar with zero markup delta', async () => {
    const tree = (
      <AppBar
        size="large"
        flexible
        title="Inbox"
        subtitle="All accounts"
        scrollBehavior="exitUntilCollapsed"
      />
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
    expect(container.innerHTML).toBe(serverHtml)

    await act(async () => root.unmount())
    container.remove()
  })
})
