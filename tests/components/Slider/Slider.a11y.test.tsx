// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach } from 'vitest'
import { RangeSlider, Slider } from '../../../src'

afterEach(cleanup)

describe('Slider accessibility', () => {
  it('uses native range naming, value, and description relationships', () => {
    render(
      <>
        <label htmlFor="volume">Volume</label>
        <Slider
          id="volume"
          defaultValue={0.4}
          aria-describedby="volume-help"
        />
        <p id="volume-help">Playback loudness</p>
      </>,
    )
    const slider = screen.getByRole('slider', { name: 'Volume' })

    expect(slider).toBeInstanceOf(HTMLInputElement)
    expect(slider.getAttribute('aria-valuemin')).toBe('0')
    expect(slider.getAttribute('aria-valuemax')).toBe('1')
    expect(slider.getAttribute('aria-valuenow')).toBe('0.4')
    expect(slider.getAttribute('aria-valuetext')).toBe('0.4')
    expect(slider.getAttribute('aria-describedby')).toBe('volume-help')
  })

  it('supports wrapping-label naming and caller-supplied value text', () => {
    render(
      <label>
        Brightness
        <Slider defaultValue={0.5} aria-valuetext="50 percent" />
      </label>,
    )
    const slider = screen.getByRole('slider', { name: 'Brightness' })
    expect(slider.getAttribute('aria-valuetext')).toBe('50 percent')
  })

  it('publishes vertical orientation while preserving the slider role', () => {
    render(
      <Slider
        aria-label="Reading speed"
        orientation="vertical"
        defaultValue={0.25}
      />,
    )
    expect(
      screen.getByRole('slider', { name: 'Reading speed' }).getAttribute(
        'aria-orientation',
      ),
    ).toBe('vertical')
  })

  it('keeps authored geometry and custom visuals out of the accessibility tree', () => {
    render(
      <Slider
        aria-label="Balance"
        defaultValue={0.5}
        thumb={<button type="button">Decorative action</button>}
        trackContent={<span>Track artwork</span>}
      />,
    )
    const slider = screen.getByRole('slider', { name: 'Balance' })
    const decoration = slider.nextElementSibling

    expect(decoration?.getAttribute('aria-hidden')).toBe('true')
    expect(screen.queryByRole('button', { name: 'Decorative action' })).toBeNull()
    expect(decoration?.textContent).toContain('Track artwork')
  })

  it('gives both range thumbs independent names, bounds, and tab stops', async () => {
    const user = userEvent.setup()
    render(
      <RangeSlider
        aria-label="Price interval"
        startAriaLabel="Minimum price"
        endAriaLabel="Maximum price"
        defaultValue={[20, 80]}
        min={0}
        max={100}
      />,
    )
    const start = screen.getByRole('slider', { name: 'Minimum price' })
    const end = screen.getByRole('slider', { name: 'Maximum price' })

    expect(screen.getByRole('group', { name: 'Price interval' })).not.toBeNull()
    expect(start.getAttribute('aria-valuemax')).toBe('80')
    expect(end.getAttribute('aria-valuemin')).toBe('20')

    await user.tab()
    expect(document.activeElement).toBe(start)
    await user.tab()
    expect(document.activeElement).toBe(end)
  })

  it('removes every disabled thumb from sequential focus', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Slider aria-label="Unavailable" disabled />
        <RangeSlider
          startAriaLabel="Unavailable start"
          endAriaLabel="Unavailable end"
          disabled
        />
        <Slider aria-label="Available" />
      </>,
    )

    await user.tab()
    expect(document.activeElement).toBe(
      screen.getByRole('slider', { name: 'Available' }),
    )
  })
})
