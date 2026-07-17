import { fileURLToPath, URL } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: fileURLToPath(new URL('./playground', import.meta.url)),
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: fileURLToPath(new URL('./dist-playground', import.meta.url)),
    emptyOutDir: true,
  },
})
