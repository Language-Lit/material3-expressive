// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach } from 'vitest'
import { SearchBar } from '../../../src/components/SearchBar'
import { Material3Provider, createTheme, defaultTheme } from '../../../src'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'
import { installWidthMatchMedia } from '../NavigationSuite/navigation-suite-native-polyfill'

beforeAll(installDialogPolyfill)
beforeEach(() => {
  installWidthMatchMedia(1280)
})
afterEach(cleanup)

function withSearchBarToken(name: string, value: number | string | { $ref: string }) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'search-bar'
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
  defaultTheme.componentTokens.find((candidate) => candidate.component === 'search-bar')

describe('SearchBar theme integration', () => {
  it('ships the seven search-bar roles the pinned implementation reads', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['container-color'].value).toEqual({
      $ref: 'sys.color.surfaceContainerHigh',
    })
    expect(tokens?.['container-height'].value).toBe('56px')
    expect(tokens?.['container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerFull',
    })
    expect(tokens?.['input-text-color'].value).toEqual({ $ref: 'sys.color.onSurface' })
    expect(tokens?.['leading-icon-color'].value).toEqual({ $ref: 'sys.color.onSurface' })
    expect(tokens?.['supporting-text-color'].value).toEqual({
      $ref: 'sys.color.onSurfaceVariant',
    })
    expect(tokens?.['trailing-icon-color'].value).toEqual({
      $ref: 'sys.color.onSurfaceVariant',
    })
  })

  it('ships the three search-view roles the pinned implementation reads', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['view-divider-color'].value).toEqual({ $ref: 'sys.color.outline' })
    expect(tokens?.['view-docked-container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerExtraLarge',
    })
    expect(tokens?.['view-full-screen-container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerNone',
    })
  })

  it('ships the measurement constants the source reads directly', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['min-width'].value).toBe('360px')
    expect(tokens?.['max-width'].value).toBe('720px')
    expect(tokens?.['vertical-padding'].value).toBe('8px')
    expect(tokens?.['input-horizontal-padding'].value).toBe('12px')
    expect(tokens?.['icon-horizontal-padding'].value).toBe('4px')
    expect(tokens?.['app-bar-horizontal-padding'].value).toBe('4px')
    expect(tokens?.['app-bar-vertical-padding'].value).toBe('4px')
    expect(tokens?.['app-bar-search-padding'].value).toBe('8px')
    expect(tokens?.['view-docked-dropdown-gap'].value).toBe('2px')
    expect(tokens?.['view-docked-dropdown-shape'].value).toBe('12px')
    expect(tokens?.['view-docked-min-height'].value).toBe('240px')
    expect(tokens?.['view-scrim-opacity'].value).toBe(0.32)
  })

  it('registers the two roles the pinned source declares but never resolves', () => {
    const tokens = registration()?.tokens

    // The specification's avatar and the source's own inset focus ring; ADR
    // 0039 records why these are registered while the other unread roles are
    // recorded in the ledger instead.
    expect(tokens?.['avatar-size'].value).toBe('30px')
    expect(tokens?.['avatar-shape'].value).toEqual({ $ref: 'sys.shape.corners.cornerFull' })
    expect(tokens?.['focus-ring-color'].value).toEqual({ $ref: 'sys.color.secondary' })
  })

  it('registers no elevation, because the search bar ships flat', () => {
    // `SearchBarTokens.ContainerElevation` is Level3, but both
    // `SearchBarDefaults.TonalElevation` and `ShadowElevation` are Level0.
    const names = Object.keys(registration()?.tokens ?? {})
    expect(names.some((name) => name.includes('elevation'))).toBe(false)
    expect(names.some((name) => name.includes('shadow'))).toBe(false)
  })

  it('registers exactly the thirty roles this task pinned', () => {
    expect(Object.keys(registration()?.tokens ?? {})).toHaveLength(30)
    expect(registration()?.task).toBe('T47')
    expect(registration()?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
  })

  it('supports scoped token overrides without runtime style injection', () => {
    const theme = createTheme({
      componentTokens: withSearchBarToken('container-height', '64px'),
    })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <SearchBar placeholder="Search" />
      </Material3Provider>,
    )

    expect(
      screen
        .getByTestId('provider')
        .style.getPropertyValue('--m3e-comp-search-bar-container-height'),
    ).toBe('64px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withSearchBarToken('container-color', { $ref: 'sys.color.surfaceDim' }),
    })
    const innerTheme = createTheme({
      componentTokens: withSearchBarToken('container-color', {
        $ref: 'sys.color.primaryContainer',
      }),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <SearchBar placeholder="Outer" />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <SearchBar placeholder="Inner" />
        </Material3Provider>
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('outer').style.getPropertyValue('--m3e-comp-search-bar-container-color'),
    ).toBe('var(--m3e-sys-color-surface-dim)')
    expect(
      screen.getByTestId('inner').style.getPropertyValue('--m3e-comp-search-bar-container-color'),
    ).toBe('var(--m3e-sys-color-primary-container)')
  })

  it('carries the enclosing theme scope into the portalled docked surface', () => {
    const theme = createTheme({
      componentTokens: withSearchBarToken('container-color', { $ref: 'sys.color.surfaceDim' }),
    })
    render(
      <Material3Provider theme={theme} colorMode="dark">
        <SearchBar placeholder="Search" defaultExpanded>
          results
        </SearchBar>
      </Material3Provider>,
    )

    const portal = document.querySelector('.m3e-search-bar__portal') as HTMLElement
    expect(portal.getAttribute('data-m3e-color-mode')).toBe('dark')
    expect(portal.style.getPropertyValue('--m3e-comp-search-bar-container-color')).toBe(
      'var(--m3e-sys-color-surface-dim)',
    )
  })
})
