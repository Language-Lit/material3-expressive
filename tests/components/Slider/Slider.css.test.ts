import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/Slider/Slider.css', import.meta.url),
  ),
  'utf8',
)
const shared = readFileSync(
  fileURLToPath(
    new URL('../../../src/components/Slider/Slider.shared.tsx', import.meta.url),
  ),
  'utf8',
)

describe('Slider stylesheet contract', () => {
  it('maps every sourced dimension through stable component variables', () => {
    for (const token of [
      'minimum-interactive-target',
      'track-height',
      'track-corner-size',
      'track-inside-corner-size',
      'handle-width',
      'handle-height',
      'handle-shape',
      'interacted-handle-width',
      'handle-track-gap',
      'stop-indicator-size',
      'tick-size',
      'inset-focus-ring-padding',
    ]) {
      expect(css).toContain(`--m3e-comp-slider-${token}`)
    }
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('uses the source 4x44 handle, 16px track, 6px gap, and interaction halving path', () => {
    expect(css).toContain('block-size: var(--m3e-comp-slider-handle-height)')
    expect(css).toContain('inline-size: var(--m3e-comp-slider-handle-width)')
    expect(css).toContain('block-size: var(--m3e-comp-slider-track-height)')
    expect(css).toContain('var(--m3e-comp-slider-handle-track-gap)')
    expect(css).toContain('var(--m3e-comp-slider-interacted-handle-width)')
    expect(css).toContain('[data-m3e-active-thumb="single"]')
    expect(css).toContain('[data-m3e-thumb="start"]:focus')
    expect(css).not.toMatch(/:hover[\s\S]{0,180}interacted-handle-width/)
  })

  it('keeps focus padding in track gaps rather than moving the track or thumb anchors', () => {
    expect(css).toContain('--m3e-slider-thumb-gap')
    expect(css).toContain('--m3e-slider-center-gap')
    expect(css).toContain('--m3e-slider-start-gap')
    expect(css).toContain('--m3e-slider-end-gap')
    expect(css).toContain('var(--m3e-comp-slider-inset-focus-ring-padding)')
    expect(css).toContain(':focus-visible')
    expect(css).toContain('var(--m3e-comp-slider-focus-ring-width)')
    expect(css).toContain('var(--m3e-comp-slider-focus-ring-offset)')
    expect(css).toContain('var(--m3e-comp-slider-focus-ring-color)')
  })

  it('uses generated read roles and preserves the crossed tick-color mapping', () => {
    expect(css).toContain('var(--m3e-comp-slider-handle-color)')
    expect(css).toContain('var(--m3e-comp-slider-active-track-color)')
    expect(css).toContain('var(--m3e-comp-slider-inactive-track-color)')
    expect(css).toContain('var(--m3e-comp-slider-active-tick-color)')
    expect(css).toContain('var(--m3e-comp-slider-inactive-tick-color)')
    expect(css).toContain('var(--m3e-comp-slider-disabled-handle-opacity)')
    expect(css).toContain('var(--m3e-sys-color-surface)')
    expect(css).toContain('color-mix(')
  })

  it('projects discrete interior points inside the external corners', () => {
    expect(shared).toContain(
      'var(--m3e-comp-slider-track-corner-size)',
    )
    expect(shared).toContain('const cornerCoefficient = 1 - 2 * fraction')
    expect(shared).toContain(
      'Array.from({ length: bounds.steps + 2 }',
    )
  })

  it('clips ticks and stops to the sourced physical gaps in every direction', () => {
    expect(css).toContain('.m3e-slider__tick-window')
    expect(css).toContain('.m3e-slider__stop-window')
    expect(css).toContain('--m3e-slider-window-start')
    expect(css).toContain('--m3e-slider-window-end')
    expect(css).toContain('mask-image: linear-gradient(')
    expect(css).toContain('to right')
    expect(css).toContain('to left')
    expect(css).toContain('to bottom')
    expect(css).toContain(
      'margin-inline-start: calc(var(--m3e-comp-slider-tick-size) / -2)',
    )
    expect(css).toContain(
      'margin-inline-start: calc(var(--m3e-comp-slider-handle-width) / -2)',
    )
    expect(shared).toContain("startGap: 'center'")
    expect(shared).toContain('buildSingleTickWindows')
    expect(shared).toContain('reverseSegment')
  })

  it('uses logical layout for horizontal, RTL, and vertical tracks', () => {
    expect(css).toContain('inline-size:')
    expect(css).toContain('block-size:')
    expect(css).toContain('inset-inline-start:')
    expect(css).toContain('inset-block-start:')
    expect(css).toContain('[data-m3e-orientation="vertical"]')
    expect(css).not.toMatch(
      /^\s*(?:left|right|width|height|margin-left|margin-right|padding-left|padding-right)\s*:/m,
    )
  })

  it('retains immediate reduced-motion and explicit forced-color outcomes', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('forced-color-adjust: none')
    expect(css).toContain('Highlight')
    expect(css).toContain('GrayText')
    expect(css).toContain('CanvasText')
  })
})
