import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const cssRoot = path.join(root, 'src/v1')
const errors = []

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  }))
  return nested.flat()
}

const cssFiles = (await walk(cssRoot)).filter((file) => file.endsWith('.css'))

for (const file of cssFiles) {
  const relative = path.relative(root, file)
  const css = await readFile(file, 'utf8')
  const cssWithoutLayerNames = css.replace(/@layer\s+[^;{]+[;{]/g, '')

  if (css.includes('--md-')) errors.push(`${relative} uses a frozen legacy --md-* custom property`)

  for (const match of css.matchAll(/--([_a-zA-Z][_a-zA-Z0-9-]*)\s*:/g)) {
    if (!match[1].startsWith('m3e-')) errors.push(`${relative} defines unnamespaced custom property --${match[1]}`)
  }
  for (const match of cssWithoutLayerNames.matchAll(/\.([_a-zA-Z][_a-zA-Z0-9-]*)/g)) {
    if (!match[1].startsWith('m3e-')) errors.push(`${relative} uses unnamespaced class .${match[1]}`)
  }
  for (const match of css.matchAll(/@layer\s+([^;{]+)/g)) {
    for (const layer of match[1].split(',').map((value) => value.trim())) {
      if (layer && !layer.startsWith('m3e.')) errors.push(`${relative} declares unnamespaced layer ${layer}`)
    }
  }
  for (const match of css.matchAll(/@import\s+(?:url\()?['"]([^'"]+)['"]/g)) {
    const specifier = match[1]
    if (!specifier.startsWith('.')) {
      errors.push(`${relative} has a non-relative stylesheet import: ${specifier}`)
      continue
    }
    const resolved = path.resolve(path.dirname(file), specifier)
    if (resolved !== cssRoot && !resolved.startsWith(`${cssRoot}${path.sep}`)) {
      errors.push(`${relative} imports CSS outside src/v1: ${specifier}`)
    }
  }
}

if (errors.length > 0) {
  console.error('v1 CSS boundary check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`v1 CSS boundary check passed (${cssFiles.length} stylesheet${cssFiles.length === 1 ? '' : 's'}).`)
}
