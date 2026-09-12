// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { afterEach, beforeAll, vi } from 'vitest'
import { TimePicker } from '../../../src/components/TimePicker'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('TimePicker value and form behavior', () => {
  it('autoformats numeric keyboard entry and reports valid and cleared civil values', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<TimePicker label="Start time" onValueChange={onValueChange} />)
    const field = screen.getByRole('textbox', { name: 'Start time' }) as HTMLInputElement

    await user.type(field, '1432')
    expect(field.value).toBe('14:32')
    expect(onValueChange).toHaveBeenLastCalledWith('14:32')

    await user.clear(field)
    expect(field.value).toBe('')
    expect(onValueChange).toHaveBeenLastCalledWith('')
  })

  it('parses locale digits at the field boundary and emits ASCII civil values', () => {
    const onValueChange = vi.fn()
    const { unmount } = render(
      <TimePicker
        label="Arabic time"
        locale="ar-EG"
        defaultValue="14:32"
        onValueChange={onValueChange}
      />,
    )
    const field = screen.getByRole('textbox', { name: 'Arabic time' }) as HTMLInputElement
    expect(field.value).toBe('١٤:٣٢')
    fireEvent.change(field, { target: { value: '٠٩:٠٥' } })
    expect(onValueChange).toHaveBeenLastCalledWith('09:05')

    unmount()
    render(
      <TimePicker
        label="Arabic panel"
        locale="ar-EG"
        defaultValue="14:32"
        defaultMode="input"
        onValueChange={onValueChange}
      />,
    )
    const hour = screen.getByRole('textbox', { name: 'Hour' }) as HTMLInputElement
    const minute = screen.getByRole('textbox', { name: 'Minute' }) as HTMLInputElement
    expect(hour.value).toBe('٠٢')
    expect(minute.value).toBe('٣٢')
    fireEvent.change(hour, { target: { value: '٠٣' } })
    expect(onValueChange).toHaveBeenLastCalledWith('15:32')
  })

  it('uses the visible named field for required, format, bounds, and custom validity', () => {
    const { rerender } = render(
      <form>
        <TimePicker
          label="Meeting time"
          name="meeting"
          defaultValue="08:30"
          min="09:00"
          max="17:00"
          required
        />
      </form>,
    )
    const field = screen.getByRole('textbox', { name: 'Meeting time' }) as HTMLInputElement
    const submitted = document.querySelector('input[type="hidden"][name="meeting"]') as HTMLInputElement
    expect(field.name).toBe('')
    expect(submitted.value).toBe('')
    expect(field.checkValidity()).toBe(false)
    expect(field.validationMessage).toContain('09:00')

    rerender(
      <form>
        <TimePicker
          label="Meeting time"
          name="meeting"
          value="10:30"
          onValueChange={() => undefined}
          min="09:00"
          max="17:00"
          required
          customValidity="The date-time interval is incomplete."
        />
      </form>,
    )
    expect(field.checkValidity()).toBe(false)
    expect(field.validationMessage).toBe('The date-time interval is incomplete.')
  })

  it('emits and submits empty for a controlled partial draft without erasing its text', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    function Harness() {
      const [value, setValue] = useState('14:32')
      return (
        <form>
          <TimePicker
            label="Controlled draft"
            name="time"
            value={value}
            onValueChange={(next) => {
              onValueChange(next)
              setValue(next)
            }}
          />
        </form>
      )
    }
    render(<Harness />)
    const field = screen.getByRole('textbox', { name: 'Controlled draft' }) as HTMLInputElement
    await user.clear(field)
    await user.type(field, '1')
    expect(field.value).toBe('1')
    expect(onValueChange).toHaveBeenCalledWith('')
    const form = field.form as HTMLFormElement
    expect(new FormData(form).get('time')).toBe('')
  })

  it('rejects reversed bounds instead of silently treating them as overnight', () => {
    render(
      <TimePicker label="Quiet hours" defaultValue="23:30" min="22:00" max="06:00" />,
    )
    const field = screen.getByRole('textbox', { name: 'Quiet hours' }) as HTMLInputElement
    expect(field.checkValidity()).toBe(false)
    expect(field.validationMessage).toContain('must not be later')
    expect(screen.getByRole('alert').textContent).toContain('outside')
  })

  it('restores its default on an uncancelled form reset and preserves state when reset is cancelled', async () => {
    const user = userEvent.setup()
    render(
      <form onReset={(event) => event.currentTarget.dataset.cancel === 'true' && event.preventDefault()}>
        <TimePicker label="Alarm" defaultValue="09:15" />
        <button type="reset">Reset</button>
      </form>,
    )
    const form = screen.getByRole('button', { name: 'Reset' }).closest('form') as HTMLFormElement
    const field = screen.getByRole('textbox', { name: 'Alarm' }) as HTMLInputElement
    await user.clear(field)
    await user.type(field, '1045')
    expect(field.value).toBe('10:45')

    form.dataset.cancel = 'true'
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await act(async () => {})
    expect(field.value).toBe('10:45')

    form.dataset.cancel = 'false'
    await user.click(screen.getByRole('button', { name: 'Reset' }))
    await act(async () => {})
    expect(field.value).toBe('09:15')
  })

  it('associates an external form and follows it when the form prop changes', async () => {
    const { rerender } = render(
      <>
        <form id="first" />
        <form id="second" />
        <TimePicker label="External" defaultValue="09:15" form="first" />
      </>,
    )
    const field = screen.getByRole('textbox', { name: 'External' }) as HTMLInputElement
    expect(field.form?.id).toBe('first')
    rerender(
      <>
        <form id="first" />
        <form id="second" />
        <TimePicker label="External" defaultValue="09:15" form="second" />
      </>,
    )
    expect(field.form?.id).toBe('second')
  })

  it('keeps readonly validation active while allowing navigation and copy shortcuts', () => {
    render(<TimePicker label="Locked" readOnly required />)
    const field = screen.getByRole('textbox', { name: 'Locked' }) as HTMLInputElement
    expect(field.hasAttribute('readonly')).toBe(false)
    expect(field.getAttribute('aria-readonly')).toBe('true')
    expect(field.checkValidity()).toBe(false)

    const letter = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true })
    const copy = new KeyboardEvent('keydown', {
      key: 'c', ctrlKey: true, bubbles: true, cancelable: true,
    })
    const arrow = new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true })
    field.dispatchEvent(letter)
    field.dispatchEvent(copy)
    field.dispatchEvent(arrow)
    expect(letter.defaultPrevented).toBe(true)
    expect(copy.defaultPrevented).toBe(false)
    expect(arrow.defaultPrevented).toBe(false)
  })
})

