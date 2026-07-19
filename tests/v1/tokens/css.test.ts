import { defaultTokenSet, generateTokenCss } from '../../../src/v1/tokens'
import { generateTokenStyle } from '../../../src/v1/tokens/css'

describe('token CSS generation', () => {
  const css = generateTokenCss(defaultTokenSet)

  it('is deterministic and fully namespaced', () => {
    expect(generateTokenCss(defaultTokenSet)).toBe(css)
    expect(css).toContain('@layer m3e.tokens')
    expect(css).not.toContain('--md-')
    expect(css).not.toMatch(/--(?!m3e-)[a-z]/)
  })

  it('emits reference and system layers for all color modes', () => {
    expect(css).toContain('--m3e-ref-palette-primary-40: #6750a4;')
    expect(css).toContain('--m3e-sys-color-primary: var(--m3e-ref-palette-primary-40);')
    expect(css).toContain('[data-m3e-color-mode="light"], [data-m3e-color-mode="system"]')
    expect(css).toContain('[data-m3e-color-mode="dark"]')
    expect(css).toContain('.m3e-theme[data-m3e-color-mode="system"]')
    expect(css).toContain('--m3e-theme-color-dark-primary: var(--m3e-ref-palette-primary-80);')
    expect(css).toContain('@media (prefers-color-scheme: dark)')
  })

  it('emits typography, shape, motion, elevation, state, and density tokens', () => {
    expect(css).toContain('--m3e-sys-typescale-emphasized-display-large-font-weight')
    expect(css).toContain('--m3e-sys-shape-corner-extra-extra-large: 48px;')
    expect(css).toContain('--m3e-sys-motion-expressive-fast-spatial-damping-ratio: 0.6;')
    expect(css).toContain('--m3e-sys-motion-expressive-default-effects-duration: 231ms;')
    expect(css).toContain('--m3e-sys-motion-expressive-default-effects-easing: linear(')
    expect(css).toMatch(
      /--m3e-sys-motion-expressive-default-spatial-easing: linear\([^;]*1\.01/,
    )
    expect(css).toContain('--m3e-sys-elevation-level0-shadow:')
    expect(css).toContain('--m3e-sys-state-hover: 0.08;')
    expect(css).toContain('--m3e-sys-density-minimum-interactive-target: 48px;')
    expect(css).toContain(
      '--m3e-comp-surface-container-color: var(--m3e-sys-color-surface);',
    )
    expect(css).toContain(
      '--m3e-comp-surface-container-shadow: var(--m3e-sys-elevation-level0-shadow);',
    )
    expect(css).toContain('--m3e-comp-icon-size: 24px;')
    expect(css).toContain('--m3e-comp-icon-symbol-roundness: 50;')
    expect(css).toContain('--m3e-comp-button-extra-small-container-height: 32px;')
    expect(css).toContain('--m3e-comp-button-extra-large-container-height: 136px;')
    expect(css).toContain('--m3e-comp-icon-button-extra-small-container-width-narrow: 28px;')
    expect(css).toContain('--m3e-comp-icon-button-extra-large-container-width-wide: 184px;')
    expect(css).toContain('--m3e-comp-floating-action-button-medium-container-size: 80px;')
    expect(css).toContain('--m3e-comp-floating-action-button-toggle-selected-icon-size: 20px;')
    expect(css).toContain(
      '--m3e-comp-card-filled-container-color: var(--m3e-sys-color-surface-container-highest);',
    )
    expect(css).toContain(
      '--m3e-comp-card-elevated-hover-container-shadow: var(--m3e-sys-elevation-level2-shadow);',
    )
    expect(css).toContain('--m3e-comp-card-outlined-outline-width: 1px;')
  })

  it('contains no unresolved custom-property references', () => {
    const definitions = new Set(
      [...css.matchAll(/(--m3e-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
    )
    expect(definitions.size).toBe(1034)
    for (const match of css.matchAll(/var\(\s*(--m3e-[a-z0-9-]+)/g)) {
      expect(definitions.has(match[1]), match[1]).toBe(true)
    }
  })

  it('creates deterministic React-free custom-property maps for a resolved mode', () => {
    const style = generateTokenStyle(defaultTokenSet, 'dark')
    expect(style['--m3e-sys-color-primary']).toBe('var(--m3e-ref-palette-primary-80)')
    expect(style['--m3e-sys-density-scale']).toBe('0')
    expect(Object.isFrozen(style)).toBe(true)
    expect(generateTokenStyle(defaultTokenSet, 'dark')).toEqual(style)
  })
})
