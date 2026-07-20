# v1 release notes

## 1.0.0-next.0 — 2026-07-20

Status: prepared prerelease candidate. T25 does not publish, tag, or redirect the
stable package root.

### Added

- Additive `/v1`, `/v1/theme`, `/v1/tokens`, and `/v1/styles.css` package entry
  points.
- A validated serializable theme/token system with light, dark, system, custom,
  and nested provider scopes.
- Thirty-two conformant public components listed in the generated
  [supported-component matrix](SUPPORTED_COMPONENTS.md).
- Native form, keyboard, focus, RTL, reduced-motion, forced-colors, SSR, and
  hydration behavior covered by component conformance gates.
- Framework-neutral Vite and Next.js packed-package fixtures.
- Public installation, theming, SSR, migration, and web-deviation guides.

### Breaking changes when adopting `/v1`

The existing package root is unchanged in this candidate, so legacy consumers
receive no automatic breaking change. Opting into `/v1` deliberately changes:

- component import paths and many prop contracts;
- stylesheet and CSS custom-property namespaces;
- provider responsibilities and theme representation;
- icon source handling;
- composite component state and semantic models;
- the supported-component scope.

See [MIGRATION.md](MIGRATION.md) for public concept mappings.

### Prerelease limitations

- Stable root exports and existing subpaths remain legacy.
- The complete `/v1/styles.css` file is the supported stylesheet; component CSS
  subpaths and token-only CSS are not public package exports.
- The support claim is limited to the generated conformant matrix. Chips,
  sliders, search, sheets, list items, app bars, carousel, and other possible
  v1.x components are not included.
- Material 3 Expressive sources are evolving; each conformance record pins the
  source revision used by this candidate.
- Publication, registry dist-tags, remote release creation, and stable cutover
  require later explicit approval.

### Verification target

The prepared candidate must pass `npm run check:v1:docs` and
`npm run verify:v1`, including packed Vite/Next builds, legacy-contract checks,
and bundle budgets. T26 performs the separate release-readiness audit before any
publication decision.