describe('TimePicker panel interaction', () => {
  it('keeps modal changes as a draft, restores on Cancel, and commits on OK', async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(
      <TimePicker
        label="Appointment time"
        presentation="modal"
        hour12={false}
        defaultValue="09:32"
        onValueChange={onValueChange}
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open Appointment time' }))
    await user.click(screen.getByRole('radio', { name: '10 hours' }))
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '32 minutes' }))
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect((screen.getByRole('textbox', { name: 'Appointment time' }) as HTMLInputElement).value).toBe('09:32')
    expect(onValueChange).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Open Appointment time' }))
    await user.click(screen.getByRole('radio', { name: '10 hours' }))
    await user.click(screen.getByRole('radio', { name: '35 minutes' }))
    await user.click(screen.getByRole('button', { name: 'OK' }))
    expect((screen.getByRole('textbox', { name: 'Appointment time' }) as HTMLInputElement).value).toBe('10:35')
    expect(onValueChange).toHaveBeenLastCalledWith('10:35')
  })

  it('makes every minute keyboard reachable and keeps a valid roving tab stop for a narrow range', async () => {
    const user = userEvent.setup()
    render(
      <TimePicker
        label="Window"
        presentation="modal"
        hour12={false}
        min="14:32"
        max="14:34"
        defaultValue="14:32"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open Window' }))
    await user.click(screen.getByRole('radio', { name: '14 hours' }))
    const minute32 = screen.getByRole('radio', { name: '32 minutes' })
    expect(document.activeElement).toBe(minute32)
    expect(minute32.tabIndex).toBe(0)
    await user.keyboard('{ArrowRight}')
    const minute33 = screen.getByRole('radio', { name: '33 minutes' })
    expect(document.activeElement).toBe(minute33)
    expect(minute33.getAttribute('aria-checked')).toBe('true')
    expect(minute33.getAttribute('data-m3e-major')).toBe('false')
    expect(minute33.tabIndex).toBe(0)
  })

  it('seeds an empty bounded dial at the nearest allowed time and can cross periods at a boundary', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <TimePicker label="Afternoon only" min="14:32" max="16:00" />,
    )
    expect(screen.getByRole('button', { name: 'PM' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('radio', { name: '2 hours' }).getAttribute('aria-checked')).toBe('true')

    rerender(
      <TimePicker key="wide" label="Wide window" defaultValue="18:45" min="08:30" max="20:00" />,
    )
    await user.click(screen.getByRole('button', { name: 'AM' }))
    expect(screen.getByRole('textbox', { name: 'Wide window' })).toHaveProperty('value', '08:30')
  })

  it('keeps hour arrows in the hour group until explicit activation', async () => {
    const user = userEvent.setup()
    render(<TimePicker label="Keyboard" hour12={false} defaultValue="08:20" />)
    const hour = screen.getByRole('radio', { name: '8 hours' })
    hour.focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '9 hours' }))
    expect(screen.getByRole('radiogroup', { name: 'Select hour' })).not.toBeNull()
    await user.keyboard('{Enter}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '20 minutes' }))
  })

  it('uses computed direction for nested RTL arrow behavior', async () => {
    const user = userEvent.setup()
    render(
      <div dir="rtl">
        <div dir="ltr">
          <TimePicker label="Direction" hour12={false} defaultValue="08:20" />
        </div>
      </div>,
    )
    const hour = screen.getByRole('radio', { name: '8 hours' })
    hour.focus()
    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(screen.getByRole('radio', { name: '9 hours' }))
  })

  it('uses the resolved inner-ring threshold for pointer selection and advances only on release', () => {
    render(
      <TimePicker
        label="Pointer"
        hour12={false}
        defaultValue="00:20"
        style={{ '--m3e-comp-time-picker-inner-ring-threshold': '40px' } as React.CSSProperties}
      />,
    )
    const dial = screen.getByRole('radiogroup', { name: 'Select hour' })
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 300, bottom: 300, width: 300, height: 300,
      toJSON: () => ({}),
    })
    const originalComputedStyle = window.getComputedStyle
    vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
      const style = originalComputedStyle(element)
      if (element === dial) {
        Object.defineProperty(style, 'getPropertyValue', {
          value: (name: string) => name === '--m3e-comp-time-picker-inner-ring-threshold' ? '40px' : '',
        })
      }
      return style
    })

    fireEvent.pointerDown(dial, { pointerId: 1, clientX: 150, clientY: 120 })
    expect(screen.getByRole('radiogroup', { name: 'Select hour' })).not.toBeNull()
    fireEvent.pointerUp(dial, { pointerId: 1, clientX: 150, clientY: 120 })
    expect(screen.getByRole('radiogroup', { name: 'Select minute' })).not.toBeNull()
    expect((screen.getByRole('textbox', { name: 'Pointer' }) as HTMLInputElement).value).toBe('12:20')
  })

  it('drags from the selected clock number instead of requiring dial background', () => {
    render(<TimePicker label="Handle drag" hour12={false} defaultValue="00:20" />)
    const dial = screen.getByRole('radiogroup', { name: 'Select hour' })
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 256, bottom: 256, width: 256, height: 256,
      toJSON: () => ({}),
    })
    const selected = screen.getByRole('radio', { name: '0 hours' })
    fireEvent.pointerDown(selected, { pointerId: 7, clientX: 128, clientY: 27 })
    fireEvent.pointerMove(dial, { pointerId: 7, clientX: 229, clientY: 128 })
    fireEvent.pointerUp(dial, { pointerId: 7, clientX: 229, clientY: 128 })
    fireEvent.click(selected)

    expect(screen.getByRole('radiogroup', { name: 'Select minute' })).not.toBeNull()
    expect((screen.getByRole('textbox', { name: 'Handle drag' }) as HTMLInputElement).value).toBe('03:20')
  })

  it('does not let the trailing click overwrite an exact-minute drag', () => {
    render(<TimePicker label="Minute drag" hour12={false} defaultValue="00:20" />)
    fireEvent.click(screen.getByRole('radio', { name: '0 hours' }))
    const dial = screen.getByRole('radiogroup', { name: 'Select minute' })
    vi.spyOn(dial, 'getBoundingClientRect').mockReturnValue({
      x: 0, y: 0, left: 0, top: 0, right: 256, bottom: 256, width: 256, height: 256,
      toJSON: () => ({}),
    })
    const selected = screen.getByRole('radio', { name: '20 minutes' })
    fireEvent.pointerDown(selected, { pointerId: 8, clientX: 216, clientY: 179 })
    fireEvent.pointerMove(dial, { pointerId: 8, clientX: 210, clientY: 187 })
    fireEvent.pointerUp(dial, { pointerId: 8, clientX: 210, clientY: 187 })
    fireEvent.click(selected)

    expect((screen.getByRole('textbox', { name: 'Minute drag' }) as HTMLInputElement).value).toBe('00:21')
    expect(screen.getByRole('radio', { name: '21 minutes' }).getAttribute('aria-checked')).toBe('true')
  })

  it('renders the source horizontal layout with a horizontal period selector', () => {
    const { container } = render(
      <TimePicker label="Landscape" layout="horizontal" defaultValue="09:15" />,
    )
    const panel = container.querySelector('.m3e-time-picker__panel')
    const period = screen.getByRole('group', { name: 'Day period' })
    expect(panel?.getAttribute('data-m3e-layout')).toBe('horizontal')
    expect(period.parentElement?.classList.contains('m3e-time-picker__display-row')).toBe(true)
    expect(panel?.querySelector('.m3e-time-picker__dial')).not.toBeNull()
  })

  it('selects every 24-hour value and every exact minute', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <TimePicker label="Exhaustive" hour12={false} value="00:00" onValueChange={onValueChange} />,
    )
    for (let hour = 0; hour < 24; hour += 1) {
      const value = `${String(hour).padStart(2, '0')}:00`
      rerender(
        <TimePicker label="Exhaustive" hour12={false} value={value} onValueChange={onValueChange} />,
      )
      expect(screen.getByRole('radio', { name: `${hour} hours` }).getAttribute('aria-checked')).toBe('true')
    }

    rerender(<TimePicker key="minutes" label="Minutes" hour12={false} defaultValue="14:00" />)
    fireEvent.click(screen.getByRole('radio', { name: '14 hours' }))
    const field = screen.getByRole('textbox', { name: 'Minutes' }) as HTMLInputElement
    for (let minute = 0; minute < 60; minute += 1) {
      fireEvent.click(screen.getByRole('radio', { name: `${minute} minutes` }))
      expect(field.value).toBe(`14:${String(minute).padStart(2, '0')}`)
    }
  })

  it('maps all 12-hour display values to the correct AM or PM civil hour', () => {
    const onValueChange = vi.fn()
    const { rerender } = render(
      <TimePicker label="Twelve hour" hour12 value="00:00" onValueChange={onValueChange} />,
    )
    for (let hour = 0; hour < 24; hour += 1) {
      rerender(
        <TimePicker
          label="Twelve hour"
          hour12
          value={`${String(hour).padStart(2, '0')}:00`}
          onValueChange={onValueChange}
        />,
      )
      const displayHour = hour % 12 || 12
      expect(screen.getByRole('radio', { name: `${displayHour} hours` }).getAttribute('aria-checked')).toBe('true')
      expect(screen.getByRole('button', { name: hour < 12 ? 'AM' : 'PM' }).getAttribute('aria-pressed')).toBe('true')
    }
  })

  it('keeps invalid text-entry drafts visible and blocks modal confirmation', async () => {
    const user = userEvent.setup()
    render(
      <TimePicker
        label="Input draft"
        presentation="modal"
        defaultMode="input"
        hour12={false}
        defaultValue="10:30"
      />,
    )
    await user.click(screen.getByRole('button', { name: 'Open Input draft' }))
    const hour = screen.getByRole('textbox', { name: 'Hour' })
    await user.clear(hour)
    await user.type(hour, 'x9')
    expect((hour as HTMLInputElement).value).toBe('x9')
    expect(hour.getAttribute('aria-invalid')).toBe('true')
    expect((screen.getByRole('button', { name: 'OK' }) as HTMLButtonElement).disabled).toBe(true)

    const dialog = screen.getByRole('dialog', { name: 'Input draft' })
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    hour.dispatchEvent(enter)
    expect(enter.defaultPrevented).toBe(true)
    expect((dialog as HTMLDialogElement).open).toBe(true)
    expect((screen.getByRole('textbox', { name: 'Input draft' }) as HTMLInputElement).value).toBe('10:30')
  })

  it('uses source-specific numeric fields with associated labels below them', () => {
    render(<TimePicker label="Direct input" defaultMode="input" defaultValue="08:05" />)
    const hour = screen.getByRole('textbox', { name: 'Hour' })
    const minute = screen.getByRole('textbox', { name: 'Minute' })
    expect(hour.parentElement?.lastElementChild?.tagName).toBe('LABEL')
    expect(minute.parentElement?.lastElementChild?.tagName).toBe('LABEL')
    expect(hour.className).toBe('m3e-time-picker__time-field-input')
    expect(minute.className).toBe('m3e-time-picker__time-field-input')
  })

  it('updates input-mode time while retaining PM and preserves invalid deletions', async () => {
    const user = userEvent.setup()
    render(<TimePicker label="Typed time" defaultMode="input" defaultValue="13:20" />)
    const field = screen.getByRole('textbox', { name: 'Typed time' }) as HTMLInputElement
    const hour = screen.getByRole('textbox', { name: 'Hour' }) as HTMLInputElement
    expect(screen.getByRole('button', { name: 'PM' }).getAttribute('aria-pressed')).toBe('true')

    await user.clear(hour)
    await user.type(hour, '2')
    expect(field.value).toBe('14:20')
    expect(screen.getByRole('button', { name: 'PM' }).getAttribute('aria-pressed')).toBe('true')
    await user.clear(hour)
    expect(hour.value).toBe('')
    expect(hour.getAttribute('aria-invalid')).toBe('true')
    expect(screen.getByRole('button', { name: 'PM' }).getAttribute('aria-pressed')).toBe('true')
  })

  it('accepts midnight, noon, and PM hours in 24-hour input without a period control', async () => {
    const user = userEvent.setup()
    render(
      <TimePicker label="24-hour input" hour12={false} defaultMode="input" defaultValue="20:05" />,
    )
    const field = screen.getByRole('textbox', { name: '24-hour input' }) as HTMLInputElement
    const hour = screen.getByRole('textbox', { name: 'Hour' })
    expect(screen.queryByRole('group', { name: 'Day period' })).toBeNull()
    for (const value of ['23', '12', '00']) {
      await user.clear(hour)
      await user.type(hour, value)
      expect(field.value).toBe(`${value}:05`)
    }
  })
})
