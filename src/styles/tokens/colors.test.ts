import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Feature: material3-expressive-lib
 * Property 3: Theme CSS Variables Complete
 *
 * *For any* theme variant (light, dark), all required Material 3 color tokens
 * (primary, secondary, tertiary, error, surface variants, outline variants)
 * shall be defined as CSS custom properties.
 *
 * **Validates: Requirements 2.3, 2.4**
 */
describe('Property 3: Theme CSS Variables Complete', () => {
  // Read the colors.css file content
  const colorsPath = path.resolve(__dirname, './colors.css')
  const colorsContent = fs.readFileSync(colorsPath, 'utf-8')

  // Required M3 color tokens that must be present in both themes
  const requiredColorTokens = [
    // Primary colors
    'primary',
    'on-primary',
    'primary-container',
    'on-primary-container',
    // Secondary colors
    'secondary',
    'on-secondary',
    'secondary-container',
    'on-secondary-container',
    // Tertiary colors
    'tertiary',
    'on-tertiary',
    'tertiary-container',
    'on-tertiary-container',
    // Error colors
    'error',
    'on-error',
    'error-container',
    'on-error-container',
    // Surface colors
    'background',
    'on-background',
    'surface',
    'on-surface',
    'surface-variant',
    'on-surface-variant',
    'surface-dim',
    'surface-bright',
    'surface-container-lowest',
    'surface-container-low',
    'surface-container',
    'surface-container-high',
    'surface-container-highest',
    // Outline colors
    'outline',
    'outline-variant',
    // Inverse colors
    'inverse-surface',
    'inverse-on-surface',
    'inverse-primary',
    // Shadow colors
    'shadow',
    'scrim',
    // Surface tint
    'surface-tint',
  ]

  const themes = ['light', 'dark'] as const

  it('should define all required color tokens for each theme', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...themes),
        fc.constantFrom(...requiredColorTokens),
        (theme, tokenName) => {
          const cssVarName = `--md-sys-color-${tokenName}`
          const themeSelector = `[data-theme='${theme}']`

          // Check that the theme selector exists
          expect(colorsContent).toContain(themeSelector)

          // Extract the theme block content
          const themeRegex = new RegExp(
            `\\[data-theme='${theme}'\\]\\s*\\{([^}]+)\\}`,
            's'
          )
          const themeMatch = colorsContent.match(themeRegex)
          expect(themeMatch).not.toBeNull()

          const themeBlock = themeMatch![1]

          // Check that the CSS variable is defined in the theme block
          expect(themeBlock).toContain(cssVarName)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have valid rgb color values for all tokens', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...themes),
        fc.constantFrom(...requiredColorTokens),
        (theme, tokenName) => {
          const cssVarName = `--md-sys-color-${tokenName}`

          // Extract the theme block content
          const themeRegex = new RegExp(
            `\\[data-theme='${theme}'\\]\\s*\\{([^}]+)\\}`,
            's'
          )
          const themeMatch = colorsContent.match(themeRegex)
          const themeBlock = themeMatch![1]

          // Find the variable definition and its value
          const varRegex = new RegExp(
            `${cssVarName.replace(/[-]/g, '[-]')}:\\s*([^;]+);`
          )
          const varMatch = themeBlock.match(varRegex)

          // Variable must exist
          expect(varMatch).not.toBeNull()

          // Value must be a valid rgb() format
          const value = varMatch![1].trim()
          expect(value).toMatch(/^rgb\(\d+\s+\d+\s+\d+\)$/)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should support both light and dark themes via data-theme attribute', () => {
    fc.assert(
      fc.property(fc.constantFrom(...themes), (theme) => {
        const themeSelector = `[data-theme='${theme}']`
        expect(colorsContent).toContain(themeSelector)
        return true
      }),
      { numRuns: 100 }
    )
  })
})
