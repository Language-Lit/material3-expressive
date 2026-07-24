// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { beforeAll } from 'vitest'
import { BottomSheet } from '../../../src/components/BottomSheet'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)

const NAME = { 'aria-label': 'Details' } as const

describe('BottomSheet server rendering', () => {
  it('renders deterministic markup with no injected style tags', () => {
    const render = () => renderToString(<BottomSheet {...NAME} id="sheet" defaultValue="expanded" />)
    const first = render()

    expect(first).toBe(render())
    expect(first).toContain('class="m3e-bottom-sheet"')
    expect(first).not.toContain('<style')
  })

  it('always paints a modal sheet closed on the server, whatever its value says', () => {
    // A true modal only exists once `showModal()` runs on the client, so the
    // `open` attribute must never be serialised — a plain `open` would be an
    // indistinguishable non-modal reveal.
    const html = renderToString(<BottomSheet {...NAME} id="sheet" defaultValue="expanded" />)

    expect(html).toContain('<dialog')
    expect(html).not.toMatch(/<dialog[^>]*\sopen/)
    expect(html).toContain('data-m3e-state="expanded"')
  })

  it('serialises a standard sheet as a docked region, which needs no client step', () => {
    const html = renderToString(
      <BottomSheet {...NAME} id="sheet" variant="standard" defaultValue="partiallyExpanded" />,
    )

    expect(html).toContain('role="region"')
    expect(html).toContain('data-m3e-variant="standard"')
    expect(html).toContain('data-m3e-state="partiallyExpanded"')
  })

  it('serialises the drag handle as a real button so it works before hydration', () => {
    const html = renderToString(
      <BottomSheet {...NAME} id="sheet" variant="standard" defaultValue="partiallyExpanded" />,
    )

    expect(html).toContain('<button')
    expect(html).toContain('type="button"')
    expect(html).toContain('aria-label="Expand bottom sheet"')
  })

  it('hydrates a standard sheet with zero markup delta', async () => {
    const tree = (
      <BottomSheet {...NAME} id="sheet" variant="standard" defaultValue="partiallyExpanded">
        <p>Docked body</p>
      </BottomSheet>
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

  it('hydrates a modal sheet and opens it imperatively, not through markup', async () => {
    const tree = (
      <BottomSheet {...NAME} id="sheet" defaultValue="expanded">
        <p>Sheet body</p>
      </BottomSheet>
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.append(container)

    expect(container.querySelector('dialog')?.hasAttribute('open')).toBe(false)

    const recoverableErrors: unknown[] = []
    const root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    })

    await act(async () => {})
    expect(recoverableErrors).toEqual([])
    // The open state arrives from the effect, not from a server/client
    // markup difference that would have logged a hydration error above.
    expect(container.querySelector('dialog')?.hasAttribute('open')).toBe(true)

    await act(async () => root.unmount())
    container.remove()
  })
})
