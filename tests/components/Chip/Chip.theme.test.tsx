// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  Chip,
  Material3Provider,
  createTheme,
  defaultTheme,
} from '../../../src'

afterEach(cleanup)

function withChipToken(name: string, value: number | string) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'chip'
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

describe('Chip theme integration', () => {
  it('ships the sourced geometry, shape, color, outline, opacity, and elevation defaults', () => {
    const registration = defaultTheme.componentTokens.find(
      (candidate) => candidate.component === 'chip',
    )
    const tokens = registration?.tokens

    expect(registration?.task).toBe('T38')
    expect(registration?.source.revision).toBe(
      'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    )
    expect(tokens?.['container-height'].value).toBe('32px')
    expect(tokens?.['minimum-interactive-target'].value).toEqual({
      $ref: 'sys.density.minimumInteractiveTarget',
    })
    expect(tokens?.['icon-size'].value).toBe('18px')
    expect(tokens?.['avatar-size'].value).toBe('24px')
    expect(tokens?.['container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerSmall',
    })
    expect(tokens?.['expressive-unselected-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerMedium',
    })
    expect(tokens?.['expressive-selected-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerFull',
    })
    expect(tokens?.['filter-flat-selected-container-color'].value).toEqual({
      $ref: 'sys.color.secondaryContainer',
    })
    expect(tokens?.['filter-elevated-selected-container-color'].value).toEqual({
      $ref: 'sys.color.secondaryContainer',
    })
    expect(tokens?.['input-disabled-selected-container-opacity'].value).toBe(0.12)
    expect(tokens?.['assist-elevated-hover-shadow'].value).toEqual({
      $ref: 'sys.elevation.level2.shadow',
    })
    expect(tokens?.['filter-flat-hover-shadow'].value).toEqual({
      $ref: 'sys.elevation.level1.shadow',
    })
    expect(tokens?.['suggestion-elevated-dragged-shadow'].value).toEqual({
      $ref: 'sys.elevation.level4.shadow',
    })
  })

  it('supports scoped Chip token overrides without runtime style injection', () => {
    const theme = createTheme({
      componentTokens: withChipToken('container-height', '36px'),
    })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <Chip kind="assist">Custom</Chip>
      </Material3Provider>,
    )

    expect(
      screen
        .getByTestId('provider')
        .style.getPropertyValue('--m3e-comp-chip-container-height'),
    ).toBe('36px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested Chip overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withChipToken('focus-ring-width', '3px'),
    })
    const innerTheme = createTheme({
      componentTokens: withChipToken('focus-ring-width', '4px'),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <Chip kind="filter">Outer</Chip>
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <Chip kind="input">Inner</Chip>
        </Material3Provider>
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('outer').style.getPropertyValue('--m3e-comp-chip-focus-ring-width'),
    ).toBe('3px')
    expect(
      screen.getByTestId('inner').style.getPropertyValue('--m3e-comp-chip-focus-ring-width'),
    ).toBe('4px')
  })
})
