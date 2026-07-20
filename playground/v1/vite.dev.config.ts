import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../..')

// Dev-only entry point: aliases the package import straight to the library's
// TypeScript source so editing src/v1 hot-reloads the playground with no
// package build/pack step in between. Never used for the production /
// consumer-fixture build — those stay on vite.config.ts, which resolves the
// real published package exactly as a real consumer would.
export default defineConfig({
  // Pinned so this works when launched via an `npm run` script from the repo
  // root (npm sets cwd to the root package.json's directory, not here) — Vite
  // otherwise defaults `root` to process.cwd() at launch time.
  root: here,
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: '@language-lit/material3-expressive/v1/styles.css',
        replacement: path.join(repoRoot, 'src/v1/styles/styles.css'),
      },
      {
        find: '@language-lit/material3-expressive/v1',
        replacement: path.join(repoRoot, 'src/v1/index.ts'),
      },
    ],
  },
})
