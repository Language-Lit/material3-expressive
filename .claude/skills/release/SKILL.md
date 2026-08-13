---
name: release
description: Prepare, hand off, and record an npm release of @language-lit/material3-expressive (RELEASE_NOTES/RELEASE_READINESS/SPEC/ACTIVE_TASK entries, version bump, npm-auth preflight, post-publish verification). Use when asked to publish, release, or ship a fix/feature to npm, or to verify a publish that already happened.
---

Three phases, two different owners. **Prepare** and **Record** are done from
this session. **Publish** is never done from this session — this repository
has two recorded incidents of a publishing token being transmitted in an
assistant session (`docs/ACTIVE_TASK.md` T34's follow-up, T37's outright
refusal), so since T37 the boundary has been that the owner runs `npm
publish`, creates the tag, and pushes it, from their own terminal.

This skill exists because the same four things went wrong more than once
across `docs/ACTIVE_TASK.md`'s T30/T34/T37/T39/T58/T60:

1. **An expired npm session reads as a confusing 404, not a 401.** npm won't
   confirm or deny a *scoped* package's existence to a logged-out caller, so
   `npm publish` fails with "package could not be found" when the real cause
   is just an expired login. Hit the 1.0.2 publish (T34) and the 1.2.2
   publish (T60), both fixed by a plain `npm login`.
2. **The version has to agree in four places** — `package.json`,
   `package-lock.json`'s root `version`, its `packages[""].version`, and
   `scripts/check-release.mjs`'s `releaseVersion` constant — and T39 needed a
   standalone follow-up commit ("bump the lockfile to 1.2.0") after a hand
   edit missed one.
3. **The release-doc format has to be re-derived from old entries every
   time**, because it lives only as precedent in `docs/RELEASE_NOTES.md` /
   `docs/RELEASE_READINESS.md` history, not as a template anywhere.
   `check:release` (`scripts/check-release.mjs`) hard-fails the whole
   aggregate `npm run verify` if the readiness entry doesn't contain three
   exact strings — see below.
4. **A release that ships only the version bump looks identical to one that
   ships the fix**, unless someone re-downloads the actual published tarball
   and checks its contents. Every prior release did this by hand, ad hoc,
   with slightly different rigor each time.

Three scripts here fix each of 1, 2, and 4. Nothing yet automates 3 — the
templates below are the reference so writing those docs doesn't require
re-reading four old task entries first.

## Phase 1 — Prepare (this session)

Preconditions: the fix/feature this release ships is already committed on
`main` (or whatever branch the owner publishes from). This skill does not
implement fixes, only ships them.

1. **Decide the version.** Patch for a pure repair, minor for new public
   surface, matching every prior release in `docs/ACTIVE_TASK.md`. Look at
   `npm view @language-lit/material3-expressive dist-tags --json` if you're
   not sure what the registry currently holds — the working tree's
   `package.json` version and the registry's `latest` can drift (T34 shipped
   `1.0.2` because a prepared-but-never-published `1.0.1` had already
   consumed that number).

2. **Bump the version:**

   ```bash
   node .claude/skills/release/bump-version.mjs patch   # or: minor, major, or an exact X.Y.Z
   ```

   Confirms all four references land together and refuses to exit 0
   otherwise. If it fails, fix the reported file by hand — don't re-run it
   blindly.

3. **Write the four release docs.** Templates below are lifted from the real
   `1.2.2` entries (T59/T60) — copy the shape, replace the content, don't
   invent a new structure.

4. **Run the full gate:**

   ```bash
   npm run verify
   ```

   This must include `check:release` passing. If your release changed
   interactive geometry, elevation, or state layers, also run the real-browser
   audit (`npm run build && npm run playground:build && M3E_CHROMIUM_PATH=<path> npm run audit:rendering`)
   before this step, per `AGENTS.md`.

5. **Commit the prep**, message `release: prepare the X.Y.Z <patch|minor>`.
   Do not push unless the owner asks — every prior release commit landed on
   `main` locally first, then the owner published from it.

6. **Hand off explicitly.** Tell the owner the exact commands, in order:

   ```bash
   node .claude/skills/release/preflight-publish.mjs   # catches the expired-session case before it becomes a confusing 404
   npm publish
   git tag vX.Y.Z && git push origin main --tags
   ```

   Do not just say "you can publish now" — the whole point of the preflight
   script is that it gets run *before* `npm publish`, not after it fails.

### Required strings

`check:release` fails the build unless `docs/RELEASE_READINESS.md` contains
these three literal strings (`scripts/check-release.mjs` lines 112–114):

```
Release: `@language-lit/material3-expressive@X.Y.Z`
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)
Registry publication: not performed
```

The rollback identity is a fixed historical constant (`0.3.0` / `v0.3.0`, the
last pre-1.0 surface) — never the previous release version. Get the version
number and package name exactly right; `check:release` does a literal
substring match, not a semver comparison.

### `docs/RELEASE_NOTES.md` template

Insert as a new section directly under the `# Release notes` heading, above
the previous entry:

```markdown
## X.Y.Z — YYYY-MM-DD

Status: prepared patch release. No export, prop, token, or dependency change;
the public surface is identical to `<previous version>`.

### Fixed  <!-- or ### Added, for a minor -->

- **`ComponentName`: one-line symptom, as a user or downstream session would
  report it.** Root cause in plain terms — what the wrapper/rule/handler
  actually did wrong, not just what the correct value is. Cite the upstream
  Compose behavior if this is a conformance gap, not just an ergonomic one:
  quote the exact API/KDoc/constant that upstream applies and how the web
  control diverged from it. Note whether the defect predates `1.0.0` and
  whether it's an every-published-version issue. (T<NN>)
```

