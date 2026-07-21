# Active v1 task

## T30 — 1.0.1 patch release

Status: complete
Approved: 2026-07-21
Completed: 2026-07-21

### Scope

T29 repaired a real defect (`FabMenu` item elevation clipped to a rectangle)
after `1.0.0` was already published to npm, so the fix exists on `main` but not
in the registry. This task prepares and tags a `1.0.1` patch release carrying
that fix. It also backfills the `v1.0.0` git tag, which was never created when
`1.0.0` was published — `check:release` pins its rollback boundary to a tag,
and the release history should not have a published version with no
corresponding tag.

- Tag `v1.0.0` on the commit where `package.json` first read `"version":
  "1.0.0"` (`c5eb363`), so the registry and the git history agree.
- Bump `package.json` to `1.0.1`. No export, prop, token, or dependency change
  accompanies it — the diff since `1.0.0` is the `FabMenu` CSS repair, its
  regression test, and the rendering-audit script and CI job.
- Update `scripts/check-release.mjs`'s hardcoded `releaseVersion` to `1.0.1`.
  `rollbackVersion`/`rollbackTag` stay `0.3.0`/`v0.3.0` — that boundary marks
  the last release before the incompatible 1.0 cutover, which is still the
  correct rollback target for a same-major patch.
- Add a `## 1.0.1` entry to `docs/RELEASE_NOTES.md` documenting the `FabMenu`
  fix and the new rendering-audit script, in the same format as `## 1.0.0`.
- Update `docs/RELEASE_READINESS.md`'s release line, audit date, and verify
  totals for `1.0.1`, and add a short section distinguishing this audit from
  the `1.0.0` cutover: same 32 components and same public surface, the only
  behavioral change is the repaired defect.
- Run `npm run verify` and confirm it passes at `1.0.1`.
- Tag `v1.0.1` locally once the above is committed.

Publication (`npm publish`), pushing the release commit, and pushing either tag
to `origin` are explicitly out of this task's execution — they are separate,
owner-approved steps taken after this task's output is reviewed.

### Expected files

- Modified: `package.json`, `scripts/check-release.mjs`,
  `docs/RELEASE_NOTES.md`, `docs/RELEASE_READINESS.md`.
- Added: git tags `v1.0.0` (backfilled) and `v1.0.1`, local only.

### Acceptance checks

- `git show v1.0.0:package.json` reports version `1.0.0`.
- `npm run verify` passes with `package.json` at `1.0.1`.
- `docs/RELEASE_NOTES.md` and `docs/RELEASE_READINESS.md` both read correctly
  as a continuous history rather than being overwritten in place.
- No public export, prop type, or token value changed from `1.0.0`.
- Nothing is pushed to `origin` and nothing is published to the registry as
  part of this task.

### Completion evidence

- `git show v1.0.0:package.json` reports `"version": "1.0.0"` — the backfilled
  tag correctly identifies the commit (`c5eb363`) where the version first read
  `1.0.0`, closing the gap between the published registry version and git
  history.
- `package.json` is `1.0.1`; `scripts/check-release.mjs`'s `releaseVersion`
  matches; `rollbackVersion`/`rollbackTag` stayed `0.3.0`/`v0.3.0`, the correct
  boundary for a same-major patch.
- `docs/RELEASE_NOTES.md` gained a `## 1.0.1` entry above `## 1.0.0`, listing
  the `FabMenu` fix and the new rendering-audit script; `## 1.0.0` is
  untouched.
- `docs/RELEASE_READINESS.md` was restructured from a single `1.0.0` report
  into dated sections, `## 1.0.1` above the unmodified `## 1.0.0`, so the
  document reads as continuous history rather than being overwritten.
- `npm run verify` passed in full at `1.0.1`: 13 gates, 165 test files / 943
  tests (one more than `1.0.0`, the `FabMenu` regression test), release
  contract, bundle budgets, and the documentation-site structure check all
  green.
- Tag `v1.0.1` created locally on the release commit.

Publishing to the registry and pushing the release commit or either tag to
`origin` were explicitly out of scope and were not done.
