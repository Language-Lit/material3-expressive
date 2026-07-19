import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../../src/v1/components/TextArea/TextArea.css', import.meta.url)),
  'utf8',
)

describe('TextArea stylesheet contract', () => {
  it('only layers multiline deltas on top of the shared field chrome', () => {
    expect(css).toContain('textarea.m3e-text-field__input')
    expect(css).toContain('resize: vertical')
    expect(css).not.toContain('.m3e-text-field__label {')
    expect(css).not.toContain('.m3e-text-field__outline {')
  })

  it('top-aligns icons instead of centering them across the full multiline height', () => {
    expect(css).toContain('[data-m3e-multiline="true"] .m3e-text-field__icon')
    expect(css).toContain('inset-block: 0 auto')
  })
})
