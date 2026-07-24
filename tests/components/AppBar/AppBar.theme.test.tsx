// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { AppBar } from '../../../src/components/AppBar'
import { Material3Provider, createTheme, defaultTheme } from '../../../src'

afterEach(cleanup)

function withAppBarToken(name: string, value: number | string | { $ref: string }) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'app-bar'
      ? {
          ...registration,
          tokens: {
            ...registration.tokens,
            [name]: { ...registration.tokens[name], value },
          },
        }
      : registration,
  )
}

const registration = () =>
  defaultTheme.componentTokens.find((candidate) => candidate.component === 'app-bar')

describe('AppBar theme integration', () => {
  it('ships the six sourced topAppBarColors roles', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['container-color'].value).toEqual({ $ref: 'sys.color.surface' })
    expect(tokens?.['on-scroll-container-color'].value).toEqual({
      $ref: 'sys.color.surfaceContainer',
    })
    expect(tokens?.['leading-icon-color'].value).toEqual({ $ref: 'sys.color.onSurface' })
    expect(tokens?.['title-color'].value).toEqual({ $ref: 'sys.color.onSurface' })
    expect(tokens?.['trailing-icon-color'].value).toEqual({
      $ref: 'sys.color.onSurfaceVariant',
    })
    expect(tokens?.['subtitle-color'].value).toEqual({ $ref: 'sys.color.onSurfaceVariant' })
  })

  it('ships the sourced tier heights, including the taller subtitle containers', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['container-height'].value).toBe('64px')
    expect(tokens?.['medium-container-height'].value).toBe('112px')
    expect(tokens?.['medium-flexible-container-height'].value).toBe('112px')
    expect(tokens?.['medium-flexible-subtitle-container-height'].value).toBe('136px')
    expect(tokens?.['large-container-height'].value).toBe('152px')
    expect(tokens?.['large-flexible-container-height'].value).toBe('120px')
    expect(tokens?.['large-flexible-subtitle-container-height'].value).toBe('152px')
  })

  it('ships the hand-tuned constants the source reads instead of its unread roles', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['horizontal-padding'].value).toBe('4px')
    expect(tokens?.['title-inset'].value).toBe('12px')
    expect(tokens?.['medium-title-bottom-padding'].value).toBe('24px')
    expect(tokens?.['large-title-bottom-padding'].value).toBe('28px')
  })

  it('registers exactly the seventeen roles this task pinned', () => {
    expect(Object.keys(registration()?.tokens ?? {})).toHaveLength(17)
    expect(registration()?.task).toBe('T46')
    expect(registration()?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
  })

  it('supports scoped token overrides without runtime style injection', () => {
    const theme = createTheme({
      componentTokens: withAppBarToken('container-height', '72px'),
    })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <AppBar title="Inbox" />
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('provider').style.getPropertyValue('--m3e-comp-app-bar-container-height'),
    ).toBe('72px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withAppBarToken('container-color', { $ref: 'sys.color.surfaceDim' }),
    })
    const innerTheme = createTheme({
      componentTokens: withAppBarToken('container-color', { $ref: 'sys.color.primaryContainer' }),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <AppBar title="Outer" />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <AppBar title="Inner" />
        </Material3Provider>
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('outer').style.getPropertyValue('--m3e-comp-app-bar-container-color'),
    ).toBe('var(--m3e-sys-color-surface-dim)')
    expect(
      screen.getByTestId('inner').style.getPropertyValue('--m3e-comp-app-bar-container-color'),
    ).toBe('var(--m3e-sys-color-primary-container)')
  })
})
