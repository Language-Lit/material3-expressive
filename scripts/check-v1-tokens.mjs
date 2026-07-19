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
const surfaceRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'surface',
)
if (!surfaceRegistration || surfaceRegistration.task !== 'T04') {
  errors.push('Default component-token registry is missing the sourced T04 Surface registration')
}
const iconRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'icon',
)
if (!iconRegistration || iconRegistration.task !== 'T06') {
  errors.push('Default component-token registry is missing the sourced T06 Icon registration')
}
const buttonRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'button',
)
if (!buttonRegistration || buttonRegistration.task !== 'T07') {
  errors.push('Default component-token registry is missing the sourced T07 Button registration')
}
const floatingActionButtonRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'floating-action-button',
)
if (!floatingActionButtonRegistration || floatingActionButtonRegistration.task !== 'T09') {
  errors.push('Default component-token registry is missing the sourced T09 FloatingActionButton registration')
}

const checkboxRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'checkbox',
)
if (!checkboxRegistration || checkboxRegistration.task !== 'T11') {
  errors.push('Default component-token registry is missing the sourced T11 Checkbox registration')
}

const radioRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'radio',
)
if (!radioRegistration || radioRegistration.task !== 'T12') {
  errors.push('Default component-token registry is missing the sourced T12 Radio registration')
}

const switchRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'switch',
)
if (!switchRegistration || switchRegistration.task !== 'T13') {
  errors.push('Default component-token registry is missing the sourced T13 Switch registration')
}

const textFieldRegistration = api.defaultTokenSet.componentTokens.find(
  (registration) => registration.component === 'text-field',
)
if (!textFieldRegistration || textFieldRegistration.task !== 'T14') {
  errors.push('Default component-token registry is missing the sourced T14 TextField registration')
}

if (errors.length > 0) {
  console.error('v1 token check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`v1 token check passed (${definitions.size} generated custom properties).`)
}