### `docs/RELEASE_READINESS.md` template

Same insertion point, above the previous entry:

```markdown
## X.Y.Z — YYYY-MM-DD

Audit date: YYYY-MM-DD  
Release: `@language-lit/material3-expressive@X.Y.Z`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit.

### Recommendation

**GO for a separately owner-approved `X.Y.Z` release.** This is a
patch/minor, not a cutover: the public surface is byte-for-byte identical to
`<previous>` — same N conformant components, same exports, same token values,
same dependency-free package.  <!-- or, for a minor: describe what's new -->

### What changed since <previous>

- **`ComponentName`** (T<NN>): one paragraph, same content as the release
  note but written for someone auditing the release rather than reading
  changelog prose.
- No export, prop type, token value, or dependency changed.  <!-- if true -->
- One rendered dimension moves: ...  <!-- only if something visibly shifts -->

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: N gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: N files, N tests |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: N inventory entries |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: N components; `X.Y.Z` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next against the packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: N components, N demos |
| Real-Chromium rendering audit | `npm run audit:rendering` (separate) | Pass, or: not re-run, no geometry/elevation/state-layer change since the last audited commit |

### Remaining boundaries

Unchanged from `<previous>`.  <!-- unless something genuinely changed -->
```

Fill in the numbers from the actual `npm run verify` output you just ran —
never copy them from the previous entry. Pulling a stale count forward is
exactly the kind of drift this skill exists to stop.

### `docs/SPEC.md` ledger row

Append **after the last row** in the `## 14. Task-by-task implementation
order` table — never insert mid-table by version-number position. T-numbers
are strictly
monotonic by commit order, and inserting out of order is an easy mistake (it
happened once preparing T60: the release-task row went in before the fix-task
row it referenced, caught and fixed before commit).

```markdown
| T<NN> | X.Y.Z patch release | The T<MM> `ComponentName` repair released as `X.Y.Z`; no export, prop, token, or dependency change from `<previous>` |
```

### `docs/ACTIVE_TASK.md` task entry

Append at the end of the file, following the exact section shape every prior
release task uses (`## T<NN> — X.Y.Z patch release`, `Status: prepared;
publication pending` initially, `Scope` / `Expected files` / `Acceptance
checks` / `Completion evidence: To be completed after publication.` / `Not
done` explaining the owner-only publish boundary). Copy T58 or T60's full
entry as the shape reference rather than reconstructing it from this summary.

## Phase 2 — Publish (owner only, never this session)

Nothing to automate here beyond the preflight script above. If a publish
attempt already failed with `E404`, the fix is almost always `npm login`
followed by a retry — confirm with `npm whoami` first rather than guessing.

## Phase 3 — Record (this session, after the owner confirms publish)

1. **Verify the artifact, not just the version number:**

   ```bash
   node .claude/skills/release/verify-published.mjs X.Y.Z \
     --grep '<path-inside-package>:<regex-source-matching-the-actual-fix>'
   ```

   Pick the `--grep` target from what you know changed — a CSS declaration, a
   specific string in `dist/index.js`, whatever is the smallest evidence that
   the real fix (not just a version bump) is in the artifact the registry now
   serves. Multiple `--grep` flags are fine. Zero is allowed but weaker — it
   only proves the version and tag are right, not that the fix shipped.

   This checks, in one pass: the registry lists the version and it's
   `dist-tags.latest`; the local **and** remote `vX.Y.Z` git tag exist and
   point at the same commit; a freshly re-downloaded tarball's size/shasum;
   and your `--grep` patterns against the extracted package. Non-zero exit
   means something is wrong — don't write completion evidence past a failing
   run.

2. **Update `docs/ACTIVE_TASK.md`'s release task**: flip `Status` to
   `complete`, add a `Completed: YYYY-MM-DD` line, and replace `Completion
   evidence: To be completed after publication.` with the script's findings —
   quote the registry versions list, the tag commits, the tarball
   size/shasum, and which `--grep` patterns matched. If the first publish
   attempt hit the `E404`/expired-session case, record that too (it's useful
   precedent for the next release, same as T34's and T60's entries record it
   for this one).

3. **Update `docs/RELEASE_READINESS.md`**: replace `Registry publication: not
   performed at the time of this audit.` with the publish date, commit, and
   the same artifact evidence.

4. **Commit**, message `release: record the X.Y.Z registry publication`.

## Gotchas

- **`npm version <keyword> --no-git-tag-version` already keeps
  `package.json`/`package-lock.json` in sync by itself** — the script's only
  real job beyond that call is the third file, `check-release.mjs`'s
  constant, which `npm version` has no way to know about.
- **Don't let `bump-version.mjs` run against a dirty tree you don't
  recognize.** It only edits three files and never commits, so a mistaken run
  is `git checkout -- package.json package-lock.json scripts/check-release.mjs`
  away from undone — but check `git status` first per the standing rule
  before discarding anything, in case unrelated work is sitting there too.
- **`verify-published.mjs`'s `--grep` pattern is a JS `RegExp` source, not a
  literal string** — escape parens/dots if the fix signature contains them
  (CSS `max(...)` calls need `\(`/`\)`).
- **A lightweight and an annotated git tag report differently from `git
  ls-remote --tags`** — an annotated tag shows both the tag object and a
  `^{}`-peeled line pointing at the commit; a lightweight tag shows only the
  commit directly. `verify-published.mjs` already handles both; if you're
  ever checking a tag by hand, don't assume the first line is the commit.
- **The registry's 404-not-401 behavior on a logged-out scoped-package
  publish is itself worth remembering** even outside this skill — it's the
  single most repeated point of confusion across every release in this
  repo's history, and `npm whoami` is the one command that tells the truth.
