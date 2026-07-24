// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { Divider } from '../../../src/components/Divider'
import { Material3Provider, createTheme, defaultTheme } from '../../../src'

afterEach(cleanup)

function withDividerToken(name: string, value: number | string | { $ref: string }) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'divider'
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

describe('Divider theme integration', () => {
  it('ships the sourced DividerTokens defaults', () => {
    const tokens = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'divider',
    )?.tokens

    expect(tokens?.color.value).toEqual({ $ref: 'sys.color.outlineVariant' })
    expect(tokens?.thickness.value).toBe('1px')
  })

  it('registers exactly the two roles the generated token file declares', () => {
    const registration = defaultTheme.componentTokens.find(
      (candidate) => candidate.component === 'divider',
    )

    expect(Object.keys(registration?.tokens ?? {}).sort()).toEqual(['color', 'thickness'])
    expect(registration?.task).toBe('T42')
  })

  it('supports scoped Divider token overrides without runtime style injection', () => {
    const theme = createTheme({ componentTokens: withDividerToken('thickness', '2px') })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <Divider />
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('provider').style.getPropertyValue('--m3e-comp-divider-thickness'),
    ).toBe('2px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested Divider overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withDividerToken('color', { $ref: 'sys.color.outline' }),
    })
    const innerTheme = createTheme({
      componentTokens: withDividerToken('color', { $ref: 'sys.color.primary' }),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <Divider />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <Divider />
        </Material3Provider>
      </Material3Provider>,
    )

    expect(screen.getByTestId('outer').style.getPropertyValue('--m3e-comp-divider-color')).toBe(
      'var(--m3e-sys-color-outline)',
    )
    expect(screen.getByTestId('inner').style.getPropertyValue('--m3e-comp-divider-color')).toBe(
      'var(--m3e-sys-color-primary)',
    )
  })

  it('keeps the Tabs rule on its own namespace while tracking the same sourced value', () => {
    const divider = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'divider',
    )?.tokens
    const tabs = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'tabs',
    )?.tokens

    expect(tabs?.['divider-color'].value).toEqual(divider?.color.value)
    expect(tabs?.['divider-height'].value).toBe(divider?.thickness.value)
  })
})
