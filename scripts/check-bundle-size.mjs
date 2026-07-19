import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const budgets = JSON.parse(readFileSync(path.join(root, 'docs/v1/bundle-budgets.json'), 'utf8'))
const temporaryRoot = mkdtempSync(path.join(os.tmpdir(), 'm3e-v1-size-'))
const errors = []

function checkLimit(label, actual, maximum) {
  if (actual > maximum) errors.push(`${label}: ${actual} bytes exceeds ${maximum} bytes`)
  return `${label} ${actual}/${maximum} bytes`
}

try {
  const reports = []
  for (const [artifact, budget] of Object.entries(budgets.artifacts)) {
    if (artifact === 'packedPackage') continue
    const contents = readFileSync(path.join(root, artifact))
    reports.push(checkLimit(artifact, contents.byteLength, budget.maxBytes))
    reports.push(checkLimit(`${artifact} gzip`, gzipSync(contents, { level: 9 }).byteLength, budget.maxGzipBytes))
  }

  const output = execFileSync(
    'npm',
    ['pack', '--json', '--ignore-scripts', '--pack-destination', temporaryRoot],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, npm_config_cache: path.join(temporaryRoot, 'npm-cache') },
    },
  )
  const [{ size }] = JSON.parse(output)
  reports.push(checkLimit('packed package', size, budgets.artifacts.packedPackage.maxBytes))

  if (errors.length > 0) {
    console.error('Bundle-size check failed:')
    for (const error of errors) console.error(`- ${error}`)
    console.error('A budget change requires a recorded decision; do not update baselines silently.')
    process.exitCode = 1
  } else {
    console.log(`Bundle-size budgets passed:\n- ${reports.join('\n- ')}`)
  }
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true })
}
