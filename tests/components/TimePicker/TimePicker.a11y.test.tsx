// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach } from 'vitest'
import { TimePicker } from '../../../src/components/TimePicker'

afterEach(cleanup)

describe('TimePicker accessibility', () => {
  it('exposes real clock selectors, period controls, and radio selection semantics', async () => {
    const user = userEvent.setup()
    render(<TimePicker label="Semantic time" defaultValue="09:05" />)
    const hours = screen.getByRole('button', { name: '09' })
    const minutes = screen.getByRole('button', { name: '05' })
    expect(hours.getAttribute('aria-pressed')).toBe('true')
    expect(minutes.getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('group', { name: 'Day period' })).not.toBeNull()
    expect(screen.getByRole('radiogroup', { name: 'Select hour' })).not.toBeNull()
    expect(screen.getByRole('radio', { name: '9 hours' }).getAttribute('aria-checked')).toBe('true')

    await user.click(minutes)
    expect(screen.getByRole('radiogroup', { name: 'Select minute' })).not.toBeNull()
    expect(screen.getByRole('radio', { name: '5 minutes' }).getAttribute('aria-checked')).toBe('true')
  })

  it('associates label, supporting text, error, and required state with the native field', () => {
    render(
      <TimePicker
        label="Arrival"
        supportingText="Use local station time"
        required
        error
      />,
    )
    const field = screen.getByRole('textbox', { name: 'Arrival' })
    const description = document.getElementById(field.getAttribute('aria-describedby') ?? '')
    expect(description?.textContent).toBe('Use local station time')
    expect(field.getAttribute('aria-invalid')).toBe('true')
    expect((field as HTMLInputElement).required).toBe(true)
  })

  it('keeps only the selected or nearest enabled dial value in sequential focus', async () => {
    const user = userEvent.setup()
    render(
      <TimePicker label="Bounded" hour12={false} defaultValue="08:15" min="09:00" max="10:00" />,
    )
    const radios = screen.getAllByRole('radio', { name: /hours/ }) as HTMLButtonElement[]
    expect(radios.filter((radio) => radio.tabIndex === 0)).toHaveLength(1)
    expect(radios.find((radio) => radio.tabIndex === 0)?.getAttribute('aria-label')).toBe('9 hours')

    await user.tab()
    expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Bounded' }))
  })

  it('removes disabled controls from focus and exposes no synthetic disabled ARIA', () => {
    render(<TimePicker label="Unavailable" disabled defaultValue="12:00" />)
    const field = screen.getByRole('textbox', { name: 'Unavailable' }) as HTMLInputElement
    expect(field.disabled).toBe(true)
    expect(field.hasAttribute('aria-disabled')).toBe(false)
    expect(screen.getAllByRole('button', { hidden: true }).every(
      (button) => (button as HTMLButtonElement).disabled,
    )).toBe(true)
  })
})
