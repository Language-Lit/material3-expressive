import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../../src/v1/components/Checkbox/Checkbox.css', import.meta.url)),
  'utf8',
)

describe('Checkbox stylesheet contract', () => {
  it('maps sourced geometry through stable component variables', () => {
    expect(css).toContain('var(--m3e-comp-checkbox-container-size)')
    expect(css).toContain('var(--m3e-comp-checkbox-container-shape)')
    expect(css).toContain('var(--m3e-comp-checkbox-outline-width)')
    expect(css).toContain('var(--m3e-comp-checkbox-state-layer-size)')
    expect(css).toContain('var(--m3e-comp-checkbox-checkmark-stroke-width)')
    expect(css).toContain('var(--m3e-comp-checkbox-minimum-interactive-target)')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('covers every resolved state including the first-party disabled roles', () => {
    for (const state of ['checked', 'indeterminate']) {
      expect(css).toContain(`[data-m3e-state="${state}"]`)
    }
    expect(css).toContain('var(--m3e-comp-checkbox-checked-container-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-checked-outline-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-checked-checkmark-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-unchecked-outline-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-disabled-checkmark-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-disabled-checked-container-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-disabled-unchecked-outline-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-disabled-indeterminate-container-color)')
    expect(css).toContain('color-mix(')
  })

  it('reproduces the sourced checkmark polyline and its indeterminate gravitation', () => {
    expect(css).toContain('d: path("M 4.5 9 L 7.2 11.7 L 13.5 5.4")')
    expect(css).toContain('d: path("M 4.5 9 L 9 9 L 13.5 9")')
    expect(css).toContain('stroke-dasharray: var(--m3e-comp-checkbox-checkmark-path-length)')
    expect(css).toContain('var(--m3e-comp-checkbox-checkmark-snap-delay)')
  })

  it('uses semantic Expressive motion with an immediate reduced-motion outcome', () => {
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-spatial-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-spatial-easing)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-effects-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-effects-duration)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
  })

  it('exposes state layers and a visible focus ring', () => {
    expect(css).toContain('var(--m3e-sys-state-hover)')
    expect(css).toContain('var(--m3e-sys-state-focus)')
    expect(css).toContain('var(--m3e-sys-state-pressed)')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('var(--m3e-comp-checkbox-focus-ring-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-checked-state-layer-color)')
    expect(css).toContain('var(--m3e-comp-checkbox-unchecked-state-layer-color)')
  })

  it('uses logical layout and retains visible state in forced colors', () => {
    expect(css).toContain('inline-size:')
    expect(css).toContain('block-size:')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('outline-color: Highlight')
    expect(css).toContain('GrayText')
    expect(css).not.toMatch(
      /^\s*(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    )
  })
})
