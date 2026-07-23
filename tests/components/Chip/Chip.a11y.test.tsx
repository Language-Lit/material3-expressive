// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import { Chip } from '../../../src'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Chip accessibility', () => {
  it('uses native button naming and exposes pressed state only for selectable purposes', () => {
    render(
      <>
        <Chip kind="assist">Add to calendar</Chip>
        <Chip kind="suggestion">Try a dialogue</Chip>
        <Chip kind="filter" defaultSelected>
          Grammar
        </Chip>
        <Chip kind="input">Aiko</Chip>
      </>,
    )

    expect(
      screen.getByRole('button', { name: 'Add to calendar' }).hasAttribute('aria-pressed'),
    ).toBe(false)
    expect(
      screen.getByRole('button', { name: 'Try a dialogue' }).hasAttribute('aria-pressed'),
    ).toBe(false)
    expect(screen.getByRole('button', { name: 'Grammar' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByRole('button', { name: 'Aiko' }).getAttribute('aria-pressed')).toBe(
      'false',
    )
  })

  it('keeps decorative slots out of the accessible name', () => {
    render(
      <Chip
        kind="input"
        aria-label="Remove Aiko"
        avatar={<span>A</span>}
        leadingIcon={<span>person</span>}
        trailingIcon={<span>close</span>}
      >
        Aiko
      </Chip>,
    )

    const chip = screen.getByRole('button', { name: 'Remove Aiko' })
    expect(chip.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
    expect(screen.queryByRole('button', { name: /close|person/ })).toBeNull()
  })

  it('uses native Enter and Space activation exactly once and toggles selectable chips', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const onSelectedChange = vi.fn()
    render(
      <Chip
        kind="filter"
        onClick={onClick}
        onSelectedChange={onSelectedChange}
      >
        Listening
      </Chip>,
    )
    const chip = screen.getByRole('button', { name: 'Listening' })

    await user.tab()
    expect(document.activeElement).toBe(chip)
    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onSelectedChange).toHaveBeenLastCalledWith(true)
    expect(chip.getAttribute('aria-pressed')).toBe('true')
    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
    expect(onSelectedChange).toHaveBeenLastCalledWith(false)
    expect(chip.getAttribute('aria-pressed')).toBe('false')
  })

  it('removes disabled chips from sequential focus', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Chip kind="assist" disabled>Unavailable assist</Chip>
        <Chip kind="filter" disabled>Unavailable filter</Chip>
        <Chip kind="suggestion">Available suggestion</Chip>
      </>,
    )

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Available suggestion' }),
    )
  })

  it('preserves logical source order and names inside an RTL scope', () => {
    render(
      <div dir="rtl">
        <Chip
          kind="filter"
          leadingIcon={<span>leading</span>}
          trailingIcon={<span>trailing</span>}
        >
          العربية
        </Chip>
      </div>,
    )
    const chip = screen.getByRole('button', { name: 'العربية' })
    const positions = [...chip.querySelectorAll('.m3e-chip__slot')].map((slot) =>
      slot.getAttribute('data-m3e-position'),
    )

    expect(positions).toEqual(['leading', 'trailing'])
    expect(chip.textContent).toBe('leadingالعربيةtrailing')
  })

  it('supports an explicit accessible name when visible label content is absent', () => {
    render(
      <Chip kind="assist" aria-label="Add topic">
        {null}
      </Chip>,
    )
    expect(screen.getByRole('button', { name: 'Add topic' })).toBeTruthy()
  })
})
