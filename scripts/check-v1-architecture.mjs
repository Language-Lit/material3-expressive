import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const v1Root = path.join(root, 'src/v1')
const inventoryPath = path.join(root, 'docs/v1/component-inventory.json')
const requiredDirectories = [
  'src/v1/components',
  'src/v1/internal',
  'src/v1/motion',
  'src/v1/styles',
  'src/v1/theme',
  'src/v1/tokens',
  'src/v1/types',
  'tests/v1',
  'playground/v1',
]

const errors = []
const forbiddenFrameworkImports = [
  'next',
  'next/',
  'vite',
  '@vitejs/',
  'react-router',
  'react-router-dom',
]
const forbiddenFoundationImports = ['react', 'react-dom']

async function exists(target) {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

async function walk(directory) {
  if (!(await exists(directory))) return []
  const entries = await readdir(directory, { withFileTypes: true })
  const files = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  }))
  return files.flat()
}

for (const directory of requiredDirectories) {
  if (!(await exists(path.join(root, directory)))) {
    errors.push(`Missing required v1 directory: ${directory}`)
  }
}

const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const allowedStatuses = new Set(['planned', 'experimental', 'conformant', 'deprecated'])
const names = new Set()
const exports = new Set()

if (inventory.schemaVersion !== 1 || !Array.isArray(inventory.components)) {
  errors.push('Component inventory must use schemaVersion 1 and contain a components array')
} else {
  for (const component of inventory.components) {
    const label = component.name ?? '<unnamed>'
    if (!component.name || names.has(component.name)) errors.push(`Duplicate or missing component name: ${label}`)
    names.add(component.name)
    if (!allowedStatuses.has(component.status)) errors.push(`${label} has invalid status: ${component.status}`)
    if (!/^T\d{2}$/.test(component.task ?? '')) errors.push(`${label} has invalid task: ${component.task}`)
    if (typeof component.path !== 'string' || !component.path.startsWith('src/v1/')) {
      errors.push(`${label} has an ownership path outside src/v1`)
    }
    if (!Array.isArray(component.dependencies) || !Array.isArray(component.publicExports)) {
      errors.push(`${label} must declare dependencies and publicExports arrays`)
      continue
    }
    for (const publicExport of component.publicExports) {
      if (exports.has(publicExport)) errors.push(`Duplicate public export in inventory: ${publicExport}`)
      exports.add(publicExport)
    }
    if (component.status !== 'planned' && !(await exists(path.join(root, component.path)))) {
      errors.push(`${label} is ${component.status} but its ownership path does not exist`)
    }
  }

  for (const component of inventory.components) {
    for (const dependency of component.dependencies ?? []) {
      if (!names.has(dependency)) errors.push(`${component.name} has unknown component dependency: ${dependency}`)
    }
  }
}

const sourceFiles = (await walk(v1Root)).filter((file) => /\.(?:ts|tsx|mts|cts)$/.test(file))
const importPattern = /(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g

for (const file of sourceFiles) {
  const source = await readFile(file, 'utf8')
  const v1Relative = path.relative(v1Root, file)
  const isFoundationFile =
    v1Relative.startsWith(`tokens${path.sep}`) ||
    v1Relative.startsWith(`types${path.sep}`)
  for (const match of source.matchAll(importPattern)) {
    const specifier = match[1]
    if (forbiddenFrameworkImports.some((entry) => specifier === entry || specifier.startsWith(entry))) {
      errors.push(`${path.relative(root, file)} imports app/framework-specific module: ${specifier}`)
      continue
    }
    if (
      isFoundationFile &&
      forbiddenFoundationImports.some(
        (entry) => specifier === entry || specifier.startsWith(`${entry}/`),
      )
    ) {
      errors.push(`${path.relative(root, file)} imports React from a foundation layer: ${specifier}`)
      continue
    }
    if (specifier.startsWith('@/')) {
      errors.push(`${path.relative(root, file)} uses the legacy @/ alias: ${specifier}`)
      continue
    }
    if (!specifier.startsWith('.')) continue

    const resolved = path.resolve(path.dirname(file), specifier)
    if (resolved !== v1Root && !resolved.startsWith(`${v1Root}${path.sep}`)) {
      errors.push(`${path.relative(root, file)} imports outside src/v1: ${specifier}`)
      continue
    }

    const sourceComponent = path.relative(path.join(v1Root, 'components'), file).split(path.sep)[0]
    const targetParts = path.relative(path.join(v1Root, 'components'), resolved).split(path.sep)
    const targetComponent = targetParts[0]
    if (
      !sourceComponent.startsWith('..') &&
      !targetComponent.startsWith('..') &&
      sourceComponent !== targetComponent &&
      targetParts.length > 1 &&
      targetParts[1] !== 'index'
    ) {
      errors.push(`${path.relative(root, file)} deep-imports component ${targetComponent}: ${specifier}`)
    }
  }
}

const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
for (const section of ['dependencies', 'peerDependencies']) {
  if (packageJson[section]?.next || packageJson[section]?.vite) {
    errors.push(`${section} must not contain Next.js or Vite; they are development fixtures only`)
  }
}

if (errors.length > 0) {
  console.error('v1 architecture check failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(`v1 architecture check passed (${inventory.components.length} planned public components)`)
}
