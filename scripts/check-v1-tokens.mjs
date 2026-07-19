import { readFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { compileV1Css } from './v1-css.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distEntry = path.join(root, 'dist/v1/index.js')
const distTokens = path.join(root, 'dist/v1/tokens.css')
const api = await import(pathToFileURL(distEntry).href)
const errors = []

const validation = api.validateTokenSet(api.defaultTokenSet)
if (!validation.success) {
  errors.push(...validation.issues.map((issue) => `${issue.path}: ${issue.message}`))
}
if (!api.isDeeplyFrozen(api.defaultTokenSet)) errors.push('Default token data is not deeply frozen')

const first = api.generateTokenCss(api.defaultTokenSet)
const second = api.generateTokenCss(api.defaultTokenSet)
if (first !== second) errors.push('Token CSS generation is not deterministic')

const compiled = compileV1Css('src/v1/styles/tokens.css', first).code
const distributed = await readFile(distTokens)
if (!compiled.equals(distributed)) errors.push('dist/v1/tokens.css is stale')

const definitions = new Set([...first.matchAll(/(--m3e-[a-z0-9-]+)\s*:/g)].map((match) => match[1]))
for (const match of first.matchAll(/var\(\s*(--m3e-[a-z0-9-]+)/g)) {
  if (!definitions.has(match[1])) errors.push(`Unresolved generated CSS reference: ${match[1]}`)
}
if ([...first.matchAll(/--m3e-comp-/g)].length !== 0) {
  errors.push('Default component-token registry must remain empty until a component task registers sourced defaults')
}

if (errors.length > 0) {
  console.error('v1 token check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`v1 token check passed (${definitions.size} generated custom properties).`)
}
