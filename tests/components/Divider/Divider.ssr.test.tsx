// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { Divider } from '../../../src/components/Divider'

describe('Divider server rendering', () => {
  it('renders deterministic markup with no injected style tags', () => {
    const render = () => renderToString(<Divider />)
    const first = render()

    expect(first).toBe(render())
    expect(first).toContain('data-m3e-orientation="horizontal"')
    expect(first).toContain('class="m3e-divider"')
    expect(first).not.toContain('<style')
  })

  it('serialises hr as a void element carrying no role of its own', () => {
    const html = renderToString(<Divider />)

    expect(html).toBe('<hr class="m3e-divider" data-m3e-orientation="horizontal"/>')
  })

  it('serialises the vertical separator orientation', () => {
    const html = renderToString(<Divider orientation="vertical" />)

    expect(html).toContain('data-m3e-orientation="vertical"')
    expect(html).toContain('aria-orientation="vertical"')
  })

  it('serialises the decorative variant without separator semantics', () => {
    const html = renderToString(<Divider decorative />)

    expect(html).toContain('role="none"')
    expect(html).not.toContain('aria-orientation')
  })

  it('hydrates with zero markup delta — the component is a pure function of props', async () => {
    const tree = <Divider />
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

  it('hydrates a vertical li divider inside a list with zero markup delta', async () => {
    const tree = (
      <ul>
        <li>First</li>
        <Divider as="li" orientation="vertical" />
      </ul>
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
