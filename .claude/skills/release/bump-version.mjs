#!/usr/bin/env node
// Bumps package.json, package-lock.json, and scripts/check-release.mjs's
// releaseVersion constant together, and refuses to exit 0 unless all three
// agree afterward.
//
// Why this exists: `npm version` already keeps package.json and
// package-lock.json in sync in one call, but it doesn't know about the
// third place this repo pins the version — check-release.mjs's own
// releaseVersion constant, which check:release gates the release on. T39
// needed a standalone follow-up commit ("bump the lockfile to 1.2.0") after
// a hand edit missed the lockfile half of that sync; this script removes
// the hand-edit step entirely so that class of drift can't recur.
//
// Usage: node .claude/skills/release/bump-version.mjs <patch|minor|major|X.Y.Z>

import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const arg = process.argv[2]
const isKeyword = ['patch', 'minor', 'major'].includes(arg)
const isExact = /^\d+\.\d+\.\d+$/.test(arg ?? '')

if (!arg || !(isKeyword || isExact)) {
  console.error('Usage: node bump-version.mjs <patch|minor|major|X.Y.Z>')
  process.exit(1)
}

const packageJsonPath = path.join(root, 'package.json')
const checkReleasePath = path.join(root, 'scripts/check-release.mjs')
const releaseVersionPattern = /const releaseVersion = '[^']*'/

execFileSync('npm', ['version', arg, '--no-git-tag-version'], { cwd: root, stdio: 'inherit' })

const newVersion = JSON.parse(await readFile(packageJsonPath, 'utf8')).version

const checkRelease = await readFile(checkReleasePath, 'utf8')
if (!releaseVersionPattern.test(checkRelease)) {
  console.error(
    `could not find "const releaseVersion = '...'" in scripts/check-release.mjs — ` +
      'the file moved or was rewritten; update it by hand.',
  )
  process.exit(1)
}
await writeFile(
  checkReleasePath,
  checkRelease.replace(releaseVersionPattern, `const releaseVersion = '${newVersion}'`),
)

const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'))
const lock = JSON.parse(await readFile(path.join(root, 'package-lock.json'), 'utf8'))
const releaseVersionAfter = (await readFile(checkReleasePath, 'utf8'))
  .match(releaseVersionPattern)[0]
  .match(/'([^']*)'/)[1]

const rows = [
  ['package.json', packageJson.version],
  ['package-lock.json (root)', lock.version],
  ['package-lock.json (packages[""])', lock.packages?.['']?.version],
  ['scripts/check-release.mjs releaseVersion', releaseVersionAfter],
]

console.log('')
for (const [label, value] of rows) {
  console.log(`${value === newVersion ? 'OK  ' : 'FAIL'}  ${label.padEnd(40)} ${value}`)
}

const mismatched = rows.filter(([, value]) => value !== newVersion)
if (mismatched.length > 0) {
  console.error(`\n${mismatched.length} file(s) did not land on ${newVersion}. Fix by hand before continuing.`)
  process.exit(1)
}

console.log(`\nAll four version references agree at ${newVersion}.`)
console.log('Next: write the release docs (see SKILL.md), then npm run verify.')
