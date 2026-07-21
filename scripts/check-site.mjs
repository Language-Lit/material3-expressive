import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { buildRegistrySource, registryPath } from './generate-site-demos.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const siteRoot = path.join(root, 'site')
const inventoryPath = path.join(root, 'docs/component-inventory.json')
const examplesRoot = path.join(root, 'playground/examples')
const componentDocsRoot = path.join(root, 'docs/components')

const errors = []

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
  const files = await Promise.all(
    entries.map(async (entry) => {
      const target = path.join(directory, entry.name)
      if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out') {
        return []
      }
      return entry.isDirectory() ? walk(target) : [target]
    }),
  )
  return files.flat()
}

const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const conformant = inventory.components
  .filter((component) => component.status === 'conformant')
  .map((component) => component.name)
  .sort((left, right) => left.localeCompare(right))

// ---------------------------------------------------------------------------
// 1. The site presents exactly the conformant surface, and never more.
// ---------------------------------------------------------------------------

const componentRoute = path.join(siteRoot, 'app/components/[component]/page.tsx')
if (!(await exists(componentRoute))) {
  errors.push('Missing site/app/components/[component]/page.tsx')
}

for (const name of conformant) {
  if (!(await exists(path.join(componentDocsRoot, `${name}.md`)))) {
    errors.push(`Conformant component has no documentation page: docs/components/${name}.md`)
  }
}

// ---------------------------------------------------------------------------
// 2. Every conformant component has a demo, or a recorded reason it cannot.
// ---------------------------------------------------------------------------

const exampleNames = (await readdir(examplesRoot))
  .filter((entry) => entry.endsWith('.example.tsx'))
  .map((entry) => entry.replace('.example.tsx', ''))

for (const name of exampleNames) {
  if (!conformant.includes(name)) {
    errors.push(
      `playground/examples/${name}.example.tsx has no conformant inventory entry; ` +
        'the site would render a demo for a component it does not advertise',
    )
  }
}

const examplesModule = await readFile(path.join(siteRoot, 'content/examples.ts'), 'utf8')
const exemptedBlock = examplesModule.match(
  /componentsWithoutExample: Record<string, string> = \{([\s\S]*?)\n\}/,
)
if (!exemptedBlock) {
  errors.push('Could not read componentsWithoutExample from site/content/examples.ts')
} else {
  const exempted = [...exemptedBlock[1].matchAll(/^\s{2}(\w+):/gm)].map((match) => match[1])
  const undemonstrated = conformant.filter((name) => !exampleNames.includes(name))

  for (const name of undemonstrated) {
    if (!exempted.includes(name)) {
      errors.push(
        `${name} is conformant but has no playground example and no recorded exemption. ` +
          `Add playground/examples/${name}.example.tsx, or record why it cannot exist in ` +
          'site/content/examples.ts.',
      )
    }
  }

  for (const name of exempted) {
    if (!conformant.includes(name)) {
      errors.push(`${name} is exempted from having a demo but is not a conformant component`)
    } else if (exampleNames.includes(name)) {
      errors.push(
        `${name} is exempted from having a demo but playground/examples/${name}.example.tsx exists`,
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 3. The generated demo registry is current.
// ---------------------------------------------------------------------------

const expectedRegistry = await buildRegistrySource()
const actualRegistry = (await exists(registryPath))
  ? await readFile(registryPath, 'utf8')
  : null

if (actualRegistry === null) {
  errors.push('site/demos/registry.tsx is missing; run npm run generate:site-demos')
} else if (actualRegistry !== expectedRegistry) {
  errors.push('site/demos/registry.tsx is stale; run npm run generate:site-demos')
}

// ---------------------------------------------------------------------------
// 4. The site consumes the package only through its published export map.
// ---------------------------------------------------------------------------

const allowedEntries = new Set([
  '@language-lit/material3-expressive',
  '@language-lit/material3-expressive/theme',
  '@language-lit/material3-expressive/tokens',
  '@language-lit/material3-expressive/styles.css',
])

const siteSources = (await walk(siteRoot)).filter((file) => /\.(tsx?|mjs|css)$/.test(file))

for (const file of siteSources) {
  const source = await readFile(file, 'utf8')
  const relative = path.relative(root, file)

  for (const match of source.matchAll(/['"](@language-lit\/material3-expressive[^'"]*)['"]/g)) {
    if (!allowedEntries.has(match[1])) {
      errors.push(
        `${relative} imports "${match[1]}", which the package export map does not expose. ` +
          'The site must consume the library exactly as a published consumer does (ADR 0028).',
      )
    }
  }

  // A relative path that climbs out of `site/` into the library's source tree
  // would bypass the export map without naming the package at all.
  for (const match of source.matchAll(/from\s+['"](\.\.[^'"]*)['"]/g)) {
    const resolved = path.resolve(path.dirname(file), match[1])
    if (resolved.startsWith(path.join(root, 'src'))) {
      errors.push(
        `${relative} reaches into src/ via "${match[1]}". The site may not deep-import the ` +
          'library implementation (ADR 0028).',
      )
    }
  }
}

// ---------------------------------------------------------------------------
// 5. The site is not a dependency of the library, and ships no UI dependency.
// ---------------------------------------------------------------------------

const libraryTrees = ['src', 'tests', 'playground']
for (const tree of libraryTrees) {
  for (const file of await walk(path.join(root, tree))) {
    if (!/\.(tsx?|mjs)$/.test(file)) continue
    const source = await readFile(file, 'utf8')
    if (/from\s+['"][^'"]*\bsite\//.test(source)) {
      errors.push(
        `${path.relative(root, file)} imports from site/. The site depends on the library, ` +
          'never the reverse (ADR 0028).',
      )
    }
  }
}

const sitePackage = JSON.parse(await readFile(path.join(siteRoot, 'package.json'), 'utf8'))
const allowedDependencies = new Set([
  '@language-lit/material3-expressive',
  'next',
  'react',
  'react-dom',
  // Build-time Markdown rendering. Not a UI, styling, or component dependency:
  // it produces HTML during the build and ships nothing to the browser.
  'marked',
])

for (const name of Object.keys(sitePackage.dependencies ?? {})) {
  if (!allowedDependencies.has(name)) {
    errors.push(
      `site/package.json declares dependency "${name}". The site's interface is built from ` +
        'the library; adding a UI, styling, or component dependency needs owner approval.',
    )
  }
}

const libraryPackage = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
if (libraryPackage.files.some((entry) => entry.includes('site'))) {
  errors.push('package.json "files" would publish the site into the package tarball')
}

// ---------------------------------------------------------------------------

if (errors.length > 0) {
  process.stderr.write(`Site checks failed:\n${errors.map((line) => `  - ${line}`).join('\n')}\n`)
  process.exit(1)
}

process.stdout.write(
  `Site checks passed: ${conformant.length} conformant components, ` +
    `${exampleNames.length} demos, export map respected\n`,
)
