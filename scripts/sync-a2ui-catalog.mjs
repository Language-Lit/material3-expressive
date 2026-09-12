import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export const A2UI_CATALOG_ID =
  'https://m3e.language-lit.com/a2ui/catalogs/material3/catalog.json'
export const A2UI_CATALOG_ROUTE = 'a2ui/catalogs/material3/catalog.json'
export const A2UI_CATALOG_SOURCE_REPOSITORY =
  'https://github.com/Language-Lit/material3-expressive-a2ui.git'
export const A2UI_CATALOG_SOURCE_PATH = 'public/a2ui/catalogs/material3/catalog.json'
export const A2UI_CATALOG_GENERATOR_PATH = 'scripts/generate-material-catalog.mjs'

export const catalogPath = path.join(root, 'site/public', A2UI_CATALOG_ROUTE)
export const provenancePath = path.join(
  root,
  'site/public/a2ui/catalogs/material3/catalog.provenance.json',
)

function digest(bytes) {
  return createHash('sha256').update(bytes).digest('hex')
}

function parseCatalog(bytes, label) {
  let catalog
  try {
    catalog = JSON.parse(bytes.toString('utf8'))
  } catch (error) {
    throw new Error(`${label} is not valid JSON`, { cause: error })
  }
  if (catalog.$id !== A2UI_CATALOG_ID || catalog.catalogId !== A2UI_CATALOG_ID) {
    throw new Error(`${label} does not declare the hosted Material catalog id`)
  }
  if (!catalog.components || typeof catalog.components !== 'object') {
    throw new Error(`${label} does not declare a components object`)
  }
  return catalog
}

function buildProvenance(bytes, sourceRevision) {
  return {
    artifact: `site/public/${A2UI_CATALOG_ROUTE}`,
    route: `/${A2UI_CATALOG_ROUTE}`,
    catalogId: A2UI_CATALOG_ID,
    bytes: bytes.length,
    sha256: digest(bytes),
    source: {
      repository: A2UI_CATALOG_SOURCE_REPOSITORY,
      revision: sourceRevision,
      artifact: A2UI_CATALOG_SOURCE_PATH,
      generator: A2UI_CATALOG_GENERATOR_PATH,
      generationCommand: 'npm ci && npm run catalog:generate',
    },
    syncCommand:
      'npm run generate:site-a2ui-catalog -- --source /path/to/material3-expressive-a2ui',
  }
}

function serializeProvenance(provenance) {
  return `${JSON.stringify(provenance, null, 2)}\n`
}

async function readSourceRevision(sourceRoot, bytes) {
  const sourceArtifact = path.join(sourceRoot, A2UI_CATALOG_SOURCE_PATH)
  const relativeArtifact = path.relative(sourceRoot, sourceArtifact)
  let revision
  try {
    const result = await execFileAsync(
      'git',
      ['-C', sourceRoot, 'log', '-1', '--format=%H', '--', relativeArtifact],
      { encoding: 'utf8' },
    )
    revision = result.stdout.trim()
  } catch (error) {
    throw new Error(`Could not read catalog provenance from ${sourceRoot}`, { cause: error })
  }
  if (!/^[0-9a-f]{40}$/.test(revision)) {
    throw new Error(`No committed catalog provenance found in ${sourceRoot}`)
  }

  const result = await execFileAsync(
    'git',
    ['-C', sourceRoot, 'show', `${revision}:${A2UI_CATALOG_SOURCE_PATH}`],
    { encoding: 'buffer', maxBuffer: 1024 * 1024 },
  )
  if (!Buffer.from(result.stdout).equals(bytes)) {
    throw new Error(
      `Source artifact differs from ${revision}:${A2UI_CATALOG_SOURCE_PATH}; ` +
        'generate and commit it in the companion before syncing',
    )
  }
  return revision
}

export async function verifyA2uiCatalog() {
  let bytes
  let provenance
  try {
    bytes = await readFile(catalogPath)
  } catch (error) {
    throw new Error(`Missing site/public/${A2UI_CATALOG_ROUTE}`, { cause: error })
  }
  parseCatalog(bytes, `site/public/${A2UI_CATALOG_ROUTE}`)
  try {
    provenance = JSON.parse(await readFile(provenancePath, 'utf8'))
  } catch (error) {
    throw new Error(
      'Missing or invalid site/public/a2ui/catalogs/material3/catalog.provenance.json',
      { cause: error },
    )
  }

  const expected = buildProvenance(bytes, provenance?.source?.revision)
  if (!/^[0-9a-f]{40}$/.test(expected.source.revision ?? '')) {
    throw new Error('A2UI catalog provenance does not contain a full source revision')
  }
  if (serializeProvenance(provenance) !== serializeProvenance(expected)) {
    throw new Error(
      'A2UI catalog provenance or integrity is stale; regenerate it with ' +
        'npm run generate:site-a2ui-catalog',
    )
  }
  return { bytes: bytes.length, sha256: expected.sha256, revision: expected.source.revision }
}

async function syncCatalog(sourceRootArgument) {
  if (!sourceRootArgument) {
    throw new Error(
      'Missing --source /path/to/material3-expressive-a2ui. The source checkout is required ' +
        'only when updating the committed artifact.',
    )
  }
  const sourceRoot = path.resolve(sourceRootArgument)
  const sourcePackage = JSON.parse(await readFile(path.join(sourceRoot, 'package.json'), 'utf8'))
  if (sourcePackage.name !== '@language-lit/material3-expressive-a2ui') {
    throw new Error(`${sourceRoot} is not the material3-expressive-a2ui package`)
  }
  const bytes = await readFile(path.join(sourceRoot, A2UI_CATALOG_SOURCE_PATH))
  parseCatalog(bytes, `${sourceRoot}/${A2UI_CATALOG_SOURCE_PATH}`)
  const revision = await readSourceRevision(sourceRoot, bytes)
  const provenance = buildProvenance(bytes, revision)

  await mkdir(path.dirname(catalogPath), { recursive: true })
  await writeFile(catalogPath, bytes)
  await writeFile(provenancePath, serializeProvenance(provenance), 'utf8')
  process.stdout.write(
    `Synced ${bytes.length} bytes from ${revision}:${A2UI_CATALOG_SOURCE_PATH}\n` +
      `SHA-256 ${provenance.sha256}\n`,
  )
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (invokedDirectly) {
  if (process.argv.includes('--check')) {
    const result = await verifyA2uiCatalog()
    process.stdout.write(
      `A2UI catalog verified (${result.bytes} bytes, SHA-256 ${result.sha256})\n`,
    )
  } else {
    const sourceIndex = process.argv.indexOf('--source')
    await syncCatalog(sourceIndex === -1 ? undefined : process.argv[sourceIndex + 1])
  }
}
