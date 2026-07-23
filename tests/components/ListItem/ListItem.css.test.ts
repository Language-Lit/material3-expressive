import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/ListItem/ListItem.css', import.meta.url),
  ),
  'utf8',
)

describe('ListItem stylesheet contract', () => {
  it('uses only token-backed colors, shapes, elevation, geometry, and motion', () => {
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
    expect(css).not.toMatch(/\b(?:rgb|hsl)a?\(/i)
    for (const marker of [
      '--m3e-comp-list-item-container-color',
      '--m3e-comp-list-item-container-shape',
      '--m3e-comp-list-item-container-shadow',
      '--m3e-comp-list-item-one-line-container-height',
      '--m3e-comp-list-item-two-line-container-height',
      '--m3e-comp-list-item-three-line-container-height',
      '--m3e-comp-list-item-content-padding-inline',
      '--m3e-comp-list-item-content-padding-block',
      '--m3e-comp-list-item-internal-spacing',
      '--m3e-sys-motion-expressive-default-effects-duration',
      '--m3e-sys-motion-expressive-fast-spatial-duration',
    ]) {
      expect(css).toContain(marker)
    }
  })

  it('preserves one-, two-, and three-line sizing and sourced slot typography', () => {
    expect(css).toContain('[data-m3e-lines="2"]')
    expect(css).toContain('[data-m3e-lines="3"]')
    expect(css).toContain('align-items: start')
    expect(css).toContain('--m3e-sys-typescale-baseline-body-large-font-family')
    expect(css).toContain('--m3e-sys-typescale-baseline-body-medium-font-family')
    expect(css).toContain('--m3e-sys-typescale-baseline-title-medium-font-family')
    expect(css).toContain('--m3e-sys-typescale-baseline-label-small-font-family')
    expect(css).toContain('overflow-wrap: anywhere')
    expect(css).toContain('minmax(0, 1fr)')
  })

  it('preserves segmented gap and first, middle, last, and only logical corners', () => {
    for (const position of ['only', 'first', 'middle', 'last']) {
      expect(css).toContain(`[data-m3e-position="${position}"]`)
    }
    expect(css).toContain('--m3e-comp-list-item-segmented-gap')
    expect(css).toContain('--m3e-comp-list-item-segmented-outer-shape')
    expect(css).toContain('border-start-start-radius:')
    expect(css).toContain('border-start-end-radius:')
    expect(css).toContain('border-end-start-radius:')
    expect(css).toContain('border-end-end-radius:')
    expect(css).toContain(':where(')
  })

  it('covers hover, focus, selection, press, drag, disabled, and their source precedence', () => {
    for (const marker of [
      ':hover',
      ':focus-visible',
      ':has(.m3e-list-item__input:checked)',
      ':active',
      '[data-m3e-dragged="true"]',
      '[data-m3e-disabled="true"]',
      '--m3e-comp-list-item-hovered-container-shape',
      '--m3e-comp-list-item-focused-container-shape',
      '--m3e-comp-list-item-selected-container-shape',
      '--m3e-comp-list-item-pressed-container-shape',
      '--m3e-comp-list-item-reorder-dragged-container-shape',
      '--m3e-comp-list-item-reorder-dragged-container-shadow',
      'var(--m3e-sys-state-hover)',
      'var(--m3e-sys-state-focus)',
      'var(--m3e-sys-state-pressed)',
      'color-mix(',
    ]) {
      expect(css).toContain(marker)
    }
    expect(css.indexOf('[data-m3e-dragged="true"]')).toBeLessThan(
      css.indexOf('[data-m3e-interaction="action"]:active'),
    )
    const hover = css.indexOf('):hover {')
    const focus = css.indexOf('[data-m3e-interaction="action"]:focus-visible')
    const selected = css.indexOf(':has(.m3e-list-item__input:checked) {')
    const dragged = css.indexOf('[data-m3e-dragged="true"] {')
    const pressed = css.indexOf('[data-m3e-interaction="action"]:active')
    const disabled = css.indexOf('[data-m3e-disabled="true"] {')
    expect(hover).toBeGreaterThan(-1)
    expect(hover).toBeLessThan(focus)
    expect(focus).toBeLessThan(selected)
    expect(selected).toBeLessThan(dragged)
    expect(dragged).toBeLessThan(pressed)
    expect(pressed).toBeLessThan(disabled)
  })

  it('keeps the invisible native input over the whole row', () => {
    expect(css).toContain('.m3e-list-item__input')
    expect(css).toContain('inset: 0')
    expect(css).toContain('position: absolute')
    expect(css).toContain('opacity: 0')
    expect(css).toContain('z-index: 2')
    expect(css).toContain('touch-action: manipulation')
  })

  it('uses logical layout and durable precision, reduced-motion, and forced-color paths', () => {
    expect(css).toContain('@media (pointer: fine)')
    expect(css).toContain('--m3e-comp-list-item-precision-pointer-content-padding-block')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('background: Highlight')
    expect(css).toContain('color: GrayText')
    expect(css).not.toMatch(
      /^\s*(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    )
  })
})
