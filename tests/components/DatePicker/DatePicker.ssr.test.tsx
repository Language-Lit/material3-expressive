// @vitest-environment jsdom

import { act } from '@testing-library/react'
import { hydrateRoot } from 'react-dom/client'
import { renderToString } from 'react-dom/server'
import { DatePicker, DateRangePicker } from '../../../src/components/DatePicker'
import { installDatePickerPolyfills } from './date-picker-polyfill'

beforeAll(installDatePickerPolyfills)

describe('date picker server rendering', () => {
  it('renders deterministic closed fields and form values without a popup', () => {
    const render = () => renderToString(
      <>
        <DatePicker label="Date" today="2026-09-12" defaultValue="2026-09-15" name="date" />
        <DateRangePicker
          label="Trip"
          today="2026-09-12"
          defaultValue={{ start: '2026-09-15', end: '2026-09-20' }}
          startName="start"
          endName="end"
        />
      </>,
    )
    const first = render()
    expect(first).toBe(render())
    expect(first).toContain('value="2026-09-15"')
    expect(first).not.toContain('role="grid"')
    expect(first).not.toContain('<style')
  })

  it('hydrates without mismatch, then mounts an initially open docked calendar', async () => {
    const tree = <DatePicker label="Date" today="2026-09-12" defaultOpen />
    const container = document.createElement('div')
    container.innerHTML = renderToString(tree)
    document.body.append(container)
    const errors: unknown[] = []
    const root = hydrateRoot(container, tree, { onRecoverableError: (error) => errors.push(error) })
    await act(async () => {})
    expect(errors).toEqual([])
    expect(document.querySelector('[role="grid"]')).not.toBeNull()
    await act(async () => root.unmount())
    document.querySelectorAll('.m3e-date-picker__popover').forEach((node) => node.remove())
    container.remove()
  })
})
