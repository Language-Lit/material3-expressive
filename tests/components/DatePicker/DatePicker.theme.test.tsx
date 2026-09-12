// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'
import { DatePicker, Material3Provider, createTheme, defaultTheme } from '../../../src'
import { installDatePickerPolyfills } from './date-picker-polyfill'

beforeAll(installDatePickerPolyfills)
afterEach(() => {
  cleanup()
  document.querySelectorAll('.m3e-date-picker__popover').forEach((node) => node.remove())
})

function withDatePickerToken(name: string, value: string) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'date-picker'
      ? { ...registration, tokens: { ...registration.tokens, [name]: { ...registration.tokens[name], value } } }
      : registration,
  )
}

describe('DatePicker theme integration', () => {
  it('ships the source-sensitive picker defaults', () => {
    const tokens = defaultTheme.componentTokens.find((entry) => entry.component === 'date-picker')?.tokens
    expect(tokens?.['container-width'].value).toBe('360px')
    expect(tokens?.['calendar-horizontal-padding'].value).toBe('12px')
    expect(tokens?.['navigation-height'].value).toBe('56px')
    expect(tokens?.['date-container-width'].value).toBe('40px')
    expect(tokens?.['range-header-min-height'].value).toBe('128px')
  })

  it('publishes scoped token overrides without runtime style injection', () => {
    const theme = createTheme({ componentTokens: withDatePickerToken('container-width', '352px') })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <DatePicker label="Date" today="2026-09-12" />
      </Material3Provider>,
    )
    expect(screen.getByTestId('provider').style.getPropertyValue('--m3e-comp-date-picker-container-width')).toBe('352px')
    expect(document.querySelector('style')).toBeNull()
  })
})
