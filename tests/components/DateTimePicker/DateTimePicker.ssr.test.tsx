// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { DateTimePicker } from '../../../src/components/DateTimePicker'

describe('DateTimePicker server rendering', () => {
  it('renders deterministic civil values with no injected styles', () => {
    const tree = (
      <DateTimePicker label="Appointment" value="2026-06-20T09:30" onValueChange={() => {}} />
    )
    const first = renderToString(tree)

    expect(first).toBe(renderToString(tree))
    expect(first).toContain('class="m3e-date-time-picker"')
    expect(first).toContain('value="2026-06-20T09:30"')
    expect(first).not.toContain('<style')
  })

  it('hydrates the closed composition without a recoverable error', async () => {
    const tree = (
      <DateTimePicker label="Appointment" value="2026-06-20T09:30" onValueChange={() => {}} />
    )
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.append(container)
    const errors: unknown[] = []
    const root = hydrateRoot(container, tree, { onRecoverableError: (error) => errors.push(error) })

    await act(async () => {})
    expect(errors).toEqual([])
    await act(async () => root.unmount())
    container.remove()
  })
})
