import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { bundle } from 'lightningcss'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const browserSupport = JSON.parse(
  readFileSync(path.join(root, 'docs/v1/browser-support.json'), 'utf8'),
)

function encodeVersion([major, minor, patch]) {
  return (major << 16) | (minor << 8) | patch
}

const targetNames = {
  Chrome: 'chrome',
  Edge: 'edge',
  Firefox: 'firefox',
  Safari: 'safari',
  iOS: 'ios_saf',
}
const targets = Object.fromEntries(
  browserSupport.browsers.map((browser) => [
    targetNames[browser.name],
    encodeVersion(browser.lightningCssTarget),
  ]),
)

// The legacy stylesheet remains a byte-for-byte copy of its existing source.
cpSync(path.join(root, 'src/styles'), path.join(dist, 'styles'), {
  recursive: true,
  filter: (source) => !source.includes('.test.'),
})

const v1Dist = path.join(dist, 'v1')
mkdirSync(v1Dist, { recursive: true })

const result = bundle({
  filename: path.join(root, 'src/v1/styles/styles.css'),
  minify: true,
  sourceMap: true,
  targets,
})

writeFileSync(path.join(v1Dist, 'styles.css'), result.code)
writeFileSync(path.join(v1Dist, 'styles.css.map'), result.map)

console.log('Copied frozen legacy styles and compiled v1/styles.css.')
