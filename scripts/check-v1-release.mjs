import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, stat } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const candidateVersion = '1.0.0-next.0'
const rollbackVersion = '0.3.0'
const rollbackTag = `v${rollbackVersion}`
const v1Exports = ['./v1', './v1/theme', './v1/tokens', './v1/styles.css']
const errors = []

async function read(relativePath) {
  return readFile(path.join(root, relativePath), 'utf8')
}

async function exists(relativePath) {
  try {
    await stat(path.join(root, relativePath))
    return true
  } catch {
    return false
  }
}

function equal(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function fail(message) {
  errors.push(message)
}

const packageJson = JSON.parse(await read('package.json'))
const inventory = JSON.parse(await read('docs/v1/component-inventory.json'))
const legacyBaseline = JSON.parse(await read('tests/v1/contracts/baselines/legacy-package.json'))
const releaseReport = await read('docs/v1/RELEASE_READINESS.md')

if (packageJson.version !== candidateVersion) {
  fail(`candidate version must be ${candidateVersion}, received ${packageJson.version}`)
}
if (!/^1\.0\.0-next\.\d+$/.test(packageJson.version)) {
  fail(`candidate version is not a 1.0.0-next.* prerelease: ${packageJson.version}`)
}

for (const [field, expected] of Object.entries(legacyBaseline.contract)) {
  if (field === 'exports') continue
  if (!equal(packageJson[field], expected)) fail(`legacy package field changed: ${field}`)
}
for (const [exportPath, expected] of Object.entries(legacyBaseline.contract.exports)) {
  if (!equal(packageJson.exports?.[exportPath], expected)) {
    fail(`legacy package export changed: ${exportPath}`)
  }
}
for (const exportPath of v1Exports) {
  if (!(exportPath in (packageJson.exports ?? {}))) fail(`missing additive export ${exportPath}`)
}
const unexpectedV1Exports = Object.keys(packageJson.exports ?? {})
  .filter((exportPath) => exportPath.startsWith('./v1') && !v1Exports.includes(exportPath))
if (unexpectedV1Exports.length > 0) {
  fail(`unexpected v1 package exports: ${unexpectedV1Exports.join(', ')}`)
}
if (packageJson.peerDependenciesMeta?.tailwindcss?.optional !== true) {
  fail('tailwindcss must remain an optional peer for v1-only consumers')
}

const conformant = inventory.components.filter((component) => component.status === 'conformant')
if (conformant.length !== 32) fail(`expected 32 conformant components, received ${conformant.length}`)

for (const component of conformant) {
  const provider = component.name === 'Material3Provider'
  const sourceIndex = `${component.path}/index.ts`
  const source = (await exists(sourceIndex)) ? await read(sourceIndex) : ''
  if (!source) fail(`${component.name} is missing its public source barrel: ${sourceIndex}`)
  for (const publicExport of component.publicExports) {
    if (!new RegExp(`\\b${publicExport}\\b`).test(source)) {
      fail(`${component.name} barrel does not declare ${publicExport}`)
    }
  }

  const doc = `docs/v1/components/${component.name}.md`
  const conformance = provider
    ? 'tests/v1/theme/Material3Provider.conformance.md'
    : `tests/v1/components/${component.name}/${component.name}.conformance.md`
  const ssr = provider
    ? 'tests/v1/theme/Material3Provider.ssr.test.tsx'
    : `tests/v1/components/${component.name}/${component.name}.ssr.test.tsx`
  const behavior = provider
    ? 'tests/v1/theme/Material3Provider.test.tsx'
    : `tests/v1/components/${component.name}/${component.name}.test.tsx`
  const example = provider
    ? 'playground/v1/src/main.tsx'
    : `playground/v1/examples/${component.name}.example.tsx`

  for (const requiredPath of [doc, conformance, ssr, behavior, example]) {
    if (!(await exists(requiredPath))) fail(`${component.name} is missing ${requiredPath}`)
  }
  if (provider) {
    const playground = await read(example)
    if (!playground.includes('<Material3Provider')) {
      fail('playground does not exercise Material3Provider')
    }
  }
}

let taggedPackage
try {
  taggedPackage = JSON.parse(execFileSync(
    'git',
    ['show', `${rollbackTag}:package.json`],
    { cwd: root, encoding: 'utf8' },
  ))
} catch {
  fail(`rollback tag ${rollbackTag} is not available locally`)
}
if (taggedPackage?.name !== packageJson.name || taggedPackage?.version !== rollbackVersion) {
  fail(`${rollbackTag} does not identify ${packageJson.name}@${rollbackVersion}`)
}
for (const requiredText of [
  `Candidate: \`${packageJson.name}@${candidateVersion}\``,
  `Rollback: \`${packageJson.name}@${rollbackVersion}\` (tag \`${rollbackTag}\`)`,
  'Registry publication: not performed',
  'Stable root cutover: not performed',
]) {
  if (!releaseReport.includes(requiredText)) fail(`release report is missing: ${requiredText}`)
}

const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), 'm3e-release-audit-'))
try {
  let packResult
  try {
    packResult = JSON.parse(execFileSync(
      'npm',
      ['pack', '--json', '--ignore-scripts', '--pack-destination', temporaryDirectory],
      { cwd: root, encoding: 'utf8' },
    ))[0]
  } catch (error) {
    fail(`npm pack failed: ${error.message}`)
  }

  if (packResult) {
    if (packResult.name !== packageJson.name || packResult.version !== packageJson.version) {
      fail('packed identity does not match package.json')
    }

    const packedPaths = new Set(packResult.files.map((file) => file.path))
    for (const requiredPath of ['LICENSE', 'README.md', 'package.json']) {
      if (!packedPaths.has(requiredPath)) fail(`packed artifact is missing ${requiredPath}`)
    }

    for (const target of Object.values(packageJson.exports).flatMap((value) => {
      if (typeof value === 'string') return [value]
      return Object.values(value)
    })) {
      const packedPath = target.replace(/^\.\//, '')
      if (!packedPaths.has(packedPath)) fail(`packed artifact is missing export target ${target}`)
    }

    for (const packedPath of packedPaths) {
      if (/^(?:src|tests|playground|docs|scripts)\//.test(packedPath)) {
        fail(`packed artifact contains repository-only path ${packedPath}`)
      }
    }

    const tarball = path.join(temporaryDirectory, packResult.filename)
    const packedManifest = JSON.parse(execFileSync(
      'tar',
      ['-xOf', tarball, 'package/package.json'],
      { encoding: 'utf8' },
    ))
    if (!equal(packedManifest.exports, packageJson.exports)) {
      fail('packed export map differs from package.json')
    }
    if (!equal(packedManifest.peerDependenciesMeta, packageJson.peerDependenciesMeta)) {
      fail('packed peer dependency metadata differs from package.json')
    }
  }
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true })
}

if (errors.length > 0) {
  console.error('v1 release audit failed:')
  for (const error of errors) console.error(`- ${error}`)
  process.exitCode = 1
} else {
  console.log(
    `v1 release audit passed (${conformant.length} components; ${packageJson.version}; rollback ${rollbackTag})`,
  )
}
