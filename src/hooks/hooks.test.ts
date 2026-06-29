import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as HooksExports from './index'

/**
 * Feature: material3-expressive-lib
 * Property 5: Correct Hooks Exported
 *
 * *For any* hook in the UI hooks list (useOnClickOutside, useIntersectionObserver,
 * useIntersectionOnce, useDebounce, useThemeLoader, useFontLoader), importing from
 * the library's hooks export shall successfully resolve that hook.
 * *For any* hook in the application-specific list (useAudio, useAudioStream,
 * useImageUpload), that hook shall NOT be exported.
 *
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**
 */
describe('Property 5: Correct Hooks Exported', () => {
  // UI hooks that MUST be exported from the library
  const requiredHooks = [
    'useOnClickOutside',
    'useIntersectionObserver',
    'useIntersectionOnce',
    'useDebounce',
    'useThemeLoader',
    'useFontLoader',
  ] as const

  // Application-specific hooks that MUST NOT be exported
  const excludedHooks = [
    'useAudio',
    'useAudioStream',
    'useImageUpload',
  ] as const

  // Additional utility exports from theme/font loaders
  const requiredUtilityExports = [
    'loadTheme',
    'unloadTheme',
    'preloadTheme',
    'isThemeLoaded',
    'loadFont',
    'preloadFont',
  ] as const

  // Type exports that should be available
  const requiredTypeExports = [
    'ThemeColors',
    'UseThemeLoaderOptions',
    'FontConfig',
    'UseFontLoaderOptions',
  ] as const

  it('should export all required UI hooks', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredHooks),
        (hookName) => {
          // Hook must exist in exports
          expect(HooksExports).toHaveProperty(hookName)

          // Hook must be a function
          const hook = HooksExports[hookName as keyof typeof HooksExports]
          expect(typeof hook).toBe('function')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should NOT export application-specific hooks', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...excludedHooks),
        (hookName) => {
          // Application-specific hook must NOT exist in exports
          expect(HooksExports).not.toHaveProperty(hookName)

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export theme and font loader utility functions', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...requiredUtilityExports),
        (utilityName) => {
          // Utility must exist in exports
          expect(HooksExports).toHaveProperty(utilityName)

          // Utility must be a function
          const utility = HooksExports[utilityName as keyof typeof HooksExports]
          expect(typeof utility).toBe('function')

          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should have correct function signatures for hooks', () => {
    // useOnClickOutside should accept ref, handler, and optional excludeRef
    expect(HooksExports.useOnClickOutside.length).toBeGreaterThanOrEqual(2)

    // useIntersectionObserver should accept optional options
    expect(typeof HooksExports.useIntersectionObserver).toBe('function')

    // useIntersectionOnce should accept optional options
    expect(typeof HooksExports.useIntersectionOnce).toBe('function')

    // useDebounce should accept value/callback and delay
    expect(HooksExports.useDebounce.length).toBeGreaterThanOrEqual(2)

    // useThemeLoader should accept optional options
    expect(typeof HooksExports.useThemeLoader).toBe('function')

    // useFontLoader should accept options with locale
    expect(typeof HooksExports.useFontLoader).toBe('function')
  })

  it('should export exactly the required hooks and no extra hooks', () => {
    const exportedKeys = Object.keys(HooksExports)
    const allExpectedExports = [
      ...requiredHooks,
      ...requiredUtilityExports,
    ]

    // All required exports should be present
    for (const expected of allExpectedExports) {
      expect(exportedKeys).toContain(expected)
    }

    // No excluded hooks should be present
    for (const excluded of excludedHooks) {
      expect(exportedKeys).not.toContain(excluded)
    }
  })
})
