import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/BottomSheet/BottomSheet.css', import.meta.url)),
  'utf8',
)

describe('BottomSheet stylesheet contract', () => {
  it('maps every sourced value through component variables only', () => {
    for (const token of [
      'container-color',
      'container-shape',
      'hidden-container-shape',
      'container-shadow',
      'container-max-width',
      'peek-height',
      'drag-handle-color',
      'drag-handle-width',
      'drag-handle-height',
      'drag-handle-shape',
      'drag-handle-spacing',
      'scrim-color',
      'scrim-opacity',
    ]) {
      expect(css).toContain(`var(--m3e-comp-bottom-sheet-${token})`)
    }
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('paints the scrim through the dialog backdrop rather than an author element', () => {
    expect(css).toContain('::backdrop')
    expect(css).toMatch(
      /::backdrop\s*\{[^}]*background-color:\s*var\(--m3e-comp-bottom-sheet-scrim-color\)/,
    )
    expect(css).toMatch(/::backdrop\s*\{[^}]*opacity:\s*var\(--m3e-comp-bottom-sheet-scrim-opacity\)/)
  })

  it('gives the modal root no visible box of its own, so only the sheet paints', () => {
    expect(css).toMatch(/\[data-m3e-variant="modal"\]\s*\{[^}]*background:\s*none/)
    expect(css).toMatch(/\[data-m3e-variant="modal"\]\s*\{[^}]*border:\s*0/)
    expect(css).toMatch(/\[data-m3e-variant="modal"\]\s*\{[^}]*padding:\s*0/)
  })

  it('anchors a modal partially expanded sheet at half its container, as the source does', () => {
    expect(css).toMatch(
      /\[data-m3e-variant="modal"\]\[data-m3e-state="partiallyExpanded"\][\s\S]*?max-block-size:\s*50%/,
    )
  })

  it('rests a standard sheet on the peek height rather than a maximum', () => {
    expect(css).toMatch(
      /\[data-m3e-variant="standard"\]\[data-m3e-state="partiallyExpanded"\][\s\S]*?block-size:\s*var\(--m3e-comp-bottom-sheet-peek-height\)/,
    )
  })

  it('squares the container off in the hidden state, per DockedMinimizedContainerShape', () => {
    const hiddenRules = css.match(/\[data-m3e-state="hidden"\][\s\S]*?\}/g) ?? []
    expect(hiddenRules).toHaveLength(2)
    for (const rule of hiddenRules) {
      expect(rule).toContain('var(--m3e-comp-bottom-sheet-hidden-container-shape)')
    }
  })

  it('consumes the top-corner shape through the shorthand, since it is a four-value token', () => {
    // `CornerExtraLargeTop` is `28px 28px 0px 0px`. A per-corner longhand
    // cannot hold four values: the declaration is invalid and the sheet
    // silently squares off, which the browser audit caught and jsdom cannot.
    expect(css).toContain('border-radius: var(--m3e-comp-bottom-sheet-container-shape)')
    expect(css).not.toMatch(/border-(start|end)-(start|end)-radius:\s*var\(--m3e-comp-bottom-sheet-(container|hidden-container)-shape\)/)
  })

  it('suppresses the settle transition while a pointer drag is in progress', () => {
    expect(css).toMatch(/\[data-m3e-dragging\]\s*\{[^}]*transition:\s*none/)
  })

  it('consumes semantic motion tokens rather than arbitrary durations', () => {
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-spatial-duration)')
    expect(css).toContain('var(--m3e-sys-motion-expressive-default-spatial-easing)')
    expect(css).not.toMatch(/transition:[^;]*\d+m?s/)
  })

  it('stops the settle motion under reduced motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{[\s\S]*?transition:\s*none/)
  })

  it('adapts the sourced bottom window inset to the web safe area', () => {
    expect(css).toContain('padding-block-end: env(safe-area-inset-bottom, 0px)')
  })

  it('keeps the drag handle target at the required size while the bar stays sourced', () => {
    expect(css).toMatch(
      /\.m3e-bottom-sheet__drag-handle\s*\{[^}]*padding-block:\s*var\(--m3e-comp-bottom-sheet-drag-handle-spacing\)/,
    )
    expect(css).toMatch(
      /__drag-handle-bar\s*\{[^}]*inline-size:\s*var\(--m3e-comp-bottom-sheet-drag-handle-width\)/,
    )
    expect(css).toMatch(
      /__drag-handle-bar\s*\{[^}]*block-size:\s*var\(--m3e-comp-bottom-sheet-drag-handle-height\)/,
    )
  })

  it('opts the handle out of browser touch panning so a drag is not stolen by scrolling', () => {
    expect(css).toContain('touch-action: none')
  })

  it('uses logical properties so the sheet survives a writing-mode change', () => {
    expect(css).not.toMatch(/(?<!-)\b(?:width|height):/)
    expect(css).not.toMatch(/\bmargin-(?:left|right|top|bottom):/)
    expect(css).not.toMatch(/\bpadding-(?:left|right|top|bottom):/)
  })

  it('keeps the sheet and its handle visible in forced colors', () => {
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('background-color: CanvasText')
    expect(css).toContain('forced-color-adjust: none')
  })

  it('declares its rules in the shared component layer', () => {
    expect(css.trimStart().startsWith('@layer m3e.components')).toBe(true)
  })
})
