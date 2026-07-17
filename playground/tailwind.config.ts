import type { Config } from 'tailwindcss'
import { material3Preset } from '../tailwind.preset'

export default {
  presets: [material3Preset],
  content: {
    relative: true,
    files: [
      './**/*.{html,ts,tsx}',
      '../src/**/*.{ts,tsx}',
    ],
  },
} satisfies Config
