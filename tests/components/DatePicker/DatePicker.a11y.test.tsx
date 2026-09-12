// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, vi } from 'vitest'
import { DatePicker } from '../../../src/components/DatePicker'
import { installDatePickerPolyfills } from './date-picker-polyfill'

beforeAll(installDatePickerPolyfills)
afterEach(cleanup)

describe('DatePicker accessibility', () => {
  it('uses a native labelled field as the popup trigger', () => {
    render(<DatePicker label="Appointment" supportingText="Choose a day" />)
    const trigger = screen.getByRole('textbox', { name: 'Appointment' })
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    const description = trigger.getAttribute('aria-describedby')
    expect(document.getElementById(description ?? '')?.textContent).toBe('Choose a day')
  })

  it('builds a correctly nested grid with full weekday and date names', async () => {
    const user = userEvent.setup()
    render(<DatePicker label="Date" today="2026-09-12" />)
    await user.click(screen.getByRole('textbox', { name: 'Date' }))
    const grid = await screen.findByRole('grid', { name: 'September 2026' })
    expect(grid.querySelectorAll('[role="row"]')).toHaveLength(7)
    expect(screen.getByRole('columnheader', { name: 'Sunday' })).not.toBeNull()
    expect(screen.getByRole('button', { name: 'Saturday, September 12, 2026' }).getAttribute('aria-current')).toBe('date')
    expect(grid.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
  })

  it('marks selected cells and unavailable dates without removing unavailable dates from focus order navigation', async () => {
    const user = userEvent.setup()
    render(
      <DatePicker
        label="Date"
        today="2026-09-12"
        defaultValue="2026-09-15"
        disabledDates={['2026-09-16']}
      />,
    )
    await user.click(screen.getByRole('textbox', { name: 'Date' }))
    const selected = await screen.findByRole('button', { name: /September 15, 2026/ })
    expect(selected.parentElement?.getAttribute('aria-selected')).toBe('true')
    expect(screen.getByRole('button', { name: /September 16, 2026/ }).getAttribute('aria-disabled')).toBe('true')
  })

  it('supports caller-localized control labels', async () => {
    const user = userEvent.setup()
    render(<DatePicker label="日付" locale="ja-JP" labels={{ previousMonth: '前の月' }} today="2026-09-12" />)
    await user.click(screen.getByRole('textbox', { name: '日付' }))
    expect(await screen.findByRole('button', { name: '前の月' })).not.toBeNull()
  })

  it('forwards primary-field accessibility and composes cancelable native handlers', () => {
    const onFocus = vi.fn()
    const onKeyDown = vi.fn((event) => event.preventDefault())
    const { container } = render(
      <>
        <span id="date-name">Protocol date</span>
        <DatePicker
          id="protocol-date"
          className="consumer-root"
          style={{ inlineSize: '20rem' }}
          label="Date"
          aria-labelledby="date-name"
          aria-description="A local calendar date"
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
      </>,
    )
    const field = screen.getByRole('textbox', { name: 'Protocol date' })
    expect(field.id).toBe('protocol-date')
    expect(field.getAttribute('aria-description')).toBe('A local calendar date')
    fireEvent.focus(field)
    fireEvent.keyDown(field, { key: 'ArrowDown' })
    expect(onFocus).toHaveBeenCalledOnce()
    expect(onKeyDown).toHaveBeenCalledOnce()
    expect(field.getAttribute('aria-expanded')).toBe('false')
    const root = container.querySelector('.m3e-date-picker.consumer-root') as HTMLElement
    expect(root.style.inlineSize).toBe('20rem')
    expect(root.hasAttribute('aria-description')).toBe(false)
  })
})
