import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../../src/v1/components/TextField/TextField.css', import.meta.url)),
  'utf8',
)

describe('TextField stylesheet contract', () => {
  it('maps sourced geometry through stable component variables', () => {
    expect(css).toContain('var(--m3e-comp-text-field-min-container-block-size)')
    expect(css).toContain('var(--m3e-comp-text-field-min-container-inline-size)')
    expect(css).toContain('var(--m3e-comp-text-field-minimum-interactive-target)')
    expect(css).toContain('var(--m3e-comp-text-field-content-padding)')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('drives the floating label and border weight from the input’s own focus/placeholder-shown state, not a React-rendered attribute', () => {
    expect(css).toContain('.m3e-text-field__input:focus ~ .m3e-text-field__label')
    expect(css).toContain('.m3e-text-field__input:not(:placeholder-shown) ~ .m3e-text-field__label')
    expect(css).toContain('.m3e-text-field__input:focus ~ .m3e-text-field__indicator')
    expect(css).toContain('.m3e-text-field__input:focus ~ .m3e-text-field__outline')
    expect(css).toContain('.m3e-text-field__input:disabled ~ .m3e-text-field__label')
    expect(css).not.toMatch(/\[data-m3e-state=/)
  })

  it('reads error and disabled from root attributes, the only states unreachable by a sibling combinator', () => {
    expect(css).toContain('[data-m3e-error="true"] .m3e-text-field__label')
    expect(css).toContain('[data-m3e-error="true"] .m3e-text-field__supporting-text')
    expect(css).toContain('[data-m3e-disabled="true"] .m3e-text-field__supporting-text')
  })

  it('interpolates the label between the baseline body-large and body-small typescale roles', () => {
    expect(css).toContain('var(--m3e-sys-typescale-baseline-body-large-font-size)')
    expect(css).toContain('var(--m3e-sys-typescale-baseline-body-small-font-size)')
    expect(css).toContain('var(--m3e-sys-typescale-baseline-body-large-line-height)')
    expect(css).toContain('var(--m3e-sys-typescale-baseline-body-small-line-height)')
  })

  it('draws the outlined notch with a native fieldset/legend instead of a canvas clip', () => {
    expect(css).toContain('.m3e-text-field__outline')
    expect(css).toContain('.m3e-text-field__notch')
    expect(css).toContain('max-inline-size: 1000px')
    expect(css).toContain('visibility: hidden')

    // The browser only applies its special border-cutting layout to a
    // <legend> that is in normal flow — floating or positioning it (even
    // logically, e.g. `float: inline-start`) silently falls back to a
    // plain block box with no border gap, leaving the fieldset's top
    // border drawn straight across wherever the floating label sits.
    const notchRule = css.slice(css.indexOf('.m3e-text-field__notch {'))
    const notchBody = notchRule.slice(0, notchRule.indexOf('}'))
    expect(notchBody).not.toMatch(/\bfloat\s*:/)
    expect(notchBody).not.toMatch(/\bposition\s*:/)
  })

  it('uses the true-alpha color-mix technique for every disabled color', () => {
    expect(css).toContain('color-mix(')
    expect(css).toContain('var(--m3e-comp-text-field-disabled-input-opacity)')
    expect(css).toContain('var(--m3e-comp-text-field-outlined-disabled-outline-opacity)')
  })

  it('uses semantic Expressive motion with an immediate reduced-motion outcome', () => {
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-spatial-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-spatial-easing)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-fast-effects-duration)')
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
  })

  it('uses logical layout and retains visible state in forced colors', () => {
    expect(css).toContain('inline-size:')
    expect(css).toContain('inset-inline')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('Highlight')
    expect(css).toContain('GrayText')
    expect(css).not.toMatch(
      /^\s*(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    )
  })
})
