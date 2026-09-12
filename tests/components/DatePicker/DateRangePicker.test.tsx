// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, vi } from 'vitest'
import { DateRangePicker } from '../../../src/components/DatePicker'
import { installDatePickerPolyfills } from './date-picker-polyfill'

beforeAll(installDatePickerPolyfills)
afterEach(() => {
  cleanup()
  document.querySelectorAll('.m3e-date-picker__popover').forEach((node) => node.remove())
  vi.restoreAllMocks()
})

describe('DateRangePicker', () => {
  it('selects an ordered range, paints its interior, then closes and restores focus', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DateRangePicker label="Trip" today="2026-09-12" onValueChange={onValueChange} />)
    const trigger = screen.getByRole('textbox', { name: 'Trip' })
    await user.click(trigger)
    await user.click(await screen.findByRole('button', { name: /September 12, 2026/ }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-09-12', end: '' })
    await user.click(screen.getByRole('button', { name: /September 15, 2026/ }))
    expect(onValueChange).toHaveBeenLastCalledWith({ start: '2026-09-12', end: '2026-09-15' })
    expect(document.activeElement).toBe(trigger)
  })

  it('virtualizes adjacent months in a continuous vertical range list', async () => {
    const user = userEvent.setup()
    render(<DateRangePicker label="Trip" today="2026-09-12" />)
    await user.click(screen.getByRole('textbox', { name: 'Trip' }))
    const grid = await screen.findByRole('grid', { name: 'September 2026' })
    const list = grid.querySelector('[data-m3e-range-months="true"]')
    expect(list?.querySelectorAll('[data-m3e-month]')).toHaveLength(3)
    expect(list?.textContent).toContain('August 2026')
    expect(list?.textContent).toContain('September 2026')
    expect(list?.textContent).toContain('October 2026')
    expect(grid.querySelector('.m3e-date-picker__navigation')).toBeNull()
  })

  it('restarts the range when the second selected date precedes the start', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        label="Trip"
        today="2026-09-12"
        defaultValue={{ start: '2026-09-15', end: '' }}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Trip' }))
    await user.click(await screen.findByRole('button', { name: /September 10, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-09-10', end: '' })
    expect(screen.getByRole('textbox', { name: 'Trip' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('keeps modal range changes as a draft and commits both endpoints together', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        label="Trip"
        presentation="modal"
        today="2026-09-12"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Trip' }))
    await user.click(await screen.findByRole('button', { name: /September 12, 2026/ }))
    expect((screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement).disabled).toBe(true)
    await user.click(screen.getByRole('button', { name: /September 15, 2026/ }))
    expect(screen.getByRole('button', { name: /September 12, 2026/ }).parentElement?.dataset.m3eRangeStart).toBe('true')
    expect(screen.getByRole('button', { name: /September 15, 2026/ }).parentElement?.dataset.m3eRangeEnd).toBe('true')
    expect(screen.getByRole('button', { name: /September 13, 2026/ }).parentElement?.dataset.m3eInRange).toBe('true')
    await user.click(screen.getByRole('button', { name: 'OK' }))
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-09-12', end: '2026-09-15' })
  })

  it('lets a valid modal range resolve an aggregate custom error', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DateRangePicker
        label="Trip"
        presentation="modal"
        today="2026-09-12"
        customValidity="Complete the booking"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Trip' }))
    await user.click(await screen.findByRole('button', { name: /September 12, 2026/ }))
    await user.click(screen.getByRole('button', { name: /September 15, 2026/ }))
    const confirm = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement
    expect(confirm.disabled).toBe(false)
    await user.click(confirm)
    expect(onValueChange).toHaveBeenCalledWith({ start: '2026-09-12', end: '2026-09-15' })
  })

  it('treats a partial controlled range as invalid even when optional', async () => {
    const { container } = render(
      <form>
        <DateRangePicker
          label="Trip"
          value={{ start: '2026-09-12', end: '' }}
          onValueChange={() => undefined}
          startName="start"
          endName="end"
        />
      </form>,
    )
    const proxies = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="date"]'))
    await waitFor(() => expect(proxies.some((input) => !input.checkValidity())).toBe(true))
    expect((screen.getByRole('textbox', { name: 'Trip' }) as HTMLInputElement).value).toContain('Sep 12, 2026')
  })

  it('preserves empty input instead of falling back to a stale endpoint', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(
      <DateRangePicker
        label="Trip"
        mode="input"
        onModeChange={() => undefined}
        defaultOpen
        defaultValue={{ start: '2026-09-12', end: '2026-09-15' }}
        startName="start"
        endName="end"
        onValueChange={onValueChange}
      />,
    )
    const start = (await screen.findAllByRole('textbox', { name: 'Start date' }))[0] as HTMLInputElement
    await user.clear(start)
    expect(onValueChange).toHaveBeenCalledWith({ start: '', end: '2026-09-15' })
    const proxies = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="date"]'))
    await waitFor(() => expect(proxies[0].checkValidity()).toBe(false))
  })

  it('rejects end-before-start, bound violations, and disabled endpoints in forms', async () => {
    const cases = [
      { start: '2026-09-20', end: '2026-09-10' },
      { start: '2026-08-31', end: '2026-09-10' },
      { start: '2026-09-10', end: '2026-09-12' },
    ]
    for (const value of cases) {
      const { container, unmount } = render(
        <DateRangePicker
          label="Trip"
          value={value}
          onValueChange={() => undefined}
          min="2026-09-01"
          max="2026-09-30"
          disabledDates={['2026-09-12']}
          startName="start"
          endName="end"
        />,
      )
      const proxies = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="date"]'))
      await waitFor(() => expect(proxies.some((input) => !input.checkValidity())).toBe(true))
      unmount()
    }
  })

  it('resets uncontrolled endpoints and respects canceled reset', async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <DateRangePicker
          label="Trip"
          defaultValue={{ start: '2026-09-12', end: '2026-09-15' }}
          startName="start"
          endName="end"
        />
      </form>,
    )
    const form = container.querySelector('form') as HTMLFormElement
    const proxies = Array.from(container.querySelectorAll<HTMLInputElement>('input[type="date"]'))
    form.reset()
    await Promise.resolve()
    expect(proxies.map((input) => input.value)).toEqual(['2026-09-12', '2026-09-15'])
  })
})
