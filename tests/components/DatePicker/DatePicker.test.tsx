// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createRef } from 'react'
import { afterEach, beforeAll, vi } from 'vitest'
import { DatePicker } from '../../../src/components/DatePicker'
import { installDatePickerPolyfills } from './date-picker-polyfill'

beforeAll(installDatePickerPolyfills)
afterEach(() => {
  cleanup()
  document.querySelectorAll('.m3e-date-picker__popover').forEach((node) => node.remove())
  vi.restoreAllMocks()
})

describe('DatePicker', () => {
  it('opens a docked calendar from its labelled field and commits an ISO civil date', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<DatePicker label="Birthday" today="2026-09-12" onValueChange={onValueChange} />)
    const trigger = screen.getByRole('textbox', { name: 'Birthday' })
    await user.click(trigger)
    const grid = await screen.findByRole('grid', { name: 'September 2026' })
    expect(grid).not.toBeNull()
    await user.click(screen.getByRole('button', { name: /September 15, 2026/ }))
    expect(onValueChange).toHaveBeenCalledWith('2026-09-15')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps unavailable dates focusable for discovery but prevents selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker
        label="Date"
        today="2026-09-12"
        disabledDates={['2026-09-13']}
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Date' }))
    const unavailable = await screen.findByRole('button', { name: /September 13, 2026/ })
    expect(unavailable.getAttribute('aria-disabled')).toBe('true')
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: /September 12, 2026/ })))
    act(() => unavailable.focus())
    await user.keyboard('{Enter}')
    expect(onValueChange).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(unavailable)
  })

  it('implements roving calendar keys including week, month, year, and RTL movement', async () => {
    const user = userEvent.setup()
    render(<DatePicker label="Date" today="2026-09-12" defaultOpen />)
    const focused = await screen.findByRole('button', { name: /September 12, 2026/ })
    await waitFor(() => expect(document.activeElement).toBe(focused))
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /September 13, 2026/ }))
    await user.keyboard('{ArrowDown}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /September 20, 2026/ }))
    await user.keyboard('{Home}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /September 20, 2026/ }))
    await user.keyboard('{PageDown}')
    await screen.findByRole('grid', { name: 'October 2026' })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /October 20, 2026/ }))
    await user.keyboard('{Shift>}{PageDown}{/Shift}')
    await screen.findByRole('grid', { name: 'October 2027' })

    cleanup()
    render(<DatePicker label="RTL" today="2026-09-12" defaultOpen dir="rtl" />)
    const rtlFocused = await screen.findByRole('button', { name: /September 12, 2026/ })
    await waitFor(() => expect(document.activeElement).toBe(rtlFocused))
    await user.keyboard('{ArrowLeft}')
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /September 13, 2026/ }))
  })

  it('clamps roving focus when bounds change without searching disabled dates', async () => {
    const { rerender } = render(
      <DatePicker label="Date" today="2026-09-12" defaultOpen disabledDates={['2026-09-20']} />,
    )
    await screen.findByRole('grid', { name: 'September 2026' })
    rerender(
      <DatePicker
        label="Date"
        today="2026-09-12"
        defaultOpen
        min="2026-09-20"
        max="2026-09-20"
        disabledDates={['2026-09-20']}
      />,
    )
    await waitFor(() => {
      const only = screen.getByRole('button', { name: /September 20, 2026/ })
      expect(only.tabIndex).toBe(0)
    })
  })

  it('clears stale submitted state for partial docked text and owns native validity', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    const { container } = render(
      <form>
        <DatePicker
          label="Date"
          mode="input"
          defaultOpen
          defaultValue="2026-09-12"
          name="date"
          onValueChange={onValueChange}
        />
      </form>,
    )
    const input = (await screen.findAllByRole('textbox', { name: 'Date' })).find((node) => !(node as HTMLInputElement).readOnly) as HTMLInputElement
    await user.clear(input)
    await user.type(input, '09/1')
    expect(onValueChange).toHaveBeenCalledWith('')
    const proxy = container.querySelector('input[type="date"]') as HTMLInputElement
    await waitFor(() => expect(proxy.checkValidity()).toBe(false))
    expect(proxy.value).toBe('')
  })

  it('rejects invalid controlled values and invalid bound configuration without crashing', async () => {
    const { container } = render(
      <DatePicker
        label="Date"
        value="not-a-date"
        onValueChange={() => undefined}
        min="2027-01-01"
        max="2026-01-01"
        name="date"
      />,
    )
    expect((screen.getByRole('textbox', { name: 'Date' }) as HTMLInputElement).value).toBe('not-a-date')
    const proxy = container.querySelector('input[type="date"]') as HTMLInputElement
    await waitFor(() => expect(proxy.checkValidity()).toBe(false))
    expect(proxy.value).toBe('')
  })

  it('keeps modal edits as a draft until confirmation and discards cancellation', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker
        label="Travel date"
        presentation="modal"
        today="2026-09-12"
        defaultValue="2026-09-12"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Travel date' }))
    await user.click(await screen.findByRole('button', { name: /September 15, 2026/ }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect((screen.getByRole('textbox', { name: 'Travel date' }) as HTMLInputElement).value).toBe('Sep 12, 2026')

    await user.click(screen.getByRole('textbox', { name: 'Travel date' }))
    await user.click(await screen.findByRole('button', { name: /September 15, 2026/ }))
    await user.click(screen.getByRole('button', { name: 'OK' }))
    expect(onValueChange).toHaveBeenCalledWith('2026-09-15')
  })

  it('allows a locally valid modal draft to resolve an aggregate custom error', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker
        label="Date"
        presentation="modal"
        today="2026-09-12"
        customValidity="Select a date and time"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Date' }))
    await user.click(await screen.findByRole('button', { name: /September 15, 2026/ }))
    const confirm = screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement
    expect(confirm.disabled).toBe(false)
    await user.click(confirm)
    expect(onValueChange).toHaveBeenCalledWith('2026-09-15')
  })

  it('marks out-of-bounds days unavailable to pointer selection', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <DatePicker
        label="Date"
        today="2026-09-12"
        min="2026-09-18"
        max="2026-09-22"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Date' }))
    const beforeMin = await screen.findByRole('button', { name: /September 15, 2026/ })
    expect(beforeMin.getAttribute('aria-disabled')).toBe('true')
    await user.click(beforeMin)
    expect(onValueChange).not.toHaveBeenCalled()
  })

  it('participates in required/min/max validation, reset, external forms, and refs', async () => {
    const ref = createRef<HTMLInputElement>()
    const { container } = render(
      <>
        <form id="booking" />
        <DatePicker
          ref={ref}
          label="Date"
          form="booking"
          name="date"
          required
          min="2026-09-01"
          max="2026-09-30"
          defaultValue="2026-09-12"
        />
      </>,
    )
    expect(ref.current).toBe(screen.getByRole('textbox', { name: 'Date' }))
    expect(ref.current?.form?.id).toBe('booking')
    const proxy = container.querySelector('input[type="date"]') as HTMLInputElement
    expect(proxy.form?.id).toBe('booking')
    expect(proxy.required).toBe(true)
    expect(proxy.min).toBe('2026-09-01')
    ;(document.getElementById('booking') as HTMLFormElement).reset()
    await waitFor(() => expect(proxy.value).toBe('2026-09-12'))
  })

  it('does not apply a canceled form reset', async () => {
    const { container } = render(
      <form onReset={(event) => event.preventDefault()}>
        <DatePicker label="Date" name="date" defaultValue="2026-09-12" />
      </form>,
    )
    const form = container.querySelector('form') as HTMLFormElement
    const proxy = container.querySelector('input[type="date"]') as HTMLInputElement
    fireEvent.reset(form)
    await Promise.resolve()
    expect(proxy.value).toBe('2026-09-12')
  })

  it('closes and blocks selection when disabled while open', async () => {
    const { rerender } = render(<DatePicker label="Date" today="2026-09-12" defaultOpen />)
    await screen.findByRole('grid', { name: 'September 2026' })
    rerender(<DatePicker label="Date" today="2026-09-12" defaultOpen disabled />)
    expect(screen.getByRole('textbox', { name: 'Date' }).getAttribute('aria-expanded')).toBe('false')
  })
})
