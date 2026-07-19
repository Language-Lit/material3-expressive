import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { pathToFileURL } from 'node:url'
import { compileV1Css } from './v1-css.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')

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
const authoredSource = readFileSync(path.join(root, 'src/v1/styles/styles.css'), 'utf8')
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
