import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const baselineDir = path.join(root, 'tests/v1/contracts/baselines')
const update = process.argv.includes('--update')
const approvedV1Exports = ['./v1', './v1/styles.css']

async function exists(target) {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const target = path.join(directory, entry.name)
    return entry.isDirectory() ? walk(target) : [target]
  }))
  return nested.flat()
}

function stableObject(entries) {
  return Object.fromEntries([...entries].sort(([left], [right]) => left.localeCompare(right)))
}

function declarationCandidates(importingFile, specifier) {
  const resolved = path.resolve(path.dirname(importingFile), specifier)
  if (specifier.endsWith('.js')) return [resolved.replace(/\.js$/, '.d.ts')]
  if (specifier.endsWith('.d.ts')) return [resolved]
  return [`${resolved}.d.ts`, path.join(resolved, 'index.d.ts')]
}

async function collectDeclarationClosure(entryFiles) {
  const queued = [...entryFiles]
  const seen = new Set()
  const files = new Map()
  const modulePattern = /(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g
  const referencePattern = /<reference\s+path=['"]([^'"]+)['"]/g

  while (queued.length > 0) {
    const file = queued.shift()
    if (seen.has(file)) continue
    seen.add(file)
    if (!(await exists(file))) throw new Error(`Missing generated declaration: ${path.relative(root, file)}`)

    const contents = await readFile(file, 'utf8')
    const relative = path.relative(dist, file).split(path.sep).join('/')
    files.set(relative, contents)

    const specifiers = [
      ...[...contents.matchAll(modulePattern)].map((match) => match[1]),
      ...[...contents.matchAll(referencePattern)].map((match) => match[1]),
    ]

    for (const specifier of specifiers) {
      if (!specifier.startsWith('.')) continue
      for (const candidate of declarationCandidates(file, specifier)) {
        if (await exists(candidate)) {
          if (candidate !== dist && !candidate.startsWith(`${dist}${path.sep}`)) {
            throw new Error(`Declaration import escapes dist: ${specifier}`)
          }
          queued.push(candidate)
          break
        }
      }
    }
  }

  return stableObject(files)
}

async function buildContract() {
  const packageJson = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const exportEntries = Object.entries(packageJson.exports)
  const v1ExportNames = exportEntries
    .map(([name]) => name)
    .filter((name) => name.startsWith('./v1'))
    .sort()

  if (JSON.stringify(v1ExportNames) !== JSON.stringify(approvedV1Exports)) {
    throw new Error(`Only ${approvedV1Exports.join(' and ')} may be added for v1; received ${v1ExportNames.join(', ')}`)
  }

  const legacyExports = stableObject(exportEntries.filter(([name]) => !name.startsWith('./v1')))
  const typeEntries = Object.entries(legacyExports)
    .flatMap(([name, target]) => {
      if (typeof target !== 'object' || typeof target.types !== 'string') return []
      return [[name, target.types.replace(/^\.\//, '')]]
    })
  const entryFiles = typeEntries.map(([, target]) => path.join(root, target))

  const styleFiles = (await walk(path.join(dist, 'styles')))
    .filter((file) => file.endsWith('.css'))
  const styles = new Map()
  for (const file of styleFiles) {
    styles.set(path.relative(dist, file).split(path.sep).join('/'), await readFile(file, 'utf8'))
  }

  return {
    package: {
      main: packageJson.main,
      module: packageJson.module,
      types: packageJson.types,
      sideEffects: packageJson.sideEffects,
      exports: legacyExports,
    },
    declarations: {
      entries: stableObject(typeEntries),
      files: await collectDeclarationClosure(entryFiles),
    },
    styles: stableObject(styles),
  }
}

async function writeBaseline(name, contract) {
  await mkdir(baselineDir, { recursive: true })
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
  const payload = {
    generatedBy: 'npm run update:legacy-contract',
    sourceCommit,
    contract,
  }
  await writeFile(path.join(baselineDir, name), `${JSON.stringify(payload, null, 2)}\n`)
}

async function checkBaseline(name, actual) {
  const baselinePath = path.join(baselineDir, name)
  if (!(await exists(baselinePath))) {
    throw new Error(`Missing ${path.relative(root, baselinePath)}; run npm run update:legacy-contract once for T01`)
  }
  const expected = JSON.parse(await readFile(baselinePath, 'utf8')).contract
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`${name} differs from the frozen legacy contract`)
  }
}

if (!(await exists(dist))) throw new Error('dist is missing; run npm run build before checking the legacy contract')

const contract = await buildContract()
const baselines = [
  ['legacy-package.json', contract.package],
  ['legacy-types.json', contract.declarations],
  ['legacy-styles.json', contract.styles],
]

if (update) {
  for (const [name, value] of baselines) await writeBaseline(name, value)
  console.log(`Updated ${baselines.length} legacy contract baselines.`)
} else {
  for (const [name, value] of baselines) await checkBaseline(name, value)
  console.log(`Legacy package, type, and CSS contracts match ${baselines.length} committed baselines.`)
}
