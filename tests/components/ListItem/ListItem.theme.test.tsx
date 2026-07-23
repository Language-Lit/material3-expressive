// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach } from 'vitest'
import {
  ListItem,
  Material3Provider,
  createTheme,
  defaultTheme,
} from '../../../src'

afterEach(cleanup)

function withListItemToken(name: string, value: number | string) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'list-item'
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

describe('ListItem theme integration', () => {
  it('ships the exact pinned geometry, shape, color, opacity, and elevation defaults', () => {
    const registration = defaultTheme.componentTokens.find(
      (candidate) => candidate.component === 'list-item',
    )
    const tokens = registration?.tokens

    expect(registration?.task).toBe('T40')
    expect(registration?.source.revision).toBe(
      'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    )
    expect(tokens?.['one-line-container-height'].value).toBe('56px')
    expect(tokens?.['two-line-container-height'].value).toBe('72px')
    expect(tokens?.['three-line-container-height'].value).toBe('88px')
    expect(tokens?.['content-padding-inline'].value).toBe('16px')
    expect(tokens?.['content-padding-block'].value).toBe('10px')
    expect(tokens?.['precision-pointer-content-padding-block'].value).toBe('12px')
    expect(tokens?.['internal-spacing'].value).toBe('12px')
    expect(tokens?.['segmented-gap'].value).toBe('2px')
    expect(tokens?.['container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerExtraSmall',
    })
    expect(tokens?.['segmented-outer-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerLarge',
    })
    expect(tokens?.['hovered-container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerMedium',
    })
    expect(tokens?.['selected-container-color'].value).toEqual({
      $ref: 'sys.color.secondaryContainer',
    })
    expect(tokens?.['selected-content-color'].value).toEqual({
      $ref: 'sys.color.onSecondaryContainer',
    })
    expect(tokens?.['disabled-content-opacity'].value).toBe(0.38)
    expect(tokens?.['reorder-dragged-container-color'].value).toEqual({
      $ref: 'sys.color.tertiaryContainer',
    })
    expect(tokens?.['reorder-dragged-content-color'].value).toEqual({
      $ref: 'sys.color.onTertiaryContainer',
    })
    expect(tokens?.['reorder-dragged-container-shadow'].value).toEqual({
      $ref: 'sys.elevation.level4.shadow',
    })
  })

  it('supports scoped and nested List Item token overrides without style injection', () => {
    const outerTheme = createTheme({
      componentTokens: withListItemToken('one-line-container-height', '60px'),
    })
    const innerTheme = createTheme({
      componentTokens: withListItemToken('one-line-container-height', '64px'),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="dark">
        <ListItem headline="Outer" />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <ListItem headline="Inner" />
        </Material3Provider>
      </Material3Provider>,
    )
    expect(
      screen
        .getByTestId('outer')
        .style.getPropertyValue('--m3e-comp-list-item-one-line-container-height'),
    ).toBe('60px')
    expect(
      screen
        .getByTestId('inner')
        .style.getPropertyValue('--m3e-comp-list-item-one-line-container-height'),
    ).toBe('64px')
    expect(document.querySelector('style')).toBeNull()
  })
})
