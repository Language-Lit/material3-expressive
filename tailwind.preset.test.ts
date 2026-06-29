import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import {
  material3Preset,
  M3_BREAKPOINTS,
  dpValues,
  generateDpSpacing,
} from './tailwind.preset'

/**
 * Feature: material3-expressive-lib
 * Property 7: Tailwind Preset Contains M3 Breakpoints
 * 
 * *For any* Material 3 breakpoint (compact, medium, expanded, large, extra-large),
 * the Tailwind preset's screens configuration shall include that breakpoint
 * with the correct pixel value.
 * 
 * **Validates: Requirements 5.1**
 */
describe('Property 7: Tailwind Preset Contains M3 Breakpoints', () => {
  const expectedBreakpoints = {
    compact: '0px',
    medium: '600px',
    expanded: '840px',
    large: '1200px',
    'extra-large': '1600px',
  }

  it('should contain all M3 breakpoints with correct values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(expectedBreakpoints) as (keyof typeof expectedBreakpoints)[]),
        (breakpointName) => {
          const screens = material3Preset.theme?.screens as Record<string, string>
          
          // Breakpoint must exist in preset
          expect(screens).toHaveProperty(breakpointName)
          
          // Breakpoint must have correct pixel value
          expect(screens[breakpointName]).toBe(expectedBreakpoints[breakpointName])
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should export M3_BREAKPOINTS constant with correct values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...Object.keys(expectedBreakpoints) as (keyof typeof expectedBreakpoints)[]),
        (breakpointName) => {
          expect(M3_BREAKPOINTS).toHaveProperty(breakpointName)
          expect(M3_BREAKPOINTS[breakpointName]).toBe(expectedBreakpoints[breakpointName])
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * Feature: material3-expressive-lib
 * Property 8: Tailwind Preset Contains DP Spacing
 * 
 * *For any* dp value in the standard dp scale (0, 4, 8, 12, 16, 24, 32, 40, 48, etc.),
 * the Tailwind preset's spacing configuration shall include a `{value}dp` key
 * mapping to `{value}px`.
 * 
 * **Validates: Requirements 5.2**
 */
describe('Property 8: Tailwind Preset Contains DP Spacing', () => {
  it('should contain dp spacing for all standard dp values', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...dpValues),
        (dpValue) => {
          const spacing = material3Preset.theme?.extend?.spacing as Record<string, string>
          const dpKey = `${dpValue}dp`
          const expectedPxValue = `${dpValue}px`
          
          // DP spacing must exist in preset
          expect(spacing).toHaveProperty(dpKey)
          
          // DP spacing must map to correct px value
          expect(spacing[dpKey]).toBe(expectedPxValue)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should generate correct dp spacing via generateDpSpacing utility', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer({ min: 0, max: 2000 }), { minLength: 1, maxLength: 20 }),
        (randomDpValues) => {
          const spacing = generateDpSpacing(randomDpValues)
          
          for (const dpValue of randomDpValues) {
            const dpKey = `${dpValue}dp`
            const expectedPxValue = `${dpValue}px`
            
            // Generated spacing must have correct key
            expect(spacing).toHaveProperty(dpKey)
            
            // Generated spacing must have correct value
            expect(spacing[dpKey]).toBe(expectedPxValue)
          }
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should include all dpValues in the exported constant', () => {
    // Verify the dpValues array contains expected standard values
    const standardDpValues = [0, 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80]
    
    fc.assert(
      fc.property(
        fc.constantFrom(...standardDpValues),
        (standardValue) => {
          expect(dpValues).toContain(standardValue)
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
