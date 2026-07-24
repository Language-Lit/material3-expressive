// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeAll } from 'vitest'
import { BottomSheet } from '../../../src/components/BottomSheet'
import { Material3Provider, createTheme, defaultTheme } from '../../../src'
import { installDialogPolyfill } from '../Dialog/dialog-native-polyfill'

beforeAll(installDialogPolyfill)
afterEach(cleanup)

function withBottomSheetToken(name: string, value: number | string | { $ref: string }) {
  return defaultTheme.componentTokens.map((registration) =>
    registration.component === 'bottom-sheet'
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
  defaultTheme.componentTokens.find((candidate) => candidate.component === 'bottom-sheet')

describe('BottomSheet theme integration', () => {
  it('ships the sourced SheetBottomTokens defaults', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['container-color'].value).toEqual({ $ref: 'sys.color.surfaceContainerLow' })
    expect(tokens?.['container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerExtraLargeTop',
    })
    expect(tokens?.['hidden-container-shape'].value).toEqual({
      $ref: 'sys.shape.corners.cornerNone',
    })
    expect(tokens?.['drag-handle-color'].value).toEqual({ $ref: 'sys.color.onSurfaceVariant' })
    expect(tokens?.['drag-handle-width'].value).toBe('32px')
    expect(tokens?.['drag-handle-height'].value).toBe('4px')
  })

  it('registers the BottomSheetDefaults constants the source reads', () => {
    const tokens = registration()?.tokens

    expect(tokens?.['peek-height'].value).toBe('56px')
    expect(tokens?.['container-max-width'].value).toBe('640px')
    expect(tokens?.['drag-handle-spacing'].value).toBe('22px')
  })

  it('takes its elevation from the role the source actually resolves', () => {
    // `BottomSheetDefaults.Elevation` reads `DockedModalContainerElevation`
    // for both variants; `DockedStandardContainerElevation` is declared but
    // never resolved, so it is recorded in the ledger rather than registered.
    expect(registration()?.tokens['container-shadow'].value).toEqual({
      $ref: 'sys.elevation.level1.shadow',
    })
  })

  it('sources the scrim from ScrimTokens and agrees with the dialog registration', () => {
    const sheet = registration()?.tokens
    const dialog = defaultTheme.componentTokens.find(
      (candidate) => candidate.component === 'dialog',
    )?.tokens

    expect(sheet?.['scrim-color'].value).toEqual({ $ref: 'sys.color.scrim' })
    expect(sheet?.['scrim-opacity'].value).toBe(0.32)
    expect(sheet?.['scrim-color'].value).toEqual(dialog?.['scrim-color'].value)
    expect(sheet?.['scrim-opacity'].value).toBe(dialog?.['scrim-opacity'].value)
  })

  it('registers exactly the roles this task pinned', () => {
    expect(Object.keys(registration()?.tokens ?? {}).sort()).toEqual([
      'container-color',
      'container-max-width',
      'container-shadow',
      'container-shape',
      'drag-handle-color',
      'drag-handle-height',
      'drag-handle-shape',
      'drag-handle-spacing',
      'drag-handle-width',
      'hidden-container-shape',
      'peek-height',
      'scrim-color',
      'scrim-opacity',
    ])
    expect(registration()?.task).toBe('T45')
    expect(registration()?.source.revision).toBe('a90df2fc27e026b9ad2ed569f203a260c1041fab')
  })

  it('supports scoped token overrides without runtime style injection', () => {
    const theme = createTheme({ componentTokens: withBottomSheetToken('peek-height', '72px') })
    render(
      <Material3Provider data-testid="provider" theme={theme} colorMode="dark">
        <BottomSheet aria-label="Details" variant="standard" defaultValue="partiallyExpanded" />
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('provider').style.getPropertyValue('--m3e-comp-bottom-sheet-peek-height'),
    ).toBe('72px')
    expect(document.querySelector('style')).toBeNull()
  })

  it('keeps nested overrides on their own provider scopes', () => {
    const outerTheme = createTheme({
      componentTokens: withBottomSheetToken('container-color', { $ref: 'sys.color.surface' }),
    })
    const innerTheme = createTheme({
      componentTokens: withBottomSheetToken('container-color', { $ref: 'sys.color.primary' }),
    })
    render(
      <Material3Provider data-testid="outer" theme={outerTheme} colorMode="light">
        <BottomSheet aria-label="Outer" variant="standard" defaultValue="expanded" />
        <Material3Provider data-testid="inner" theme={innerTheme} colorMode="light">
          <BottomSheet aria-label="Inner" variant="standard" defaultValue="expanded" />
        </Material3Provider>
      </Material3Provider>,
    )

    expect(
      screen.getByTestId('outer').style.getPropertyValue('--m3e-comp-bottom-sheet-container-color'),
    ).toBe('var(--m3e-sys-color-surface)')
    expect(
      screen.getByTestId('inner').style.getPropertyValue('--m3e-comp-bottom-sheet-container-color'),
    ).toBe('var(--m3e-sys-color-primary)')
  })

  it('applies a per-instance peek height as a scoped custom property, not a layout style', () => {
    render(
      <BottomSheet
        aria-label="Details"
        data-testid="sheet"
        variant="standard"
        peekHeight={96}
        defaultValue="partiallyExpanded"
      />,
    )

    const container = screen
      .getByTestId('sheet')
      .querySelector<HTMLElement>('.m3e-bottom-sheet__container')

    expect(container?.style.getPropertyValue('--m3e-comp-bottom-sheet-peek-height')).toBe('96px')
    expect(container?.style.blockSize).toBe('')
  })
})
