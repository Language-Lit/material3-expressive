import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/SearchBar/SearchBar.css', import.meta.url)),
  'utf8',
)

describe('SearchBar stylesheet contract', () => {
  it('maps every sourced value through component variables only', () => {
    for (const token of [
      'container-color',
      'scrolled-container-color',
      'container-height',
      'container-shape',
      'input-text-color',
      'leading-icon-color',
      'supporting-text-color',
      'trailing-icon-color',
      'avatar-shape',
      'avatar-size',
      'focus-ring-color',
      'min-width',
      'max-width',
      'input-horizontal-padding',
      'icon-horizontal-padding',
      'vertical-padding',
      'app-bar-horizontal-padding',
      'app-bar-vertical-padding',
      'app-bar-search-padding',
      'view-divider-color',
      'view-docked-container-shape',
      'view-full-screen-container-shape',
      'view-full-screen-contained-container-color',
      'view-docked-dropdown-shape',
      'view-docked-dropdown-gap',
      'view-docked-min-height',
      'view-scrim-color',
      'view-scrim-opacity',
    ]) {
      expect(css).toContain(`var(--m3e-comp-search-bar-${token})`)
    }
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('takes its app-bar colors from the app-bar registration the source reads', () => {
    for (const token of [
      'container-color',
      'on-scroll-container-color',
      'leading-icon-color',
      'trailing-icon-color',
    ]) {
      expect(css).toContain(`var(--m3e-comp-app-bar-${token})`)
    }
  })

  it('takes its disabled colors from the text-field roles the source reads', () => {
    expect(css).toContain('var(--m3e-comp-text-field-disabled-input-color)')
    expect(css).toContain('var(--m3e-comp-text-field-disabled-input-opacity)')
    expect(css).toContain('var(--m3e-comp-text-field-disabled-leading-icon-color)')
    expect(css).toContain('var(--m3e-comp-text-field-disabled-trailing-icon-color)')
  })

  it('clamps the sourced 360px minimum to the available width', () => {
    expect(css).toMatch(
      /min-inline-size:\s*min\(var\(--m3e-comp-search-bar-min-width\),\s*100%\)/,
    )
    expect(css).toMatch(/max-inline-size:\s*var\(--m3e-comp-search-bar-max-width\)/)
  })

  it('suppresses the WebKit search decorations the trailing slot replaces', () => {
    expect(css).toContain('::-webkit-search-cancel-button')
    expect(css).toContain('::-webkit-search-decoration')
  })

  it('draws the focus indication as the sourced inset ring on the container', () => {
    expect(css).toMatch(
      /__bar:has\(\.m3e-search-bar__input:focus-visible\)\s*\{[^}]*outline:/,
    )
    expect(css).toContain('outline-offset: var(--m3e-comp-search-bar-focus-ring-offset)')
  })

  it('paints the full-screen surface as the whole viewport with no corners', () => {
    expect(css).toMatch(
      /__full-screen\s*\{[^}]*border-radius:\s*var\(--m3e-comp-search-bar-view-full-screen-container-shape\)/,
    )
    expect(css).toMatch(/__full-screen\s*\{[^}]*inset:\s*0/)
    expect(css).toMatch(/__full-screen:not\(\[open\]\)\s*\{\s*display:\s*none/)
  })

  it('composes the sourced 72px divided full-screen header from the bar and its padding', () => {
    // 8 + 56 + 8: SearchBarVerticalPadding above and below the 56px field.
    expect(css).toMatch(
      /\[data-m3e-appearance="divided"\][\s\S]*?__bar\s*\{[\s\S]*?margin-block:\s*var\(--m3e-comp-search-bar-vertical-padding\)/,
    )
    expect(css).toMatch(
      /\[data-m3e-appearance="divided"\][\s\S]*?__bar\s*\{[\s\S]*?background-color:\s*transparent/,
    )
  })

  it('keeps the contained bar filled against its own backdrop', () => {
    expect(css).toMatch(
      /\[data-m3e-appearance="contained"\][\s\S]*?__full-screen\s*\{[\s\S]*?background-color:\s*var\(\s*--m3e-comp-search-bar-view-full-screen-contained-container-color\s*\)/,
    )
  })

  it('bounds the docked results by the sourced screen ratios and minimum height', () => {
    expect(css).toMatch(/max-block-size:\s*calc\(100dvh \* 2 \/ 3\)/)
    expect(css).toMatch(/max-block-size:\s*calc\(100dvh \/ 2\)/)
    expect(css.match(/var\(--m3e-comp-search-bar-view-docked-min-height\)/g)).toHaveLength(2)
  })

  it('separates the contained drop-down from the bar by the sourced gap', () => {
    expect(css).toMatch(
      /margin-block-start:\s*var\(--m3e-comp-search-bar-view-docked-dropdown-gap\)/,
    )
    expect(css).toMatch(
      /border-radius:\s*var\(--m3e-comp-search-bar-view-docked-dropdown-shape\)/,
    )
  })

  it('layers the scrim under the panel it dims for', () => {
    const scrim = css.match(/\.m3e-search-bar__scrim\s*\{[^}]*\}/)?.[0]
    const panel = css.match(/\.m3e-search-bar__panel\s*\{[^}]*\}/)?.[0]
    expect(scrim).toContain('z-index: 1')
    expect(panel).toContain('z-index: 2')
    expect(scrim).toContain('position: fixed')
  })

  it('pins a coupled search app bar with position: sticky, the platform pinning', () => {
    expect(css).toMatch(
      /\.m3e-search-app-bar\[data-m3e-scroll-behavior="pinned"\][\s\S]*?position:\s*sticky/,
    )
  })

  it('recolors both the app bar and its search container once content overlaps', () => {
    expect(css).toMatch(
      /\.m3e-search-app-bar\[data-m3e-scrolled\]\s*\{[^}]*background-color:\s*var\(--m3e-comp-app-bar-on-scroll-container-color\)/,
    )
    expect(css).toMatch(
      /\.m3e-search-app-bar\[data-m3e-scrolled\]\s+\.m3e-search-bar__bar\s*\{[^}]*background-color:\s*var\(--m3e-comp-search-bar-scrolled-container-color\)/,
    )
  })

  it('translates an enter-always search app bar by its own namespaced offset', () => {
    expect(css).toMatch(
      /\[data-m3e-scroll-behavior="enterAlways"\]\s*\{[^}]*translateY\(calc\(-1 \* var\(--m3e-search-app-bar-offset/,
    )
    expect(css).not.toContain('--m3e-app-bar-offset')
  })

  it('applies the sourced body-large input typography', () => {
    expect(css).toContain('--m3e-sys-typescale-baseline-body-large-font-size')
    expect(css).toContain('--m3e-sys-typescale-baseline-body-large-line-height')
  })

  it('consumes semantic motion tokens rather than arbitrary durations', () => {
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-effects-duration)')
    expect(css).not.toMatch(/transition:[^;]*\d+m?s/)
  })

  it('drops only the transitions under reduced motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/prefers-reduced-motion: reduce\)[\s\S]*?transition:\s*none/)
  })

  it('uses logical properties so the bar survives a writing-mode change', () => {
    expect(css).not.toMatch(/(?<!-)\b(?:width|height):/)
    expect(css).not.toMatch(/\bmargin-(?:left|right|top|bottom):/)
    expect(css).not.toMatch(/\bpadding-(?:left|right|top|bottom):/)
  })

  it('keeps every surface visible in forced colors', () => {
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toMatch(/forced-colors: active\)[\s\S]*?border:\s*1px solid CanvasText/)
    expect(css).toMatch(/forced-colors: active\)[\s\S]*?background-color:\s*CanvasText/)
  })

  it('declares its rules in the shared component layer', () => {
    expect(css.trimStart().startsWith('@layer m3e.components')).toBe(true)
  })
})
