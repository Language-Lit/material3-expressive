// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  Material3Provider,
  RangeSlider,
  Slider,
  createTheme,
  defaultTheme,
} from '../../../src'

afterEach(cleanup)

function withSliderToken(name: string, value: number | string) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'slider'
      ? {
          ...registration,
          tokens: {
            ...registration.tokens,
            [name]: {
              ...registration.tokens[name],
              value,
            },
          },
        }
      : registration,
  )
}

describe('Slider theme integration', () => {
  it('ships every observed sourced geometry, color, and disabled default', () => {
    const tokens = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'slider',
    )?.tokens

    expect(tokens?.['track-height'].value).toBe('16px')
    expect(tokens?.['track-corner-size'].value).toBe('8px')
    expect(tokens?.['track-inside-corner-size'].value).toBe('2px')
    expect(tokens?.['handle-width'].value).toBe('4px')
    expect(tokens?.['handle-height'].value).toBe('44px')
    expect(tokens?.['interacted-handle-width'].value).toBe('2px')
    expect(tokens?.['handle-track-gap'].value).toBe('6px')
    expect(tokens?.['stop-indicator-size'].value).toBe('4px')
    expect(tokens?.['tick-size'].value).toBe('4px')
    expect(tokens?.['active-track-color'].value).toEqual({
      $ref: 'sys.color.primary',
    })
    expect(tokens?.['active-tick-color'].value).toEqual({
      $ref: 'sys.color.secondaryContainer',
    })
    expect(tokens?.['inactive-tick-color'].value).toEqual({
      $ref: 'sys.color.primary',
    })
    expect(tokens?.['disabled-handle-opacity'].value).toBe(0.38)
    expect(tokens?.['disabled-inactive-track-opacity'].value).toBe(0.12)
  })

  it('supports scoped Slider token overrides without runtime style injection', () => {
    const theme = createTheme({
      componentTokens: withSliderToken('track-height', '20px'),
    })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <Slider aria-label="Custom Slider" />
        <RangeSlider startAriaLabel="Start" endAriaLabel="End" />
      </Material3Provider>,
    )

    expect(
      screen
        .getByTestId('provider')
        .style.getPropertyValue('--m3e-comp-slider-track-height'),
    ).toBe('20px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested Slider overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withSliderToken('handle-width', '6px'),
    })
    const innerTheme = createTheme({
      componentTokens: withSliderToken('handle-width', '8px'),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <Slider aria-label="Outer" />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <Slider aria-label="Inner" />
        </Material3Provider>
      </Material3Provider>,
    )

    expect(
      screen
        .getByTestId('outer')
        .style.getPropertyValue('--m3e-comp-slider-handle-width'),
    ).toBe('6px')
    expect(
      screen
        .getByTestId('inner')
        .style.getPropertyValue('--m3e-comp-slider-handle-width'),
    ).toBe('8px')
  })
})
