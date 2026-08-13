#!/usr/bin/env node
// Confirms a registry publish actually shipped the fix, not just a version
// bump, and reports findings Claude can quote directly into a task's
// completion evidence. Reproduces by hand what T34/T37/T58/T60 each did ad
// hoc: check the registry has the version and it's `latest`, check the git
// tag exists locally AND on origin at the same commit, re-download the
// tarball fresh from the registry (never trust the one built locally before
// publish), and grep the extracted package for evidence the real fix landed.
//
// Usage:
//   node .claude/skills/release/verify-published.mjs <version> \
//     [--grep <path-inside-package>:<regex-source>]...
//
// Example:
//   node .claude/skills/release/verify-published.mjs 1.2.2 \
//     --grep 'dist/styles.css:inline-size:max\(var\(--m3e-comp-switch-minimum-interactive-target'
//
// Every --grep pattern is a JS RegExp source matched against the named file
// extracted from the freshly re-downloaded tarball — escape literal parens,
// dots, etc. Passing zero --grep patterns still checks registry/tag identity,
// but prints a reminder that fix content was not checked.

import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const [version, ...rest] = process.argv.slice(2)

if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('Usage: node verify-published.mjs <version> [--grep <path>:<regex-source>]...')
  process.exit(1)
}

const greps = []
for (let index = 0; index < rest.length; index++) {
  if (rest[index] !== '--grep') continue
  const spec = rest[++index]
  const separator = spec?.indexOf(':') ?? -1
  if (separator < 1) {
    console.error(`--grep expects <path-inside-package>:<regex-source>, got: ${spec}`)
    process.exit(1)
  }
  greps.push({ file: spec.slice(0, separator), pattern: spec.slice(separator + 1) })
}

const name = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8')).name
const tag = `v${version}`
const findings = []
const ok = (label) => findings.push({ passed: true, label })
const fail = (label) => findings.push({ passed: false, label })

const quiet = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }

let versions = []
let distTags = {}
try {
  versions = JSON.parse(execFileSync('npm', ['view', name, 'versions', '--json'], quiet))
  distTags = JSON.parse(execFileSync('npm', ['view', name, 'dist-tags', '--json'], quiet))
} catch (error) {
  fail(`npm view ${name} failed: ${(error.stderr || error.message).toString().trim().split('\n')[0]}`)
}
if (versions.includes(version)) ok(`registry lists ${name}@${version}`)
else fail(`registry does NOT list ${name}@${version} — publish may not have landed yet`)
if (distTags.latest === version) ok(`dist-tags.latest is ${version}`)
else fail(`dist-tags.latest is ${distTags.latest ?? '(unknown)'}, not ${version}`)

let localTagCommit = ''
let remoteTagCommit = ''
try {
  localTagCommit = execFileSync('git', ['rev-list', '-n', '1', tag], { cwd: root, ...quiet }).trim()
  ok(`local tag ${tag} exists, at ${localTagCommit.slice(0, 7)}`)
} catch {
  fail(`local tag ${tag} does not exist`)
}
try {
  const lines = execFileSync('git', ['ls-remote', '--tags', 'origin', tag], { cwd: root, ...quiet })
    .trim()
    .split('\n')
    .filter(Boolean)
  // An annotated tag lists both the tag object and a `^{}`-peeled line
  // pointing at the commit; a lightweight tag lists only the commit. Prefer
  // the peeled line when present so both tag styles resolve to a commit.
  const peeled = lines.find((line) => line.endsWith('^{}'))
  remoteTagCommit = (peeled ?? lines[0] ?? '').split(/\s+/)[0]
  if (remoteTagCommit) ok(`${tag} pushed to origin, at ${remoteTagCommit.slice(0, 7)}`)
  else fail(`${tag} not found on origin`)
} catch (error) {
  fail(`git ls-remote --tags origin failed: ${(error.stderr || error.message).toString().trim().split('\n')[0]}`)
}
if (localTagCommit && remoteTagCommit && localTagCommit !== remoteTagCommit) {
  fail(`local ${tag} (${localTagCommit.slice(0, 7)}) and origin's ${tag} (${remoteTagCommit.slice(0, 7)}) point at different commits`)
}

const scratch = await mkdtemp(path.join(os.tmpdir(), 'm3e-release-verify-'))
try {
  let packResult
  try {
    packResult = JSON.parse(
      execFileSync('npm', ['pack', `${name}@${version}`, '--json', '--pack-destination', scratch], quiet),
    )[0]
    ok(`re-downloaded tarball ${packResult.filename}: ${packResult.size} bytes, shasum ${packResult.shasum}`)
  } catch (error) {
    fail(`npm pack ${name}@${version} failed: ${(error.stderr || error.message).toString().trim().split('\n')[0]}`)
  }

  if (packResult && greps.length === 0) {
    ok('no --grep pattern given — only registry/tag identity was checked, not fix content')
  }

  if (packResult) {
    const tarballPath = path.join(scratch, packResult.filename)
    for (const { file, pattern } of greps) {
      try {
        const content = execFileSync('tar', ['-xOf', tarballPath, `package/${file}`], quiet)
        if (new RegExp(pattern).test(content)) ok(`package/${file} matches /${pattern}/`)
        else fail(`package/${file} does NOT match /${pattern}/ — the fix may be absent from this artifact`)
      } catch (error) {
        fail(`could not read package/${file} from the tarball: ${(error.stderr || error.message).toString().trim().split('\n')[0]}`)
      }
    }
  }
} finally {
  await rm(scratch, { recursive: true, force: true })
}

console.log('')
for (const { passed, label } of findings) console.log(`${passed ? 'OK  ' : 'FAIL'}  ${label}`)

const failedCount = findings.filter((finding) => !finding.passed).length
console.log('')
if (failedCount > 0) {
  console.error(`${failedCount} check(s) failed. Do not write completion evidence claiming the release is verified.`)
  process.exit(1)
}
console.log(`All checks passed for ${name}@${version}.`)
