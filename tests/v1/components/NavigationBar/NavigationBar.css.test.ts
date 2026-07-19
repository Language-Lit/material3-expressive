import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../../src/v1/components/NavigationBar/NavigationBar.css', import.meta.url)),
  'utf8',
)

describe('NavigationBar stylesheet contract', () => {
  it('maps sourced container/indicator geometry and color through stable component variables', () => {
    expect(css).toContain('var(--m3e-comp-navigation-bar-container-color)')
    expect(css).toContain('var(--m3e-comp-navigation-bar-item-active-indicator-color)')
    expect(css).toContain('var(--m3e-comp-navigation-bar-item-active-indicator-shape)')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('drives the active pill from a data attribute on each independently selected item', () => {
    expect(css).toContain('[data-m3e-selected="true"]')
    expect(css).toContain('transform: scale(1)')
  })

  it('uses the shared state-layer system for hover/focus/pressed item feedback', () => {
    expect(css).toContain('var(--m3e-sys-state-hover)')
    expect(css).toContain('var(--m3e-sys-state-focus)')
    expect(css).toContain('var(--m3e-sys-state-pressed)')
    expect(css).toContain('background: currentColor')
  })

  it('dims a disabled item using color-mix against its own disabled opacity token', () => {
    expect(css).toContain('[aria-disabled="true"]')
    expect(css).toContain('color-mix(')
    expect(css).toContain('var(--m3e-comp-navigation-bar-item-disabled-opacity)')
    expect(css).toContain('pointer-events: none')
  })

  it('uses the theme’s own label-medium typescale role directly', () => {
    expect(css).toContain('var(--m3e-sys-typescale-baseline-label-medium-font-size)')
  })

  it('uses an immediate reduced-motion outcome', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
  })

  it('uses logical layout and retains a visible boundary in forced colors', () => {
    expect(css).toContain('inline-size')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('CanvasText')
    expect(css).not.toMatch(
      /^\s*(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    )
  })
})
