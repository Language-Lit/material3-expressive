import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as UtilsExports from './index'

/**
 * Feature: material3-expressive-lib
 * Property 6: Correct Utilities Exported
 *
 * *For any* utility in the UI utilities list (spacing, componentsUtils, theme-loader,
 * font-loader), importing from the library's utils export shall successfully resolve
 * that utility. *For any* utility in the application-specific list (lessonCache,
 * languageDetection, etc.), that utility shall NOT be exported.
 *
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
 */
describe('Property 6: Correct Utilities Exported', () => {
  // UI utilities that MUST be exported from the library
  // From spacing.ts (Requirement 9.1)
  const spacingExports = [
    'DP_VALUES',
    'dpToPx',
    'dpToRem',
    'generateDpSpacing',
    'nearestDp',
    'isStandardDp',
  ] as const

  // From componentsUtils.ts / cn.ts (Requirement 9.2)
  const componentUtilExports = [
    'cn',
  ] as const

  // From theme-loader.ts (Requirement 9.3)
  const themeLoaderExports = [
    'loadTheme',
    'unloadTheme',
    'isThemeLoaded',
    'applyTheme',
    'getCurrentTheme',
    'preloadTheme',
  ] as const

  // From font-loader.ts (Requirement 9.3)
  const fontLoaderExports = [
    'loadFont',
    'unloadFont',
    'isFontLoaded',
    'preloadFont',
    'getLoadedFonts',
  ] as const

  // All required exports combined
  const allRequiredExports = [
    ...spacingExports,
    ...componentUtilExports,
    ...themeLoaderExports,
    ...fontLoaderExports,
  ] as const

  // Application-specific utilities that MUST NOT be exported (Requirement 9.4)
  const excludedUtilities = [
    'lessonCache',
    'languageDetection',
    'audioUpload',
    'imageUpload',
    'imageHandler',
    'imageUtils',
    'textSplitting',
    'parseTranslations',
    'tutorialContent',
    'readingLevels',
    'getReadingRequirement',
    'formatRelativeTime',
    'dueTime',
    'errorHandling',
    'createTimeout',
    'revalidation',
    'serialization',
    'pathUtils',
    'texts',
  ] as const

  it('should export all spacing utilities (Requirement 9.1)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...spacingExports),
        (utilityName) => {
          // Utility must exist in exports
          expect(UtilsExports).toHaveProperty(utilityName)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export cn utility from componentsUtils (Requirement 9.2)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...componentUtilExports),
        (utilityName) => {
          // Utility must exist in exports
          expect(UtilsExports).toHaveProperty(utilityName)

          // cn must be a function
          const utility = UtilsExports[utilityName as keyof typeof UtilsExports]
          expect(typeof utility).toBe('function')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all theme-loader utilities (Requirement 9.3)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...themeLoaderExports),
        (utilityName) => {
          // Utility must exist in exports
          expect(UtilsExports).toHaveProperty(utilityName)

          // Theme loader utilities must be functions
          const utility = UtilsExports[utilityName as keyof typeof UtilsExports]
          expect(typeof utility).toBe('function')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export all font-loader utilities (Requirement 9.3)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...fontLoaderExports),
        (utilityName) => {
          // Utility must exist in exports
          expect(UtilsExports).toHaveProperty(utilityName)

          // Font loader utilities must be functions
          const utility = UtilsExports[utilityName as keyof typeof UtilsExports]
          expect(typeof utility).toBe('function')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export application-specific utilities (Requirement 9.4)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...excludedUtilities),
        (utilityName) => {
          // Application-specific utility must NOT exist in exports
          expect(UtilsExports).not.toHaveProperty(utilityName)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have correct function signatures for spacing utilities', () => {
    // dpToPx should accept a number and return a string
    expect(typeof UtilsExports.dpToPx).toBe('function')
    expect(UtilsExports.dpToPx(16)).toBe('16px')

    // dpToRem should accept a number and optional base, return a string
    expect(typeof UtilsExports.dpToRem).toBe('function')
    expect(UtilsExports.dpToRem(16)).toBe('1rem')
    expect(UtilsExports.dpToRem(16, 16)).toBe('1rem')

    // generateDpSpacing should accept an array and return an object
    expect(typeof UtilsExports.generateDpSpacing).toBe('function')
    const spacing = UtilsExports.generateDpSpacing([8, 16, 24])
    expect(spacing).toEqual({ '8dp': '8px', '16dp': '16px', '24dp': '24px' })

    // nearestDp should accept a number and return a standard dp value
    expect(typeof UtilsExports.nearestDp).toBe('function')
    expect(UtilsExports.nearestDp(15)).toBe(16)

    // isStandardDp should accept a number and return a boolean
    expect(typeof UtilsExports.isStandardDp).toBe('function')
    expect(UtilsExports.isStandardDp(16)).toBe(true)
    expect(UtilsExports.isStandardDp(17)).toBe(false)
  })

  it('should have correct cn utility behavior', () => {
    // cn should merge class names correctly
    expect(UtilsExports.cn('foo', 'bar')).toBe('foo bar')
    expect(UtilsExports.cn('foo', { bar: true, baz: false })).toBe('foo bar')
    expect(UtilsExports.cn('p-4', 'p-8')).toBe('p-8') // tailwind-merge behavior
  })

  it('should export DP_VALUES as a readonly array with standard values', () => {
    expect(Array.isArray(UtilsExports.DP_VALUES)).toBe(true)
    
    // Should contain standard M3 dp values
    const standardValues = [0, 4, 8, 12, 16, 24, 32, 40, 48]
    fc.assert(
      fc.property(
        fc.constantFrom(...standardValues),
        (dpValue) => {
          expect(UtilsExports.DP_VALUES).toContain(dpValue)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
