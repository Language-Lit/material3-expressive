// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { DateTimePicker } from '../../../src/components/DateTimePicker'

afterEach(cleanup)

describe('DateTimePicker accessibility', () => {
  it('names the group and gives each visible field a distinct label', () => {
    render(<DateTimePicker label="Appointment" dateLabel="Start date" timeLabel="Start time" />)

    expect(screen.getByRole('group', { name: 'Appointment' })).not.toBeNull()
    expect(screen.getByRole('textbox', { name: 'Start date' })).not.toBeNull()
    expect(screen.getByRole('textbox', { name: 'Start time' })).not.toBeNull()
  })

  it('uses native required and disabled state on both validity controls', () => {
    const { rerender } = render(<DateTimePicker label="Appointment" required />)
    const dateControl = document.querySelector(
      '.m3e-date-picker__form-control',
    ) as HTMLInputElement
    const timeControl = screen.getByRole('textbox', { name: 'Time' }) as HTMLInputElement

    expect(dateControl.required).toBe(true)
    expect(timeControl.required).toBe(true)
    expect(dateControl.checkValidity()).toBe(false)
    expect(timeControl.checkValidity()).toBe(false)

    rerender(<DateTimePicker label="Appointment" disabled />)
    expect(dateControl.disabled).toBe(true)
    expect(timeControl.disabled).toBe(true)
  })
})
