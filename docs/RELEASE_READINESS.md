# Release-readiness audit

## 1.2.2 — 2026-08-13

Audit date: 2026-08-13  
Release: `@language-lit/material3-expressive@1.2.2`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit.

The `v1.2.1` tag owed by the previous entry now exists and is pushed, pointing
at `52ad093`, the commit `1.2.1` was published from. That gap is closed.

### Recommendation

**GO for a separately owner-approved `1.2.2` release.** This is a patch, not a
cutover: the public surface is byte-for-byte identical to `1.2.1` — same 41
conformant components, same exports, same token values, same dependency-free
package. One rendered geometry changes, and it is the repair itself.

### What changed since 1.2.1

- **`Switch`** (T59): the root sized its interaction box at the 48px minimum
  interactive target while the track paints 52px, and the native `<input>` is
  `inset: 0` inside that box, so 2px of visible track at each end was painted
  but not tappable. `minimumInteractiveComponentSize()` upstream is a per-axis
  `maxOf(placeable, 48dp)` — a floor that grows the target — where CSS
  `inline-size` is a clamp. The target is now `max()` on both axes and
  measures the source's 52×48.
- No export, prop type, token value, or dependency changed. The defect was in
  how the root consumed an existing token, not in any sourced value; all
  twelve `SwitchTokens.kt` dimensions already matched the registration.
- One rendered dimension moves: a `Switch` now occupies 52px of inline space
  instead of 48px. A consumer laying switches out in a fixed-width column may
  see 4px of reflow. This is the source's own geometry.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 14 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 225 files, 1,632 tests |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 41 inventory entries |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 41 components; `1.2.2` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: every budget green, unchanged from `1.2.1` |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 41 conformant components, 40 demos, export map respected |
| Real-Chromium rendering audit | `npm run audit:rendering` (separate; not part of the aggregate) | Pass, including the new hit-containment probe — proven to fail against the unrepaired build first |

### Remaining boundaries

Unchanged from `1.2.1`.

- This patch changes interactive geometry, so — unlike most patch releases —
  the rendering audit was re-run rather than skipped, and passed.
- The playground wraps every `Switch` in a `<label>`, which forwards a click
  from anywhere in its row, so the tap path exercised there is the forwarded
  one. The new audit gate measures hit containment geometrically instead,
  which is independent of label forwarding; that is the coverage the examples
  cannot provide.

## 1.2.1 — 2026-08-04

Audit date: 2026-08-04  
Release: `@language-lit/material3-expressive@1.2.1`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit; published
2026-08-04 from commit `52ad093` and confirmed as `latest`. The registry now
holds `1.0.0-next.0`, `1.0.0`, `1.0.2`, `1.0.3`, `1.1.0`, `1.2.0`, and
`1.2.1`. The published tarball was re-downloaded and its `dist/index.js`/
`dist/styles.css` checked directly to carry the T56/T57 repairs, not merely
the version bump. **The `v1.2.1` tag is not yet created** — still owed
against `52ad093`, the commit this was published from.

### Recommendation

**GO for a separately owner-approved `1.2.1` release.** This is a patch, not
a cutover: the public surface is byte-for-byte identical to `1.2.0` — same 41
conformant components, same exports, same tokens, same dependency-free
package.

### What changed since 1.2.0

- **`Tabs`** (T56): the sliding indicator's position was measured in
  viewport space while it is rendered inside a scrollable, absolutely
  positioned container — its own coordinate space is the scrolled content.
  Any measurement taken while the row was scrolled landed the indicator
  exactly `scrollLeft` pixels off; a fresh unscrolled mount was unaffected,
  which is why this shipped in `1.0.0` through `1.2.0` unnoticed and surfaced
  as a mobile-only report. Repaired alongside it: a logical indicator anchor
  that broke under RTL, and a `scrollIntoView` call that could scroll page
  ancestors instead of just the tab row (ADR 0019, amended).
- **`Carousel`** (T57): the parallax paint pass's item `z-index` (up to
  1000) had no stacking context scoping it to the carousel, so it joined the
  page's own stacking order and could paint over page chrome under
  `z-index: 1000`, such as a sticky header. Repaired with one `isolation:
  isolate` declaration (ADR 0040, amended).
- No export, prop type, token value, or dependency changed.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 14 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 225 files, 1,631 tests |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 41 inventory entries |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 41 components; `1.2.1` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: every budget green, unchanged from `1.2.0` |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed 476,163-byte tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 41 conformant components, 40 demos, export map respected |
| Real-Chromium rendering audit | `npm run audit:rendering` (separate; not part of the aggregate) | Pass, including the two new probes T56/T57 added — both proven to fail against their unrepaired builds first |

### Remaining boundaries

Unchanged from `1.2.0`.

- No new geometry, elevation, or state-layer surface was added, but both
  repairs *are* geometry/stacking fixes, so — unlike most patch releases —
  the rendering audit was re-run rather than skipped, and passed.

## 1.2.0 — 2026-07-26

