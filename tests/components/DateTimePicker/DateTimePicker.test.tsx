// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeAll, vi } from 'vitest'
import { DateTimePicker } from '../../../src/components/DateTimePicker'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function timeField(): HTMLInputElement {
  return screen.getByRole('textbox', { name: 'Time' }) as HTMLInputElement
}

function submittedField(): HTMLInputElement {
  return document.querySelector('.m3e-date-time-picker input[type="hidden"]') as HTMLInputElement
}

async function flushDraft() {
  await act(async () => {})
}

describe('DateTimePicker', () => {
  it('keeps a partial initial value editable without fabricating a submitted value', () => {
    render(
      <form aria-label="Appointment form">
        <DateTimePicker label="Appointment" defaultValue="2026-06-20T0" />
      </form>,
    )

    expect(timeField().value).toBe('0')
    expect(timeField().checkValidity()).toBe(false)
    expect(submittedField().value).toBe('')
  })

  it('clears the aggregate submission while a date text edit is partial', async () => {
    const onValueChange = vi.fn()
    render(
      <form aria-label="Appointment form">
        <DateTimePicker
          label="Appointment"
          defaultValue="2026-06-20T09:30"
          defaultDateMode="input"
          presentation="docked"
          onValueChange={onValueChange}
        />
      </form>,
    )
    fireEvent.click(screen.getByRole('textbox', { name: 'Date' }))
    const popupDateField = document.querySelector(
      '.m3e-date-picker__panel .m3e-text-field__input',
    ) as HTMLInputElement

    fireEvent.change(popupDateField, { target: { value: '06/' } })
    await flushDraft()

    expect(popupDateField.value).toBe('06/')
    expect(onValueChange).toHaveBeenLastCalledWith('')
    expect(submittedField().value).toBe('')
    expect((popupDateField.closest('form') ?? document.querySelector('form'))?.checkValidity()).toBe(false)
  })

  it('enforces full civil bounds and boundary-day time constraints', async () => {
    const onValueChange = vi.fn()
    render(
      <form aria-label="Appointment form">
        <DateTimePicker
          label="Appointment"
          defaultValue="2026-06-21T09:00"
          min="2026-06-20T10:00"
          max="2026-06-22T16:00"
          defaultDateMode="input"
          presentation="docked"
          onValueChange={onValueChange}
        />
      </form>,
    )

    expect(timeField().checkValidity()).toBe(true)

    fireEvent.click(screen.getByRole('textbox', { name: 'Date' }))
    const popupDateField = document.querySelector(
      '.m3e-date-picker__panel .m3e-text-field__input',
    ) as HTMLInputElement
    fireEvent.change(popupDateField, { target: { value: '06/20/2026' } })
    await flushDraft()

    expect(onValueChange).toHaveBeenLastCalledWith('2026-06-20T09:00')
    expect(timeField().checkValidity()).toBe(false)
    expect(submittedField().value).toBe('2026-06-20T09:00')
  })

  it('keeps an incomplete pair invalid after the time field becomes valid', async () => {
    render(
      <form aria-label="Appointment form">
        <DateTimePicker label="Appointment" defaultValue="T9" />
      </form>,
    )

    fireEvent.change(timeField(), { target: { value: '09:00' } })
    await flushDraft()

    expect(timeField().value).toBe('09:00')
    expect(timeField().checkValidity()).toBe(false)
    expect(submittedField().value).toBe('')
  })

  it('lets an empty required modal confirm each locally valid child in sequence', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <form aria-label="Appointment form">
        <DateTimePicker
          label="Appointment"
          defaultDateMode="input"
          hour12={false}
          required
          onValueChange={onValueChange}
        />
      </form>,
    )

    await user.click(screen.getByRole('textbox', { name: 'Date' }))
    const modalDateField = document.querySelector(
      '.m3e-date-picker__dialog .m3e-text-field__input',
    ) as HTMLInputElement
    await user.clear(modalDateField)
    await user.type(modalDateField, '09/18/2026')
    await user.click(screen.getByRole('button', { name: 'OK' }))

    expect((screen.getByRole('textbox', { name: 'Date' }) as HTMLInputElement).value)
      .toBe('Sep 18, 2026')
    expect(submittedField().value).toBe('')
    expect(timeField().checkValidity()).toBe(false)

    await user.click(screen.getByRole('button', { name: 'Open Time' }))
    await user.click(screen.getByRole('radio', { name: '9 hours' }))
    await user.click(screen.getByRole('radio', { name: '30 minutes' }))
    await user.click(screen.getByRole('button', { name: 'OK' }))

    expect(onValueChange).toHaveBeenLastCalledWith('2026-09-18T09:30')
    expect(submittedField().value).toBe('2026-09-18T09:30')
    expect(timeField().checkValidity()).toBe(true)
  })

  it('preserves partial edits across rerenders and accepts a distinct external reset', async () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <DateTimePicker
        label="Appointment"
        value="2026-06-20T09:30"
        onValueChange={onValueChange}
      />,
    )

    fireEvent.input(timeField(), { target: { value: '1' } })
    await flushDraft()
    expect(timeField().value).toBe('1')
    expect(onValueChange).toHaveBeenLastCalledWith('')

    rerender(
      <DateTimePicker
        label="Appointment"
        value="2026-06-20T09:30"
        onValueChange={onValueChange}
        data-rerender="true"
      />,
    )
    expect(timeField().value).toBe('1')

    rerender(
      <DateTimePicker
        label="Appointment"
        value="2027-01-02T14:05"
        onValueChange={onValueChange}
      />,
    )
    await flushDraft()
    expect(timeField().value).toBe('14:05')
    expect(submittedField().value).toBe('2027-01-02T14:05')
  })

  it('submits one combined value through an external form and resets uncancelled state', async () => {
    const onValueChange = vi.fn()
    render(
      <>
        <form id="booking" aria-label="Booking" />
        <DateTimePicker
          label="Appointment"
          defaultValue="2026-06-20T09:30"
          name="startsAt"
          form="booking"
          required
          onValueChange={onValueChange}
        />
      </>,
    )
    const form = screen.getByRole('form', { name: 'Booking' }) as HTMLFormElement

    expect(new FormData(form).get('startsAt')).toBe('2026-06-20T09:30')
    fireEvent.change(timeField(), { target: { value: '10:45' } })
    await flushDraft()
    expect(new FormData(form).get('startsAt')).toBe('2026-06-20T10:45')

    fireEvent.reset(form)
    await flushDraft()
    expect(timeField().value).toBe('09:30')
    expect(new FormData(form).get('startsAt')).toBe('2026-06-20T09:30')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-06-20T09:30')
  })

  it('honors a canceled external form reset', async () => {
    render(
      <>
        <form id="booking" aria-label="Booking" onReset={(event) => event.preventDefault()} />
        <DateTimePicker
          label="Appointment"
          defaultValue="2026-06-20T09:30"
          name="startsAt"
          form="booking"
        />
      </>,
    )
    fireEvent.change(timeField(), { target: { value: '10:45' } })
    await flushDraft()

    fireEvent.reset(screen.getByRole('form', { name: 'Booking' }))
    await flushDraft()
    expect(timeField().value).toBe('10:45')
    expect(submittedField().value).toBe('2026-06-20T10:45')
  })

  it('reports the exact civil string without converting through a time zone', async () => {
    const onValueChange = vi.fn()
    render(
      <DateTimePicker
        label="Appointment"
        defaultValue="2026-12-31T23:30"
        onValueChange={onValueChange}
      />,
    )

    fireEvent.change(timeField(), { target: { value: '23:45' } })
    await flushDraft()
    expect(onValueChange).toHaveBeenLastCalledWith('2026-12-31T23:45')
    expect(submittedField().value).toBe('2026-12-31T23:45')
  })

  it('accepts localized time digits while keeping the aggregate value canonical', async () => {
    const onValueChange = vi.fn()
    render(
      <DateTimePicker
        label="Appointment"
        defaultValue="2026-12-31T09:30"
        locale="ar-EG"
        hour12={false}
        onValueChange={onValueChange}
      />,
    )

    fireEvent.change(timeField(), { target: { value: '١٠:٤٥' } })
    await flushDraft()

    expect(timeField().value).toBe('١٠:٤٥')
    expect(onValueChange).toHaveBeenLastCalledWith('2026-12-31T10:45')
    expect(submittedField().value).toBe('2026-12-31T10:45')
  })
})
