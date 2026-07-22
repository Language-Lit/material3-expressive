# Release notes

## 1.0.2 — 2026-07-22

Status: prepared patch release. No export, prop, token, or dependency change;
the public surface is identical to `1.0.0`.

`1.0.1` was prepared and tagged but never reached the registry, so `1.0.2`
carries **both** patches. A consumer upgrading from `1.0.0` receives the
`FabMenu` repair below as well as the `NavigationDrawer` one.

### Fixed

- `NavigationDrawer`: the `'modal'` variant could not be closed by pointer. It
  wired `showModal()`/`close()` and a native `close` listener but no
  outside-click handling, and it renders no close affordance of its own, so
  Escape was its only dismissal path — with nothing on screen saying so. A
  click on the scrim now closes it, matching both the component's own
  documented contract ("Escape/outside-click dismissal") and the pinned
  source's clickable scrim. Dismissal is unconditional; a consumer that needs
  to suppress it can `preventDefault()` in `onClick`, which runs first.
- `FabMenu` (carried from the unpublished `1.0.1`): an item's elevation shadow
  was clipped to a rectangle by `.m3e-fab-menu__item-slot { overflow: hidden }`,
  so only its corners survived and a rounded item read as a square halo. The
  slot no longer clips; the staged reveal animation is unchanged at default
  motion, under `prefers-reduced-motion: reduce`, and under
  `forced-colors: active`.

### Added

Carried from the unpublished `1.0.1`: `scripts/audit-rendering.mjs`
(`npm run audit:rendering`) and the in-repository documentation site at
`m3e.language-lit.com` (ADR 0028). Neither is part of the published package.

### Verification target

Same as `1.0.0`: `npm run check:docs` and `npm run verify`. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) for the `1.0.2` audit.

## 1.0.1 — 2026-07-21

Status: prepared but never published. The `v1.0.1` tag exists on `main`, but the
version was never pushed to the registry — the registry went `1.0.0` straight to
`1.0.2`, which carries this patch's contents. No export, prop, token, or
dependency change; the public surface is identical to `1.0.0`.

### Fixed

- `FabMenu`: an item's elevation shadow was clipped to a rectangle by
  `.m3e-fab-menu__item-slot { overflow: hidden }`, so only its corners survived
  and a rounded item read as a square halo. The slot no longer clips; the
  staged reveal animation is unchanged at default motion, under
  `prefers-reduced-motion: reduce`, and under `forced-colors: active`.

### Added

- `scripts/audit-rendering.mjs` (`npm run audit:rendering`): a browser-based
  audit, run against the built playground, that checks for elevation shadows
  clipped by an ancestor and interactive targets under the WCAG 2.2 SC 2.5.8
  floor — defects that compile, pass jsdom-based unit tests, and are still
  wrong on screen. Not part of `npm run verify`, since it needs a real browser;
  documented in `AGENTS.md`.
- The in-repository documentation site at `m3e.language-lit.com`, built from
  the library's own components and consuming only its public exports (ADR
  0028).

### Verification target

Same as `1.0.0`: `npm run check:docs` and `npm run verify`. See
[RELEASE_READINESS.md](RELEASE_READINESS.md) for the `1.0.1` audit.

## 1.0.0 — 2026-07-21

Status: prepared stable release. The cutover replaces the 0.3 surface; it does
not publish to the registry or create a remote release.

### Added

- `.`, `/theme`, `/tokens`, and `/styles.css` as the complete public surface.
- A validated serializable theme/token system with light, dark, system, custom,
  and nested provider scopes.
- Thirty-two conformant public components listed in the generated
  [supported-component matrix](SUPPORTED_COMPONENTS.md).
- Native form, keyboard, focus, RTL, reduced-motion, forced-colors, SSR, and
  hydration behavior covered by component conformance gates.
- Framework-neutral Vite and Next.js packed-package fixtures.
- Public installation, theming, SSR, migration, and web-deviation guides.

### Removed

The 0.3 implementation was deleted rather than deprecated in place, because its
only known consumer completed migration first. `0.3.x` remains published for
applications that are not ready.

- The 0.3 components, hooks, utilities, provider, showcase, and token CSS.
- The `components/*`, `hooks`, `utils`, `context/*`, `showcase`, `styles`, and
  `tailwind-preset` subpath exports.
- The Tailwind preset and the optional `tailwindcss` peer dependency.
- All fourteen runtime dependencies. React and React DOM are the only peers.

### Breaking changes

`1.0.0` reuses the package root for a new API, so upgrading from `0.3.x` is a
deliberate migration rather than a version bump:

- component import paths and many prop contracts;
- stylesheet and CSS custom-property namespaces;
- provider responsibilities and theme representation;
- icon source handling;
- composite component state and semantic models;
- the supported-component scope.

See [MIGRATION.md](MIGRATION.md) for public concept mappings.

### Limitations

- The complete `/styles.css` file is the supported stylesheet; component CSS
  subpaths and token-only CSS are not public package exports.
- The support claim is limited to the generated conformant matrix. Chips,
  sliders, search, sheets, list items, app bars, carousel, and other possible
  1.x components are not included.
- Material 3 Expressive sources are evolving; each conformance record pins the
  source revision used by this release.
- Publication, registry dist-tags, and remote release creation require separate
  explicit approval.

### Verification target

The release must pass `npm run check:docs` and `npm run verify`, including
packed Vite/Next builds, the release contract, and bundle budgets. The
release-readiness record is [RELEASE_READINESS.md](RELEASE_READINESS.md).
