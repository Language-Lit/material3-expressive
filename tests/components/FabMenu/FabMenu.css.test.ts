import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const css = readFileSync(
  fileURLToPath(new URL('../../../src/components/FabMenu/FabMenu.css', import.meta.url)),
  'utf8',
)

describe('FabMenu stylesheet contract', () => {
  it('maps sourced color and geometry through stable component variables', () => {
    expect(css).toContain('var(--m3e-comp-fab-menu-trigger-container-color-collapsed)')
    expect(css).toContain('var(--m3e-comp-fab-menu-trigger-container-color-expanded)')
    expect(css).toContain('var(--m3e-comp-fab-menu-trigger-shape-collapsed)')
    expect(css).toContain('var(--m3e-comp-fab-menu-trigger-shape-expanded)')
    expect(css).toContain('var(--m3e-comp-fab-menu-item-container-color)')
    expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
  })

  it('does not animate the trigger size between collapsed and expanded, only shape/color/icon-size', () => {
    expect(css).not.toMatch(/\.m3e-fab-menu__trigger\s*\{[^}]*\btransition:[^}]*\b(width|height|inline-size|block-size)\b/)
    expect(css).toContain('transition:')
    expect(css).toContain('border-radius')
  })

  it('stages each item slot with a per-item transition-delay set from the component', () => {
    expect(css).toContain('.m3e-fab-menu__item-slot')
    expect(css).toContain('transition-delay')
  })

  it('cross-fades the trigger icon between collapsed and expanded state', () => {
    expect(css).toContain('[data-m3e-icon="default"]')
    expect(css).toContain('[data-m3e-icon="close"]')
  })

  it('becomes immediate under reduced motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion: reduce)')
    expect(css).toContain('transition: none')
  })

  it('keeps every part visibly distinct in forced colors', () => {
    expect(css).toContain('@media (forced-colors: active)')
    expect(css).toContain('ButtonText')
    expect(css).toContain('forced-color-adjust: none')
  })
})
