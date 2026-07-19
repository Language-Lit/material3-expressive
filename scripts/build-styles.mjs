import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'
import { compileV1Css } from './v1-css.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

function assembleAuthoredCss(entry, ancestors = []) {
  if (ancestors.includes(entry)) {
    const cycle = [...ancestors, entry].map((file) => path.relative(root, file)).join(' -> ')
    throw new Error(`Circular v1 stylesheet import: ${cycle}`)
  }

  const source = readFileSync(entry, 'utf8')
  return source.replace(/@import\s+['"]([^'"]+)['"];?/g, (statement, specifier) => {
    if (!specifier.startsWith('.')) {
      throw new Error(`v1 stylesheet imports must be relative: ${statement}`)
    }
    const imported = path.resolve(path.dirname(entry), specifier)
    const sourceRoot = path.join(root, 'src/v1')
    if (imported !== sourceRoot && !imported.startsWith(`${sourceRoot}${path.sep}`)) {
      throw new Error(`v1 stylesheet import escapes src/v1: ${specifier}`)
    }
    if (path.extname(imported) !== '.css') {
      throw new Error(`v1 stylesheet imports must target CSS files: ${specifier}`)
    }
    return assembleAuthoredCss(imported, [...ancestors, entry]).trim()
  })
}

// The legacy stylesheet remains a byte-for-byte copy of its existing source.
cpSync(path.join(root, 'src/styles'), path.join(dist, 'styles'), {
  recursive: true,
  filter: (source) => !source.includes('.test.'),
})

const v1Dist = path.join(dist, 'v1')
mkdirSync(v1Dist, { recursive: true })

const v1Entry = path.join(v1Dist, 'index.js')
const { defaultTokenSet, generateTokenCss } = await import(pathToFileURL(v1Entry).href)
const tokenSource = generateTokenCss(defaultTokenSet)
const authoredSource = assembleAuthoredCss(path.join(root, 'src/v1/styles/styles.css'))
if (/@import\s/.test(authoredSource)) {
  throw new Error('v1 stylesheet contains an unsupported import syntax after assembly')
}
const tokenResult = compileV1Css('src/v1/styles/tokens.css', tokenSource)
const fullResult = compileV1Css(
  'src/v1/styles/styles.css',
  `${authoredSource.trim()}\n${tokenSource}`,
)

writeFileSync(path.join(v1Dist, 'tokens.css'), tokenResult.code)
writeFileSync(path.join(v1Dist, 'tokens.css.map'), tokenResult.map)
writeFileSync(path.join(v1Dist, 'styles.css'), fullResult.code)
writeFileSync(path.join(v1Dist, 'styles.css.map'), fullResult.map)

console.log('Copied frozen legacy styles and generated v1 token/full stylesheets.')
