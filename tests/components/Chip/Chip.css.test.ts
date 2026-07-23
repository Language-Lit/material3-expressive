import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/Chip/Chip.css', import.meta.url)),
  'utf8',
)

describe('Chip stylesheet contract', () => {
  it('maps every source family and supported treatment through stable attributes', () => {
    for (const kind of ['assist', 'filter', 'input', 'suggestion']) {
      expect(css).toContain(`[data-m3e-kind="${kind}"]`)
    }
    for (const variant of ['flat', 'elevated']) {
      expect(css).toContain(`[data-m3e-variant="${variant}"]`)
    }
    expect(css).toContain('[data-m3e-shape="expressive"]')
    expect(css).toContain('[data-m3e-selected="true"]')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('preserves the 32px visual container inside the 48px minimum target', () => {
    expect(css).toContain('var(--m3e-comp-chip-container-height)')
    expect(css).toContain('var(--m3e-comp-chip-minimum-interactive-target)')
    expect(css).toContain('min-block-size:')
    expect(css).toContain('min-inline-size:')
    expect(css).toContain('justify-items: center')
    expect(css).toContain('inline-size: fit-content')
    expect(css).toContain('touch-action: manipulation')
  })

  it('maps the sourced three-child geometry, input padding, and constrained slots', () => {
    expect(css).toContain('var(--m3e-comp-chip-content-padding)')
    expect(css).toContain('var(--m3e-comp-chip-horizontal-spacing)')
    expect(css).toContain('var(--m3e-comp-chip-compact-horizontal-spacing)')
    expect(css).toContain('var(--m3e-comp-chip-input-padding-start)')
    expect(css).toContain('var(--m3e-comp-chip-input-leading-padding-start)')
    expect(css).toContain('var(--m3e-comp-chip-input-avatar-padding-start)')
    expect(css).toContain('var(--m3e-comp-chip-input-trailing-padding-end)')
    expect(css).toContain('var(--m3e-comp-chip-icon-size)')
    expect(css).toContain('var(--m3e-comp-chip-avatar-size)')
    expect(css).toContain('var(--m3e-comp-chip-avatar-shape)')
    expect(css).toContain('[data-m3e-visible="false"]')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).toContain('max-inline-size: min(100%, var(--m3e-comp-chip-maximum-width))')
  })

  it('covers selected, disabled, hover, focus, press, drag, outline, and elevation paths', () => {
    expect(css).toContain(':disabled')
    expect(css).toContain(':hover:not(:disabled)')
    expect(css).toContain(':focus-visible')
    expect(css).toContain(':active:not(:disabled)')
    expect(css).toContain('[data-m3e-dragged="true"]')
    expect(css).toContain('--m3e-comp-chip-assist-elevated-hover-shadow')
    expect(css).toContain('--m3e-comp-chip-filter-flat-hover-shadow')
    expect(css).toContain('--m3e-comp-chip-input-dragged-shadow')
    expect(css).toContain('--m3e-comp-chip-suggestion-elevated-dragged-shadow')
    expect(css).toContain('--m3e-comp-chip-filter-flat-selected-outline-width')
    expect(css).toContain('color-mix(')
    expect(css).toContain('var(--m3e-sys-state-hover)')
    expect(css).toContain('var(--m3e-sys-state-focus)')
    expect(css).toContain('var(--m3e-sys-state-pressed)')
  })

  it('uses source-specific shape and slot motion with an immediate reduced-motion result', () => {
    expect(css).toContain('var(--m3e-comp-chip-expressive-unselected-shape)')
    expect(css).toContain('var(--m3e-comp-chip-expressive-selected-shape)')
    expect(css).toContain('var(--m3e-comp-chip-expressive-pressed-shape)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-spatial-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-effects-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-slow-effects-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-effects-duration)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
  })

  it('uses logical layout and retains state in forced colors', () => {
    expect(css).toContain('padding-inline-start:')
    expect(css).toContain('padding-inline-end:')
    expect(css).toContain('margin-inline-start:')
    expect(css).toContain('margin-inline-end:')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('background: Highlight')
    expect(css).toContain('color: GrayText')
    expect(css).not.toMatch(
      /^\s*(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    )
  })
})
