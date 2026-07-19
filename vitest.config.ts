import { defineConfig } from 'vitest/config'

// Self-contained config so the package doesn't inherit the app's vitest setup
// (which references app-relative setup files).
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'tests/v1/**/*.test.ts',
      'tests/v1/**/*.test.tsx',
      'tailwind.preset.test.ts',
    ],
    exclude: ['node_modules', 'dist'],
  },
})
