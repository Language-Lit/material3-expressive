import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/Divider/Divider.css', import.meta.url)),
  'utf8',
)

describe('Divider stylesheet contract', () => {
  it('maps the sourced color and thickness through component variables only', () => {
    expect(css).toContain('var(--m3e-comp-divider-color)')
    expect(css).toContain('var(--m3e-comp-divider-thickness)')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('paints the line as a filled box rather than a border', () => {
    expect(css).toContain('background-color: var(--m3e-comp-divider-color)')
    expect(css).toContain('border: 0')
  })

  it('neutralises the user-agent presentation of hr and li', () => {
    expect(css).toContain('margin: 0')
    expect(css).toContain('padding: 0')
    expect(css).toContain('display: block')
    expect(css).toContain('list-style: none')
  })

  it('gives the horizontal orientation a thickness on the block axis', () => {
    expect(css).toContain('.m3e-divider[data-m3e-orientation="horizontal"]')
    expect(css).toMatch(
      /\[data-m3e-orientation="horizontal"\]\s*\{[^}]*block-size:\s*var\(--m3e-comp-divider-thickness\)/,
    )
  })

  it('gives the vertical orientation a thickness on the inline axis', () => {
    expect(css).toContain('.m3e-divider[data-m3e-orientation="vertical"]')
    expect(css).toMatch(
      /\[data-m3e-orientation="vertical"\]\s*\{[^}]*inline-size:\s*var\(--m3e-comp-divider-thickness\)/,
    )
  })

  it('fills its length by stretching rather than a percentage, so margin insets compose', () => {
    expect(css).toMatch(
      /\[data-m3e-orientation="horizontal"\]\s*\{[^}]*align-self:\s*stretch/,
    )
    expect(css).toMatch(
      /\[data-m3e-orientation="vertical"\]\s*\{[^}]*align-self:\s*stretch/,
    )
    expect(css).not.toMatch(/(?:block|inline)-size:\s*100%/)
  })

  it('resists shrinking inside a flex parent', () => {
    expect(css).toContain('flex: none')
  })

  it('uses logical properties so the two orientations survive a writing-mode change', () => {
    expect(css).not.toMatch(/(?<!-)\b(?:width|height):/)
    expect(css).not.toMatch(/\bmargin-(?:left|right|top|bottom):/)
  })

  it('keeps the line visible in forced colors, where author backgrounds are overridden', () => {
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('background-color: CanvasText')
    expect(css).toContain('forced-color-adjust: none')
  })

  it('declares its rules in the shared component layer', () => {
    expect(css.trimStart().startsWith('@layer m3e.components')).toBe(true)
  })
})
