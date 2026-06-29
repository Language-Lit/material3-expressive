import type { Config } from 'tailwindcss'

/**
 * Material 3 Expressive dp (density-independent pixel) values
 * These follow the Material 3 spacing scale
 */
export const dpValues = [
  0, 4,                                       // Base and half-step
  8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80,  // Small increments (8dp grid)
  88, 96, 112, 128, 144, 160, 192, 224, 256,  // Medium increments
  320, 384, 512,                              // Large increments
  600, 840, 1200, 1600                        // Breakpoints
]

/**
 * Material 3 breakpoints following the responsive layout guidelines
 * - compact: 0-599dp (phones in portrait)
 * - medium: 600-839dp (tablets in portrait, foldables)
 * - expanded: 840-1199dp (tablets in landscape, small laptops)
 * - large: 1200-1599dp (laptops, desktops)
 * - extra-large: 1600dp+ (large desktops, TVs)
 */
export const M3_BREAKPOINTS = {
  compact: '0px',
  medium: '600px',
  expanded: '840px',
  large: '1200px',
  'extra-large': '1600px',
} as const

/**
 * Generate dp-based spacing utilities
 * On web, 1dp = 1px, so we map dp values directly to px
 */
export const generateDpSpacing = (values: number[]): Record<string, string> =>
  Object.fromEntries(values.map(dp => [`${dp}dp`, `${dp}px`]))

/**
 * Material 3 animation keyframes
 */
export const m3Keyframes = {
  'linear-rotate': {
    to: { transform: 'rotate(360deg)' },
  },
  'expand-arc': {
    '0%': { transform: 'rotate(265deg)' },
    '50%': { transform: 'rotate(130deg)' },
    '100%': { transform: 'rotate(265deg)' },
  },
  'rotate-arc': {
    '12.5%': { transform: 'rotate(135deg)' },
    '25%': { transform: 'rotate(270deg)' },
    '37.5%': { transform: 'rotate(405deg)' },
    '50%': { transform: 'rotate(540deg)' },
    '62.5%': { transform: 'rotate(675deg)' },
    '75%': { transform: 'rotate(810deg)' },
    '87.5%': { transform: 'rotate(945deg)' },
    '100%': { transform: 'rotate(1080deg)' },
  },
  'fade-in': {
    '0%': { opacity: '0' },
    '100%': { opacity: '1' },
  },
} as const

/**
 * Material 3 animation definitions with proper easing curves
 * Using MD3 standard easing: cubic-bezier(0.2, 0, 0, 1)
 * Using MD3 emphasized easing: cubic-bezier(0.4, 0, 0.2, 1)
 */
export const m3Animations = {
  'linear-rotate': 'linear-rotate 1568ms linear infinite',
  'expand-arc': 'expand-arc 1333ms cubic-bezier(0.4, 0, 0.2, 1) infinite',
  'rotate-arc': 'rotate-arc 5332ms cubic-bezier(0.4, 0, 0.2, 1) infinite',
  'fade-in': 'fade-in 200ms cubic-bezier(0.2, 0, 0, 1)',
} as const

/**
 * Material 3 Expressive Tailwind preset
 * 
 * This preset provides:
 * - M3 responsive breakpoints (compact, medium, expanded, large, extra-large)
 * - dp-based spacing utilities (e.g., `p-16dp`, `m-24dp`)
 * - M3 animation keyframes and durations
 * - Progress indicator utilities
 */
export const material3Preset: Partial<Config> = {
  theme: {
    screens: M3_BREAKPOINTS,
    extend: {
      spacing: {
        ...generateDpSpacing(dpValues),
        'md-circular-progress-size': 'var(--md-circular-progress-size, 48px)',
        'md-circular-progress-active-indicator-width': 'calc(var(--md-circular-progress-active-indicator-width, 8.33) * 1%)',
      },
      borderWidth: {
        ...generateDpSpacing([1, 2, 4, 8]),
      },
      keyframes: m3Keyframes,
      animation: m3Animations,
    },
  },
}

export default material3Preset
