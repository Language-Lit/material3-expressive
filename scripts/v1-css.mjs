import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
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

export const v1CssTargets = Object.fromEntries(
  browserSupport.browsers.map((browser) => [
    targetNames[browser.name],
    encodeVersion(browser.lightningCssTarget),
  ]),
)

export function compileV1Css(filename, source) {
  return transform({
    filename,
    code: Buffer.from(source),
    minify: true,
    sourceMap: true,
    targets: v1CssTargets,
  })
}
