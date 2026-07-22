# Release-readiness audit

## 1.0.2 — 2026-07-22

Audit date: 2026-07-22  
Release: `@language-lit/material3-expressive@1.0.2`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed

### Recommendation

**GO for a separately owner-approved `1.0.2` release.** This is a patch, not a
cutover: the public surface is byte-for-byte identical to `1.0.0` — same 32
conformant components, same exports, same tokens, same dependency-free package.

The version skips `1.0.1` deliberately. `npm view` reports the registry holds
only `1.0.0-next.0` and `1.0.0`: the `1.0.1` audit below recorded
"Registry publication: not performed" and no publish ever followed, while the
`v1.0.1` tag was pushed to `origin` at `13d9449`. Republishing that tree as
`1.0.1` would put content in the registry that the pushed tag does not
describe, so the release moves forward instead and `1.0.1` remains a version
that never existed on npm. `1.0.2` therefore ships two patches, not one — a
consumer on `1.0.0` receives the `FabMenu` repair as well.

Publication and any git-tag push remain a separate owner-approved step outside
this audit.

### What changed since 1.0.0

- `NavigationDrawer`: the `'modal'` variant now dismisses on a scrim click. It
  previously wired `showModal()`/`close()` and a native `close` listener but no
  outside-click handling, so Escape was its only dismissal path and a pointer
  user who opened it was stuck. The repair ports `Dialog`'s existing manual
  light-dismiss hit test — native `<dialog>` has no automatic outside-click
  close at this library's browser floor. It closes a gap against two records
  that already specified the behavior: the component's documented contract and
  the pinned source's own clickable scrim (ADR 0020, amended; T33). Three
  regression tests were added, one of which was confirmed to fail against the
  unrepaired component.
- `FabMenu`, `scripts/audit-rendering.mjs`, and the documentation site: as
  described in the `1.0.1` audit below, all carried forward unpublished.
- No export, prop type, token value, or dependency changed.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 13 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 165 files, 946 tests (+3 `NavigationDrawer` regression tests since `1.0.1`) |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 32 inventory entries, 35 stylesheets, 1,493 properties |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 32 components; `1.0.2` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: packed package 306,961 / 342,900 bytes; every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 32 conformant components, 31 demos, export map respected |

### Remaining boundaries

Unchanged from `1.0.0` — see below.

- The rendering audit (`npm run audit:rendering`) was not re-run for this
  release. It needs a real Chromium, and T33 changed an event handler only —
  no geometry, elevation, or state layer moved.

## 1.0.1 — 2026-07-21

Audit date: 2026-07-21  
Release: `@language-lit/material3-expressive@1.0.1`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed — and never performed afterwards. The
`v1.0.1` tag was pushed, but the version was never published; its contents ship
in `1.0.2` above.

### Recommendation

**GO for a separately owner-approved `1.0.1` release.** This is a patch, not a
cutover: the public surface is byte-for-byte identical to `1.0.0` — same 32
conformant components, same exports, same tokens, same dependency-free
package. The only behavioral change is the repair described below, found by
the T29 browser rendering audit after `1.0.0` had already been published, so
the fix exists on `main` but not yet in the registry. Publication and any
git-tag push remain a separate owner-approved step outside this audit.

### What changed since 1.0.0

- `FabMenu`: `.m3e-fab-menu__item-slot` no longer sets `overflow: hidden`. The
  slot is exactly the size of the item it wraps, and the item's elevation
  shadow painted outside its border box, so the clip left only the shadow's
  corners and a rounded item read as a square halo. A regression test in
  `FabMenu.css.test.ts` asserts the slot rule stays unclipped.
- `scripts/audit-rendering.mjs` (`npm run audit:rendering`) was added: a
  Playwright-based check, run against the built playground, for elevation
  shadows clipped by an ancestor and interactive targets under WCAG 2.2 SC
  2.5.8. It requires a real browser, so it is documented in `AGENTS.md` rather
  than folded into `npm run verify`.
- The in-repository documentation site at `m3e.language-lit.com` (ADR 0028)
  was added and is verified structurally by `check:site`, one of the gates
  below; its own Next.js build is a separate CI job.
- No export, prop type, token value, or dependency changed.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 13 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 165 files, 943 tests (+1 `FabMenu` regression test since `1.0.0`) |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 32 inventory entries, 35 stylesheets, 1,493 properties |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 32 components; `1.0.1` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: packed package 306,435 / 342,900 bytes; every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 32 conformant components, 31 demos, export map respected |

The aggregate gate is 13 rather than `1.0.0`'s 12: `check:site` (T28) joined
after that audit. `npm run verify` was re-run in full for this audit and
passed at `1.0.1`.

### Remaining boundaries

Unchanged from `1.0.0` — see below.

## 1.0.0 — 2026-07-21

Audit date: 2026-07-21  
Release: `@language-lit/material3-expressive@1.0.0`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit; published
2026-07-21, no `v1.0.0` git tag was created at that time — backfilled onto the
same commit as part of the `1.0.1` release above.

### Recommendation

**GO for a separately owner-approved `1.0.0` release.** The cutover removed the
0.3 surface, flattened the parallel namespace, and reduced the package to a
single dependency-free surface. Every public repository gate passes. Publication,
remote release creation, and registry dist-tag changes require separate owner
approval and are outside this audit.

### Package and compatibility evidence

`npm run check:release` creates an ignored-script tarball in a temporary
directory, inspects its manifest and file list, and removes it. The gate checks:

- the exact `1.0.0` version and the closed export set `.`, `./theme`,
  `./tokens`, `./styles.css`;
- the absence of runtime dependencies, of a Tailwind peer, and of any peer
  beyond React and React DOM;
- existence of every exported file in the tarball and exclusion of source,
  tests, playground, scripts, and repository documentation;
- all 32 inventory entries against public barrels, component pages,
  conformance records, SSR tests, behavior tests, and examples; and
- the local versioned history boundary represented by tag `v0.3.0`, whose
  package manifest identifies the documented rollback version.

`1.0.0` reuses the package root for a new API, so this is a hard break rather
than an additive release. Rollback for a consumer is to restore the exact
`@language-lit/material3-expressive@0.3.x` dependency and its imports and
styles. Application-specific rollout procedures are deliberately outside this
public repository.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 12 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 165 files, 942 tests |
| Production playground | `npm run playground:build` (inside aggregate) | Pass: built from `dist` |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 32 inventory entries, 35 stylesheets, 1,493 properties |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 32 components; `1.0.0` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: package 306,055 / 342,900 bytes; every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed tarball |

### Cutover effects

- The packed tarball fell from 433,861 bytes to 306,055 bytes.
- `npm install` removed 82 packages; the package now declares no runtime
  dependencies.
- The aggregate gate went from 13 checks to 12: the frozen-contract guard and
  the isolated-typecheck gate were retired, and the release audit joined.
- Bundle baselines were re-measured for the single-surface artifacts. The
  previous `dist/styles.css` budget had less than 1% headroom remaining; the new
  baselines restore the recorded 12% allowance. ADR 0027 is the required
  decision record for that budget change.

### Remaining boundaries

- The support claim is limited to the generated component matrix.
- The 0.3 surface is gone from this version. Consumers not ready to migrate stay
  on the published `0.3.x` versions; this audit makes no claim about their
  migration.
- Automated coverage for the browser support matrix is compilation targets, CSS
  checks, semantic tests, and packed consumer builds. Broader visual regression
  automation remains a worthwhile post-release improvement.
- No registry availability, dist-tag, or remote release claim is made by this
  local audit.
- No private-consumer inventory, route, model, dependency, or rollout detail is
  part of this record.
