import { defaultTokenSet, generateTokenCss } from '../../../src/v1/tokens'

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
    expect(css).toContain('@media (prefers-color-scheme: dark)')
  })

  it('emits typography, shape, motion, elevation, state, and density tokens', () => {
    expect(css).toContain('--m3e-sys-typescale-emphasized-display-large-font-weight')
    expect(css).toContain('--m3e-sys-shape-corner-extra-extra-large: 48px;')
    expect(css).toContain('--m3e-sys-motion-expressive-fast-spatial-damping-ratio: 0.6;')
    expect(css).toContain('--m3e-sys-elevation-level0-shadow:')
    expect(css).toContain('--m3e-sys-state-hover: 0.08;')
    expect(css).toContain('--m3e-sys-density-minimum-interactive-target: 48px;')
    expect(css).not.toContain('--m3e-comp-')
  })

  it('contains no unresolved custom-property references', () => {
    const definitions = new Set(
      [...css.matchAll(/(--m3e-[a-z0-9-]+)\s*:/g)].map((match) => match[1]),
    )
    expect(definitions.size).toBe(643)
    for (const match of css.matchAll(/var\(\s*(--m3e-[a-z0-9-]+)/g)) {
      expect(definitions.has(match[1]), match[1]).toBe(true)
    }
  })
})
