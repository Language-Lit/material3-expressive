import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultTimePickerTokens } from '../../../src/tokens/defaults/time-picker'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/TimePicker/TimePicker.css', import.meta.url)),
  'utf8',
)

describe('TimePicker stylesheet contract', () => {
  it('resolves every component variable and keeps selectors namespaced', () => {
    const registered = new Set(Object.keys(defaultTimePickerTokens.tokens))
    const used = [...css.matchAll(/--m3e-comp-time-picker-([a-z0-9-]+)/g)].map(
      (match) => match[1],
    )
    expect(used.length).toBeGreaterThan(20)
    for (const name of used) expect(registered.has(name)).toBe(true)
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
    expect(css).not.toContain('!important')
  })

  it('uses public composed-component token aliases without private Button markup', () => {
    expect(css).toContain('--m3e-comp-button-small-container-height')
    expect(css).toContain('--m3e-comp-button-tonal-container-color')
    expect(css).not.toContain('.m3e-button__')
    expect(css).not.toContain('.m3e-text-field__')
  })

  it('matches the sourced BasicTextField geometry with labels below the inputs', () => {
    expect(css).toContain('block-size: var(--m3e-comp-time-picker-time-field-height)')
    expect(css).toContain('inline-size: var(--m3e-comp-time-picker-time-field-width)')
    expect(css).toContain('.m3e-time-picker__time-field-label')
    expect(css).toContain('gap: var(--m3e-comp-time-picker-support-label-offset)')
    expect(css).toContain('var(--m3e-comp-time-picker-input-period-width)')
    expect(css).toContain('var(--m3e-comp-time-picker-input-period-height)')
    expect(css).toContain('direction: ltr')
  })

  it('gives off-five minutes a hidden rest state and a painted selected state', () => {
    expect(css).toContain('[data-m3e-major="false"]:not([aria-checked="true"])')
    expect(css).toContain('pointer-events: none')
    expect(css).toContain('[data-m3e-major="false"][aria-checked="true"]')
    expect(css).toContain('.m3e-time-picker__dial:focus-within')
  })

  it('defines runtime geometry fallbacks plus reduced-motion and forced-color outcomes', () => {
    expect(css).toContain('--m3e-time-picker-selected-index: 0')
    expect(css).toContain('--m3e-time-picker-selected-radius:')
    expect(css).toContain('--m3e-time-picker-index: 0')
    expect(css).toContain('--m3e-time-picker-option-radius:')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('Highlight')
  })

  it('keeps the physical clock face centered in RTL and only forces the numeric display LTR', () => {
    expect(css).toContain('.m3e-time-picker__clock-display {\n    direction: ltr')
    expect(css).toContain('left: 50%')
    expect(css).toContain('top: 50%')
    expect(css).not.toContain('inset-inline-start: 50%')
  })
})
