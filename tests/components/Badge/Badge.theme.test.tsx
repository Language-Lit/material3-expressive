// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import { Badge } from '../../../src/components/Badge'
import { Material3Provider, createTheme, defaultTheme } from '../../../src'

afterEach(cleanup)

function withBadgeToken(name: string, value: number | string | { $ref: string }) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'badge'
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

describe('Badge theme integration', () => {
  it('ships the sourced BadgeTokens defaults', () => {
    const tokens = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'badge',
    )?.tokens

    expect(tokens?.color.value).toEqual({ $ref: 'sys.color.error' })
    expect(tokens?.['label-color'].value).toEqual({ $ref: 'sys.color.onError' })
    expect(tokens?.shape.value).toEqual({ $ref: 'sys.shape.corners.cornerFull' })
    expect(tokens?.size.value).toBe('6px')
    expect(tokens?.['large-size'].value).toBe('16px')
  })

  it('registers the internal geometry the source keeps outside its token file', () => {
    const tokens = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'badge',
    )?.tokens

    expect(tokens?.offset.value).toBe('6px')
    expect(tokens?.['large-horizontal-offset'].value).toBe('12px')
    expect(tokens?.['large-vertical-offset'].value).toBe('14px')
    expect(tokens?.['large-horizontal-padding'].value).toBe('4px')
  })

  it('supports scoped Badge token overrides without runtime style injection', () => {
    const theme = createTheme({ componentTokens: withBadgeToken('large-size', '20px') })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <Badge>3</Badge>
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('provider').style.getPropertyValue('--m3e-comp-badge-large-size'),
    ).toBe('20px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested Badge overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withBadgeToken('color', { $ref: 'sys.color.tertiary' }),
    })
    const innerTheme = createTheme({
      componentTokens: withBadgeToken('color', { $ref: 'sys.color.primary' }),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <Badge />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <Badge />
        </Material3Provider>
      </Material3Provider>,
    )

    expect(screen.getByTestId('outer').style.getPropertyValue('--m3e-comp-badge-color')).toBe(
      'var(--m3e-sys-color-tertiary)',
    )
    expect(screen.getByTestId('inner').style.getPropertyValue('--m3e-comp-badge-color')).toBe(
      'var(--m3e-sys-color-primary)',
    )
  })

  it('adds no badge role to the drawer, whose badge follows the item text color', () => {
    const drawer = defaultTheme.componentTokens.find(
      (registration) => registration.component === 'navigation-drawer',
    )

    expect(Object.keys(drawer?.tokens ?? {}).some((role) => role.includes('badge'))).toBe(false)
    expect(drawer?.tokens['item-inactive-label-color'].value).toEqual({
      $ref: 'sys.color.onSurfaceVariant',
    })
  })
})
