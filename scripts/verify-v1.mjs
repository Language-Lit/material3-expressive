import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checks = [
  ['Typecheck all source', 'typecheck'],
  ['Run legacy and v1 tests', 'test'],
  ['Build distributable package', 'build'],
  ['Typecheck isolated v1 source', 'typecheck:v1'],
  ['Validate v1 architecture', 'check:v1:architecture'],
  ['Validate browser support', 'check:v1:browsers'],
  ['Validate v1 CSS boundary', 'check:v1:styles'],
  ['Validate v1 token contract', 'check:v1:tokens'],
  ['Validate frozen legacy contract', 'check:legacy-contract'],
  ['Validate bundle-size budgets', 'check:bundle-size'],
  ['Build packed consumer fixtures', 'check:consumer-fixtures'],
]

for (const [label, script] of checks) {
  console.log(`\n=== ${label} ===`)
  execFileSync('npm', ['run', script], { cwd: root, stdio: 'inherit' })
}

console.log(`\nv1 aggregate verification passed (${checks.length} gates).`)
