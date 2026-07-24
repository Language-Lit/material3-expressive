import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/Badge/Badge.css', import.meta.url)),
  'utf8',
)

describe('Badge stylesheet', () => {
  it('is authored inside the shared component cascade layer', () => {
    expect(css.startsWith('@layer m3e.components {')).toBe(true)
  })

  it('paints the container and label from component tokens only', () => {
    expect(css).toContain('background-color: var(--m3e-comp-badge-color)')
    expect(css).toContain('color: var(--m3e-comp-badge-label-color)')
    expect(css).toContain('border-radius: var(--m3e-comp-badge-shape)')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
  })

  it('separates the two variants by the data attribute the component emits', () => {
    expect(css).toMatch(/\[data-m3e-variant="small"\]\s*\{[^}]*min-block-size/)
    expect(css).toMatch(/\[data-m3e-variant="large"\]\s*\{[^}]*min-block-size/)
  })

  it('applies the content padding only to the variant that has content', () => {
    const large = css.slice(css.indexOf('[data-m3e-variant="large"]'))
    const small = css.slice(
      css.indexOf('[data-m3e-variant="small"]'),
      css.indexOf('[data-m3e-variant="large"]'),
    )

    expect(large).toContain('padding-inline: var(--m3e-comp-badge-large-horizontal-padding)')
    expect(small).not.toContain('padding-inline')
  })

  it('reads the label typescale from the foundation rather than a second token', () => {
    expect(css).toContain('var(--m3e-sys-typescale-baseline-label-small-font-size)')
    expect(css).not.toContain('--m3e-comp-badge-label-text-font')
  })

  it('positions the badge with logical properties so RTL mirrors it', () => {
    expect(css).toContain('inset-inline-start:')
    expect(css).toContain('inset-block-start:')
    expect(css).not.toMatch(/(?:^|\s)(?:left|right|top|bottom):/m)
  })

  it('takes the badge out of flow so the anchor measures only its content', () => {
    expect(css).toMatch(/\.m3e-badge-anchor\s*\{[^}]*position:\s*relative/)
    expect(css).toMatch(/\.m3e-badge-anchor__badge\s*\{[^}]*position:\s*absolute/)
  })

  it('repaints in forced-colors mode, where an author background is dropped', () => {
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toMatch(/forced-colors: active\)\s*\{[^}]*\{[^}]*background-color:\s*CanvasText/)
  })
})