Audit date: 2026-07-26  
Release: `@language-lit/material3-expressive@1.2.0`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit; published
2026-07-26 (`2026-07-25T16:58:46Z`) from commit `476259c` and confirmed as
`latest`. The registry now holds `1.0.0-next.0`, `1.0.0`, `1.0.2`, `1.0.3`,
`1.1.0`, and `1.2.0`. The published tarball's shasum is
`bf3ef69d2e238c8412e16474a737d50f8b1af15b` across 21 files, matching a local
`npm pack` of the audited tree byte for byte, so the artifact the registry
serves is the one the gates below verified.

The `v1.2.0` tag points at `5f08395`, one commit past the `gitHead` npm
recorded. That commit bumps `package-lock.json` from `1.1.0` to `1.2.0`, which
`476259c` missed; the lockfile is outside the packed `files` list, which the
matching shasum confirms. The tag was left where it is rather than moved,
because it is already pushed and the published bytes are unaffected.

This audit supersedes the T40 working-tree snapshot it replaces, which described
a 35-component tree that tranches P and C have since moved past.

### Recommendation

**GO for a separately owner-approved `1.2.0` release.** This is a *minor*, not a
patch: it adds public API rather than repairing an identical surface. Seven
conformant families join the package since `1.1.0` — `ListItem`/
`SegmentedListItem` (T40), `Divider` (T42), `Badge`/`BadgeAnchor` (T43),
`BottomSheet` (T45), `AppBar` (T46), `SearchBar`/`SearchAppBar` (T47), and
`Carousel` (T48) — lifting the matrix from the published `1.1.0` count of 34 to
41. The four composites close tranche C's first four catalog rows on the same
pinned upstream snapshot the T44 primitive refresh unified
(`a90df2fc27e026b9ad2ed569f203a260c1041fab`).

Every addition is backward compatible. The package export paths, runtime
dependency count (zero), and peer dependencies do not change; no existing
export, prop, or token name is removed or renamed, so a consumer on `1.1.0`
upgrades without edits. One rendered value changes: `Tabs` draws its divider
from `outlineVariant` rather than `surfaceVariant`, correcting a generated role
the pinned `TabRow.kt` never reads (ADR 0034). Both are low-emphasis outline
roles and the custom-property names are unchanged, so no theming surface moved.

### Automated verification

Run against the `1.2.0` working tree on 2026-07-26.

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 14 gates |
| Typecheck source and playground examples | aggregate gates | Pass |
| Unit, interaction, accessibility, SSR, hydration, CSS, theme, source ledger | `npm run test` (inside aggregate) | Pass: 225 files, 1,624 tests |
| Architecture | `npm run check:architecture` (inside aggregate) | Pass: 41 inventory entries; 41 conformant |
| Documentation | `npm run check:docs` (inside aggregate) | Pass: 41 conformant component pages; package `1.2.0` |
| CSS boundary | `npm run check:styles` (inside aggregate) | Pass: 44 stylesheets |
| Token contract | `npm run check:tokens` (inside aggregate) | Pass: 1,783 generated custom properties |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 41 components; `1.2.0` identity and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: 475,038-byte packed package within the T48-measured 527,800-byte ceiling; every artifact green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the 475,038-byte packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 41 conformant components, 40 demos, export map respected |
| Real-Chromium rendering audit | `npm run audit:rendering` (outside aggregate) | Pass: no clipped elevation shadows or undersized interactive targets outside the recorded exemptions, and no source-geometry defects across the Chip, List Item, Slider, Divider, Badge, Bottom Sheet, App Bar, Search, and Carousel probes |

### Remaining boundaries

- The rendering audit (`npm run audit:rendering`) needs a real Chromium and is
  not part of `npm run verify`. It was run for this audit against Chrome for
  Testing 1228 via `M3E_CHROMIUM_PATH`. Note that the script exits 0 with a
  skip notice when that variable is unset, so an exit code alone does not
  establish that the probes ran; the pass line naming the probed families does.
- Publication was performed outside this audit, after the gates above ran. The
  registry claim recorded at the top of this section rests on the shasum
  comparison, not on the publish command's own output.

## 1.1.0 — 2026-07-23

Audit date: 2026-07-23  
Release: `@language-lit/material3-expressive@1.1.0`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit; published
2026-07-23 from commit `b109c18` and confirmed as `latest`. The registry now
holds `1.0.0-next.0`, `1.0.0`, `1.0.2`, `1.0.3`, and `1.1.0`. The published
tarball's shasum is `307848e67389e7aa8fee1b2991488aaf9c79d467`, matching the
locally packed artifact the release audit verified.

### Recommendation

**GO for a separately owner-approved `1.1.0` release.** This is the first
*minor* since `1.0.0`, not a patch: it adds public API rather than repairing an
identical surface. Two new conformant components join the package — the
`Slider`/`RangeSlider` family and `Chip` — lifting the matrix from 32 to 34.
Every addition is backward compatible; no existing export, prop, token value,
dependency, or export-map path changed, so a consumer on `1.0.3` upgrades
without edits. Publication, the `v1.1.0` tag, and any dist-tag change remain a
separate owner-approved step outside this audit.

