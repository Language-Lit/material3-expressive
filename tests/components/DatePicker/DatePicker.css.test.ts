import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defaultDatePickerTokens } from '../../../src/tokens/defaults/date-picker'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/DatePicker/DatePicker.css', import.meta.url)),
  'utf8',
)

describe('DatePicker stylesheet contract', () => {
  it('uses every registered picker token and keeps every picker variable registered', () => {
    const registered = Object.keys(defaultDatePickerTokens.tokens)
    const used = [...css.matchAll(/--m3e-comp-date-picker-([a-z0-9-]+)/g)].map((match) => match[1])
    expect(new Set(used)).toEqual(new Set(registered))
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
    expect(css).not.toContain('!important')
  })

  it('uses public Dialog and Button aliases for composed geometry and color', () => {
    expect(css).toContain('--m3e-comp-dialog-container-viewport-margin')
    expect(css).toContain('--m3e-comp-button-extra-small-container-height')
    expect(css).toContain('--m3e-comp-button-filled-container-color')
    expect(css).not.toContain('.m3e-button__')
  })

  it('preserves sourced geometry and a non-overlapping narrow-viewport fallback', () => {
    expect(defaultDatePickerTokens.tokens['calendar-horizontal-padding'].value).toBe('12px')
    expect(defaultDatePickerTokens.tokens['navigation-height'].value).toBe('56px')
    expect(defaultDatePickerTokens.tokens['minimum-interactive-target'].value).toEqual({
      $ref: 'sys.density.minimumInteractiveTarget',
    })
    expect(defaultDatePickerTokens.tokens['date-container-width'].value).toBe('40px')
    expect(css).toContain('@media (max-width: 359px)')
    expect(css).toContain('var(--m3e-comp-date-picker-compact-interactive-target)')
    expect(css).toContain('[data-m3e-range-start="true"]:not([data-m3e-range-end="true"])::before')
    expect(css).toContain('inset-inline: 50% 0')
    expect(css).toContain('left: 50%')
  })

  it('defines reduced-motion and forced-color outcomes', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('HighlightText')
  })
})
