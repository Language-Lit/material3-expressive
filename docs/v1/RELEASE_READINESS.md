# v1 release-readiness audit

Audit date: 2026-07-20  
Candidate: `@language-lit/material3-expressive@1.0.0-next.0`  
Rollback: `@language-lit/material3-expressive@0.3.0` (tag `v0.3.0`)  
Registry publication: not performed  
Stable root cutover: not performed

## Recommendation

**GO for a separately owner-approved `next` prerelease. NO-GO for stable-root
cutover.** The candidate passed the complete public-repository gate set and the
focused real-browser smoke below. Publication, remote release creation,
registry tag changes, and stable-root cutover require separate owner approval
and are outside this audit.

## Package and compatibility evidence

`npm run check:v1:release` creates an ignored-script tarball in a temporary
directory, inspects its manifest and file list, and removes it. The gate checks:

- the exact candidate version and four additive v1 export paths;
- equality of every frozen legacy export and package field against the recorded
  `0.3.0` contract;
- existence of every exported file in the tarball and exclusion of source,
  tests, playground, scripts, and repository documentation;
- all 32 inventory entries against public barrels, component pages,
  conformance records, SSR tests, behavior tests, and examples;
- optional Tailwind peer metadata; and
- the local versioned history boundary represented by tag `v0.3.0`, whose package
  manifest identifies the documented rollback version.

The rollback operation for a prerelease consumer is to restore the exact
`@language-lit/material3-expressive@0.3.0` dependency and legacy imports/styles.
Application-specific rollout procedures are deliberately outside this public
repository.

## Automated verification

| Gate | Command | Result |
| --- | --- | --- |
| Aggregate v1 verification | `npm run verify:v1` | Pass: 13 gates |
| Unit, interaction, accessibility, SSR, hydration, CSS, and theme tests | `npm run test` (inside aggregate) | Pass: 174 files, 1,003 tests |
| Production v1 playground | `npm run playground:v1:build` (inside aggregate) | Pass: built from `dist/v1` |
| Browser/CSS/token/legacy checks | aggregate gates | Pass: 35 stylesheets, 1,493 properties, 3 legacy baselines |
| Bundle budgets | `npm run check:bundle-size` (inside aggregate) | Pass: package 433,861 / 470,100 bytes; every budget green |
| Packed consumers | `npm run check:consumer-fixtures` (inside aggregate) | Pass: Vite v1, Next SSR/static, and frozen legacy Vite |
| Release artifact and rollback | `npm run check:v1:release` | Pass: 32 components; candidate and `v0.3.0` rollback verified |

## Real-browser smoke

Safari 26.5.2 loaded the production-built playground from the same `dist/v1`
artifacts consumed by the release fixture. A single semantic pass, without a
screenshot loop, verified:

- the complete page exposed headings, native form roles, overlay triggers,
  navigation, and progress-indicator semantics;
- a native Switch changed its accessibility value;
- a TextField accepted keyboard input and exposed the updated value;
- a modal Dialog exposed only its title, body, and actions while open, focused
  its first action, closed with Escape, and returned focus to its trigger;
- the desktop NavigationSuite exposed the permanent-drawer tier; deterministic
  tests separately cover widths 320, 700, and 900 and a live tier switch;
- reduced-motion rules are exercised across 25 v1 test files; and
- the fixture's `error` and `unhandledrejection` monitor remained at
  `Runtime errors: 0` after interaction.

Brave also loaded the production page, but its existing process did not expose
web content to macOS accessibility. It was not relaunched or counted as
semantic evidence.

## Remaining boundaries

- The support claim is limited to the generated component matrix.
- The existing root and legacy subpaths remain frozen compatibility exports.
- The focused real-browser smoke is representative, not an exhaustive run on
  every browser/OS pair in the support matrix. Compilation targets, CSS checks,
  semantic tests, and packed consumer builds remain the automated coverage for
  the rest of the matrix; broader visual regression automation is still a
  worthwhile post-prerelease improvement.
- No registry availability, dist-tag, or remote release claim is made by this
  local audit.
- No private-consumer inventory, route, model, dependency, or rollout detail is
  part of this record.
