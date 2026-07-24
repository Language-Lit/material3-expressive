import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/AppBar/AppBar.css', import.meta.url)),
  'utf8',
)

describe('AppBar stylesheet contract', () => {
  it('maps every sourced value through component variables only', () => {
    for (const token of [
      'container-color',
      'on-scroll-container-color',
      'leading-icon-color',
      'title-color',
      'trailing-icon-color',
      'subtitle-color',
      'container-height',
      'medium-container-height',
      'medium-flexible-container-height',
      'medium-flexible-subtitle-container-height',
      'large-container-height',
      'large-flexible-container-height',
      'large-flexible-subtitle-container-height',
      'horizontal-padding',
      'title-inset',
      'medium-title-bottom-padding',
      'large-title-bottom-padding',
    ]) {
      expect(css).toContain(`var(--m3e-comp-app-bar-${token})`)
    }
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('pins the coupled bar with position: sticky, the platform pinning', () => {
    expect(css).toMatch(/\[data-m3e-scroll-behavior="pinned"\][\s\S]*?position:\s*sticky/)
    expect(css).toContain('inset-block-start: 0')
  })

  it('swaps a single-row bar container color on the scrolled flag', () => {
    expect(css).toMatch(
      /\[data-m3e-size="small"\]\[data-m3e-scrolled\]\s*\{[^}]*background-color:\s*var\(--m3e-comp-app-bar-on-scroll-container-color\)/,
    )
  })

  it('blends a two-row bar through an overlay whose opacity is the fraction', () => {
    expect(css).toMatch(
      /:not\(\[data-m3e-size="small"\]\)::before\s*\{[^}]*opacity:\s*var\(--m3e-app-bar-collapsed-fraction/,
    )
    // Behind in-flow content, above the bar's own background.
    expect(css).toMatch(/::before\s*\{[^}]*z-index:\s*-1/)
    expect(css).toContain('isolation: isolate')
  })

  it('translates an enter-always bar by the accumulated offset', () => {
    expect(css).toMatch(
      /\[data-m3e-scroll-behavior="enterAlways"\]\s*\{[^}]*translateY\(calc\(-1 \* var\(--m3e-app-bar-offset/,
    )
  })

  it('transitions only while settling, so the bar tracks scroll exactly', () => {
    expect(css).toMatch(/\[data-m3e-settling\]\s*\{[^}]*transition:[^}]*transform/)
    // The base enterAlways rule carries no transform transition of its own.
    const enterAlwaysRule = css.match(
      /\.m3e-app-bar\[data-m3e-scroll-behavior="enterAlways"\]\s*\{[^}]*\}/,
    )?.[0]
    expect(enterAlwaysRule).toBeDefined()
    expect(enterAlwaysRule).not.toContain('transition')
  })

  it('shrinks the expanded row over the sourced collapse range', () => {
    expect(css).toMatch(
      /__expanded-row\s*\{[^}]*block-size:\s*calc\(\s*var\(--m3e-app-bar-collapse-range\)\s*\*\s*\(1 - var\(--m3e-app-bar-collapsed-fraction/,
    )
    // One sourced range per tier combination.
    expect(css.match(/--m3e-app-bar-collapse-range:\s*calc\(/g)).toHaveLength(6)
  })

  it('fades the two titles in opposite directions', () => {
    expect(css).toMatch(/opacity:\s*var\(--m3e-app-bar-top-title-alpha/)
    expect(css).toMatch(/opacity:\s*calc\(1 - var\(--m3e-app-bar-collapsed-fraction/)
  })

  it('insets an icon-less title with the sourced 12px on top of the 4px padding', () => {
    expect(css).toMatch(
      /__title-group:first-child\s*\{[^}]*margin-inline-start:\s*var\(--m3e-comp-app-bar-title-inset\)/,
    )
    expect(css).toMatch(/__row\s*\{[^}]*padding-inline:\s*var\(--m3e-comp-app-bar-horizontal-padding\)/)
  })

  it('applies the sourced per-tier expanded typography', () => {
    expect(css).toContain('--m3e-sys-typescale-baseline-title-large-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-headline-small-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-headline-medium-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-display-small-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-label-medium-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-label-large-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-title-medium-font-size')
  })

  it('consumes semantic motion tokens rather than arbitrary durations', () => {
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-effects-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-spatial-duration)')
    expect(css).not.toMatch(/transition:[^;]*\d+m?s/)
  })

  it('keeps collapse state under reduced motion and drops only the transitions', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*?transition:\s*none/)
    // The fraction-driven rules live outside the media query, so state
    // still applies.
    const reduced = css.slice(css.indexOf('@media (prefers-reduced-motion'))
    expect(reduced).not.toContain('--m3e-app-bar-collapsed-fraction:')
  })

  it('uses logical properties so the bar survives a writing-mode change', () => {
    expect(css).not.toMatch(/(?<!-)\b(?:width|height):/)
    expect(css).not.toMatch(/\bmargin-(?:left|right|top|bottom):/)
    expect(css).not.toMatch(/\bpadding-(?:left|right|top|bottom):/)
  })

  it('keeps the band visible in forced colors', () => {
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('border-block-end: 1px solid CanvasText')
  })

  it('declares its rules in the shared component layer', () => {
    expect(css.trimStart().startsWith('@layer m3e.components')).toBe(true)
  })
})
