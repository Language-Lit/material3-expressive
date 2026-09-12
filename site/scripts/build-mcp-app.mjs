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
const sandbox = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MCP Apps demo sandbox</title><style>html,body,iframe{border:0;margin:0;width:100%;height:100%;overflow:hidden}</style></head><body><script>(()=>{const hostOrigin=new URL(location.href).searchParams.get('hostOrigin');const allowed=hostOrigin==='https://m3e.language-lit.com'||(/^http:\\/\\/(127\\.0\\.0\\.1|localhost):\\d+$/.test(hostOrigin||''));if(!allowed)throw new Error('Host origin is not allowed.');const view=document.createElement('iframe');view.title='MCP App view';view.sandbox='allow-scripts allow-forms';let loaded=false;addEventListener('message',event=>{const message=event.data;if(!message||message.jsonrpc!=='2.0')return;const reserved=typeof message.method==='string'&&message.method.startsWith('ui/notifications/sandbox-');if(event.source===parent&&event.origin===hostOrigin){if(message.method==='ui/notifications/sandbox-resource-ready'&&!loaded){loaded=true;view.src='/mcp-apps/forecast.html';document.body.append(view)}else if(!reserved&&loaded)view.contentWindow?.postMessage(message,'*')}else if(event.source===view.contentWindow&&!reserved)parent.postMessage(message,hostOrigin)});parent.postMessage({jsonrpc:'2.0',method:'ui/notifications/sandbox-proxy-ready',params:{}},hostOrigin)})()</script></body></html>`
await mkdir(path.join(site, 'public/mcp-apps'), { recursive: true })
await writeFile(path.join(site, 'public/mcp-apps/forecast.html'), html)
await writeFile(path.join(site, 'public/mcp-apps/sandbox.html'), sandbox)
console.log(`Built self-contained MCP app (${Buffer.byteLength(html)} bytes) and fixed demo sandbox.`)
