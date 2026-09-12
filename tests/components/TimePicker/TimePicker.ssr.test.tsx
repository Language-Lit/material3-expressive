// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { beforeAll } from 'vitest'
import { TimePicker } from '../../../src/components/TimePicker'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)

describe('TimePicker server rendering', () => {
  it('renders deterministic civil-time markup without a clock or time-zone read', () => {
    const render = () => renderToString(
      <TimePicker label="Start" defaultValue="13:32" locale="ja-JP" />,
    )
    const first = render()
    expect(first).toBe(render())
    expect(first).toContain('value="13:32"')
    expect(first).toContain('data-m3e-presentation="docked"')
    expect(first).not.toContain('<style')
  })

  it('keeps a closed modal out of server markup and hydration unchanged', async () => {
    const tree = (
      <TimePicker
        label="Start"
        presentation="modal"
        defaultValue="13:32"
      />
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.append(container)
    const serverHtml = container.innerHTML
    const errors: unknown[] = []
    const root = hydrateRoot(container, tree, {
      onRecoverableError: (error) => errors.push(error),
    })
    await act(async () => {})
    expect(errors).toEqual([])
    expect(container.innerHTML).toBe(serverHtml)
    expect(container.querySelector('dialog')).toBeNull()
    expect(document.querySelector('style')).toBeNull()
    await act(async () => root.unmount())
    container.remove()
  })
})
