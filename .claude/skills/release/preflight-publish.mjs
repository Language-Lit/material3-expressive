#!/usr/bin/env node
// Checks npm auth BEFORE `npm publish` is attempted, not after.
//
// Why this exists: an expired local npm session makes `npm publish` fail
// with a 404 on the registry PUT, not a 401 — npm won't confirm or deny a
// *scoped* package's existence to an unauthenticated caller, so the real
// cause (expired session) reads as "package not found" or "no permission".
// This exact symptom hit the 1.0.2 publish (T34) and the 1.2.2 publish
// (T60), both resolved by a plain `npm login`. `npm whoami` surfaces the
// real 401 directly and costs one command.
//
// Usage: node .claude/skills/release/preflight-publish.mjs

import { execFileSync } from 'node:child_process'
import process from 'node:process'

let username
try {
  username = execFileSync('npm', ['whoami'], { encoding: 'utf8' }).trim()
} catch {
  console.error('Not logged in to npm, or the session has expired.')
  console.error(
    "This is the same cause that later shows up as a confusing 404 on `npm publish` " +
      "for a scoped package — npm won't confirm or deny the package exists to a logged-out caller.",
  )
  console.error('\nRun `npm login` in your own terminal, then re-run this check before `npm publish`.')
  process.exit(1)
}

let registry
try {
  registry = execFileSync('npm', ['config', 'get', 'registry'], { encoding: 'utf8' }).trim()
} catch {
  registry = '(could not read)'
}

console.log(`Logged in to npm as: ${username}`)
console.log(`Registry: ${registry}`)
console.log('\nReady for `npm publish`. (2FA/granular-token prompts, if any, happen inside that command itself.)')
