import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const result = await build({
  absWorkingDir: site,
  entryPoints: ['ui/mcp-apps/app-entry.tsx'],
  outfile: 'app.js',
  bundle: true, write: false, minify: true, format: 'iife',
  // The core is a file:.. symlink. Resolve its React imports to the same
  // instance as the app renderer instead of the repository's dev React.
  alias: {
    react: path.join(site, 'node_modules/react'),
    'react-dom': path.join(site, 'node_modules/react-dom'),
  },
  define: { 'process.env.NODE_ENV': '"production"' },
})
const js = result.outputFiles.find((file) => file.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script')
const css = result.outputFiles.find((file) => file.path.endsWith('.css')).text.replace(/<\/style/gi, '<\\/style')
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Forecast</title><style>${css}</style></head><body><div id="root"></div><script>${js}</script></body></html>`
await mkdir(path.join(site, 'public/mcp-apps'), { recursive: true })
await writeFile(path.join(site, 'public/mcp-apps/forecast.html'), html)
console.log(`Built self-contained MCP app (${Buffer.byteLength(html)} bytes).`)
