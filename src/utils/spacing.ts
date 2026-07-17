/**
 * Material 3 Expressive spacing utilities
 * 
 * These utilities help with dp (density-independent pixel) calculations
 * following Material 3 spacing guidelines.
 */

/**
 * Material 3 spacing tokens and fixed component dimensions used by the library.
 */
export const DP_VALUES = [
  0, 2, 4,                                    // Base and fine component dimensions
  8, 12, 16, 18, 20, 24, 32, 40, 48, 56, 64, 72, 80,
  88, 96, 112, 128, 144, 160, 192, 200, 224, 256,
  320, 384, 512,                              // Large increments
  600, 840, 1200, 1600                        // Breakpoints
] as const

export type DpValue = typeof DP_VALUES[number]

/**
 * Convert dp value to px string
 * On web, 1dp = 1px
 */
export const dpToPx = (dp: number): string => `${dp}px`

/**
 * Convert dp value to rem (assuming 16px base)
 */
export const dpToRem = (dp: number, baseFontSize = 16): string => 
  `${dp / baseFontSize}rem`

/**
 * Generate a spacing object from dp values
 * Useful for creating Tailwind-compatible spacing configurations
 */
export const generateDpSpacing = (values: readonly number[]): Record<string, string> =>
  Object.fromEntries(values.map(dp => [`${dp}dp`, `${dp}px`]))

/**
 * Get the nearest standard dp value for a given pixel value
 */
export const nearestDp = (px: number): DpValue => {
  let nearest: DpValue = DP_VALUES[0]
  let minDiff = Math.abs(px - nearest)
  
  for (const dp of DP_VALUES) {
    const diff = Math.abs(px - dp)
    if (diff < minDiff) {
      minDiff = diff
      nearest = dp as DpValue
    }
  }
  
  return nearest
}

/**
 * Check if a value is a standard M3 dp value
 */
export const isStandardDp = (value: number): value is DpValue =>
  (DP_VALUES as readonly number[]).includes(value)
