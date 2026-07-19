import { defineConfig } from 'tsup'

// Subpath entries mirror the package `exports` map so consumers can import
// `@language-lit/material3-expressive/components/<group>` etc.
//
// esbuild strips module-level "use client" when bundling with code splitting,
// so the directive is re-added to the client entry barrels afterwards by
// scripts/add-directives.mjs (utils + tailwind.preset are intentionally left
// out of that list so they stay server/Node-safe).
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'components/buttons': 'src/components/buttons/index.ts',
    'components/cards': 'src/components/cards/index.ts',
    'components/navigation': 'src/components/navigation/index.ts',
    'components/inputs': 'src/components/inputs/index.ts',
    'components/feedback': 'src/components/feedback/index.ts',
    'components/modals': 'src/components/modals/index.ts',
    'components/display': 'src/components/display/index.ts',
    hooks: 'src/hooks/index.ts',
    'context/Material3Provider': 'src/context/Material3Provider.tsx',
    showcase: 'src/showcase/index.ts',
    utils: 'src/utils/index.ts',
    'tailwind.preset': 'tailwind.preset.ts',
    'v1/index': 'src/v1/index.ts',
  },
  format: ['esm'],
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
})