### What changed since 1.0.3

- **`Slider` and `RangeSlider` (T39, ADR 0031).** A native-range slider family
  ported from AndroidX Material 3 `Slider.kt` at the pinned revision
  `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. `Slider` carries the source's
  horizontal and vertical composables behind an `orientation` option
  (`topToBottom` replaces the legacy `reverseDirection`); `RangeSlider` owns two
  semantic thumbs. One native `<input type="range">` backs each semantic thumb
  for role, value, naming, focus, disabled state, forms, and refs, beneath an
  `aria-hidden` Material rendering tree; pointer gestures and keyboard deltas are
  resolved against the pinned tap/slop/RTL/vertical/nearest-thumb rules. New
  exports: `Slider`, `RangeSlider`, and their prop/state types. The 4px handle,
  16px track, and 2px pressed handle are the sourced dimensions; the root now
  carries `cursor: pointer` (and `cursor: default` when disabled) so the
  affordance matches the full 48px interactive target rather than only the
  handle.
- **`Chip` (feat).** A compact action and selection control covering the assist,
  filter, input, and suggestion purposes through a discriminated API that
  rejects invalid prop combinations at the type level, rendering as a native
  `<button>`. New exports: `Chip`, `ChipKind`, `ChipVariant`, `ChipShape`,
  `ChipProps`.
- No existing export, prop type, token value, dependency, or export-map path
  changed. The package still ships zero runtime dependencies and the closed
  export set `.`, `./theme`, `./tokens`, `./styles.css`.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 13 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 177 files, 1,058 tests (+`Slider` and `Chip` suites since `1.0.3`) |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 34 inventory entries |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 34 components; `1.1.0` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: packed package within the T39 ceiling (395,000 bytes); every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 34 conformant components, export map respected |

### Remaining boundaries

- The rendering audit (`npm run audit:rendering`) needs a real Chromium and is
  not part of `npm run verify`. The Slider family's physical 48px targets and
  sourced geometry were verified in a real browser via the playground driver
  (ADR 0031); the two new components add geometry rather than change existing
  components' geometry.
- No registry availability, dist-tag, or remote release claim is made by this
  local audit.

## 1.0.3 — 2026-07-22

Audit date: 2026-07-22  
Release: `@language-lit/material3-expressive@1.0.3`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit; published
2026-07-22 from commit `fda9cb7` and confirmed as `latest`. The registry now
holds `1.0.0-next.0`, `1.0.0`, `1.0.2`, and `1.0.3`. The published tarball was
re-downloaded and checked to carry the T36 repair, not merely the version bump.

### Recommendation

**GO for a separately owner-approved `1.0.3` release.** This is a patch, not a
cutover: the public surface is byte-for-byte identical to `1.0.0` — same 32
conformant components, same exports, same tokens, same dependency-free package.
`ThemeScopeContext` and `usePortalThemeScope`, added by T36, are internal and
exported from neither `.` nor `./theme`.

### What changed since 1.0.2

- Portaled overlays (`Menu`, `Select`'s listbox, `Tooltip`, `Snackbar`) now
  reconstitute the enclosing theme scope on their portal root. They previously
  inherited nothing from the provider element — a sibling, not an ancestor —
  and resolved against `:root`'s unconditional light scheme, so color mode,
  custom themes, and nested scopes all failed to reach them. `Tooltip` and
  `Snackbar` were additionally inverted the wrong way, since `inverseSurface`
  resolved against the light scheme reads as a dark chip on a dark page
  (ADR 0029; T36).
- No export, prop type, token value, or dependency changed.

### Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate verification | `npm run verify` | Pass: 13 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 165 files, 956 tests (+10 portal-scope tests since `1.0.2`, 6 confirmed to fail against the unrepaired components) |
| Architecture, browser, CSS, and token checks | aggregate gates | Pass: 32 inventory entries |
| Release artifact and rollback | `npm run check:release` (inside aggregate) | Pass: 32 components; `1.0.3` and `v0.3.0` rollback verified |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite and Next SSR/static against the packed tarball |
| Documentation site structure | `npm run check:site` (inside aggregate) | Pass: 32 conformant components, 31 demos, export map respected |

### Remaining boundaries

Unchanged from `1.0.0` — see below.

- The rendering audit (`npm run audit:rendering`) was not re-run for this
  release. It needs a real Chromium, and T36 changed no geometry, elevation, or
  state layer — only which scope a portal root resolves its custom properties
  against. A browser probe against the playground and the documentation site
  covered the color question it would have answered.

## 1.0.2 — 2026-07-22

Audit date: 2026-07-22  
Release: `@language-lit/material3-expressive@1.0.2`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed at the time of this audit; published
2026-07-22 from commit `7978299` and confirmed as `latest`. The registry now
holds `1.0.0-next.0`, `1.0.0`, and `1.0.2`.

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
