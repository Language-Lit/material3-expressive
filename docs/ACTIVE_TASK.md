# Active v1 task

## T28 — Public documentation site

Status: complete
Approved: 2026-07-21
Completed: 2026-07-21

### Scope

Publish a public showcase and documentation site for the released `1.0.0`
package at `m3e.language-lit.com`, built inside this repository as a new `site/`
tree and deployed to Vercel from that subdirectory.

The site is a consumer of the package, never a second implementation of it. It
imports only the four public entry points, so it exercises the same surface a
real application does and fails the same way a real application would.

- Add `site/`, a Next.js App Router application with `output: 'export'`, whose
  own `package.json` and lockfile are independent of the library's. The library
  gains no dependency, peer, or export from this task.
- Build every piece of site chrome — navigation, tabs, search field, menus,
  cards, surfaces, type — from the library's own public components. The site
  ships no third-party UI dependency, so its own layout is the primary proof
  that the component set is sufficient to build a real interface.
- Resolve the package through its published export map only. The site never
  deep-imports `src/`, never imports a private file, and never reaches around
  `package.json` `exports`. Any import the export map does not permit must fail
  the site build.
- Generate site content from the existing sources of truth rather than restating
  them: `docs/component-inventory.json` for which components exist and their
  conformance status, `docs/components/*.md` for contract prose, and
  `playground/examples/*.example.tsx` for live demonstrations and their
  displayed source. No component fact is authored twice.
- Render one route per `conformant` component containing its live demo, the
  demo's real source, its contract prose, and its public exports. Components not
  marked `conformant` get no route, so the site cannot advertise beyond the
  matrix that `SPEC.md` §4 governs.
- Provide an interactive theme panel driven by the public `createTheme` and
  `generateTokenCss` APIs, retheming the live site through the token custom
  properties, plus a light/dark/system control bound to `Material3Provider`.
- Publish the existing long-form documents — getting started, theming, SSR,
  migration, web deviations, release notes — as site routes sourced from the
  same Markdown files the repository already ships.
- Add a `check:site` gate to the aggregate verification command asserting
  content parity between the inventory and the site's routes and demos. The gate
  is structural and does not run a Next build, so `npm run verify` stays fast;
  the production site build runs as its own CI job and on every deploy.
- Record the decision to host a framework-coupled application in a
  framework-neutral library's repository as an ADR, including why the site is
  not a separate repository and how the `src/` framework-import boundary stays
  enforced.

### Expected files

- Added: `site/` — `package.json`, `package-lock.json`, `next.config.mjs`,
  `tsconfig.json`, the App Router tree under `site/app/`, site-owned styles, and
  the build-time loaders that read the inventory, component Markdown, and
  playground examples.
- Added: `scripts/check-site.mjs`, the inventory-to-site parity gate.
- Added: ADR 0028 recording the in-repository site decision and its boundary.
- Modified: `package.json` — `check:site` and site build/dev scripts.
- Modified: `scripts/verify.mjs` — register the new gate.
- Modified: `scripts/check-architecture.mjs` — assert that `site/` cannot be
  imported by `src/`, `tests/`, or `playground/`, and that the site's own
  imports of the library resolve through the public export map.
- Modified: `.gitignore` — the site's build and cache output.
- Modified: `.github/workflows/ci.yml` — the site build job.
- Modified: `docs/SPEC.md` — a T28 row in §14, and §12 amended to record that
  the documentation requirements are satisfied by a published site rather than
  by repository Markdown alone.
- Modified: `README.md` — link the published site.

### Acceptance checks

- The site builds as a static export and every route renders without a runtime
  error, with React strict mode on.
- The site imports `@language-lit/material3-expressive`, `/theme`, `/tokens`,
  and `/styles.css` and nothing else from the library. A deliberate deep import
  into `src/` or into an unexported subpath fails the build.
- Every component marked `conformant` in `docs/component-inventory.json` has
  exactly one site route carrying a live demo and its real source; every route
  maps back to a `conformant` inventory entry. `check:site` fails on either
  mismatch.
- The site's rendered component count and the count in
  `docs/SUPPORTED_COMPONENTS.md` agree, both derived from the inventory.
- No third-party UI, styling, or component dependency appears in
  `site/package.json`; the site's interface is built from the library.
- Server-rendered routes produce correct markup for the server-safe surface and
  hydrate without mismatch, including the system color-mode path that
  `docs/SSR.md` specifies.
- The theme panel changes the live site's tokens through the public API, and the
  color-mode control resolves light, dark, and system.
- The packed tarball is unchanged by this task: `npm pack` contains no `site/`
  path and the bundle budgets are unmoved.
- `npm run verify` passes every existing gate plus `check:site`, and the CI site
  build job passes.

### Decisions resolved at approval

1. **Versioned documentation is deferred.** The site documents the current
   release only. Routes are shaped so a version segment can be introduced later
   without restructuring, but no version picker, per-version content source, or
   version-aware navigation is built in this task.
2. **Search is built in-repository.** A build-time JSON index is generated from
   the same inventory and Markdown the routes use, and queried client-side with
   the library's own `TextField` and `Menu`. No search service and no
   third-party search dependency.
3. **Analytics is out of scope for this task.** The site ships no telemetry.
   Adding it is a separate decision and a separate task.

### Completion evidence

- `site/` builds as a static export of 44 routes: the landing page, the
  component index, 32 component routes, the guide index, 6 guide routes, and
  the not-found page. `npm run verify` passes all 13 gates, including the new
  `check:site`.
- Server rendering is real, not decorative. The exported
  `components/Button/index.html` contains `<button class="m3e-button" …>` with
  its resolved data attributes, the provider's theme root, and build-time
  highlighted source — so every demo is prerendered rather than drawn after
  hydration.
- The export-map boundary is enforced by Node itself, not by convention:
  `@language-lit/material3-expressive`, `/theme`, `/tokens`, and `/styles.css`
  resolve to `dist/`, while a deep import fails with
  `ERR_PACKAGE_PATH_NOT_EXPORTED`. `check-site.mjs` was negative-tested against
  an unexported subpath, a relative climb into `src/`, and a stale registry, and
  failed on each.
- The theme playground works end to end. Selecting a preset moves
  `--m3e-sys-color-primary` from `#6750a4` to `#006c4e`, repaints the chrome,
  components, ramps, and code blocks together, and survives navigation. All six
  presets pass `createTheme`'s validation, contrast included.
- Palette generation was checked against the shipped reference palette: all 80
  non-error entries are produced, `primary-40` regenerates `#6750a4` as
  `#67519f`, and the worst deviation across the whole set is ΔE 13.7 at
  `primary-10`, where CIELAB and HCT diverge most.
- No horizontal overflow at 1440px or 390px on the landing, index, component,
  and guide pages; no console or page errors on any route exercised. `next dev`
  reports no hydration mismatch, which is where the deferred preference read and
  the `systemModeFallback` snapshot would show up if they were wrong.

### Defects found and fixed after first review

Both were found by sweeping all 41 routes for icon-glyph fallback, content
escaping a clipping ancestor, and horizontal overflow, rather than by reading
the code.

- **Only the outlined symbol family was vendored.** `Icon`'s `symbolStyle`
  selects one of three families, and the Icon example demonstrates all three, so
  `rounded` and `sharp` rendered their ligature text as serif words. All three
  subsets are now fetched (142 kB total for 52 icons). `check-site.mjs` now
  fails when a `symbolStyle` in use has no vendored family, when the subset is
  missing an icon the site renders, or when it carries one the site no longer
  renders — a glyph with no font behind it is invisible to every build and test,
  so it needed a gate rather than vigilance.
- **The `Tabs` demo was truncated mid-label.** `Surface` clips to its shape, and
  the example root, as a grid item, was shrinking below the min-content width of
  a fixed (`scrollable={false}`) tab row, so the surface cut the row off instead
  of letting it overflow. Flooring the example root at `min-content` and making
  the demo frame a scroll container lets it scroll instead. This is a framing
  fault, not a component fault: the examples are authored against the
  playground's wider workbench.
- `WavyProgress` and `CircularProgress` were flagged by the same sweep and
  cleared as false positives: both intentionally draw an oversized path inside
  an `overflow: hidden` clip container to express progress.

### Deviations from the approved plan

- **The playground examples were never typechecked, and three were invalid.**
  `tsconfig.json` includes only `src/**` and typed tests, and Vite strips types
  without checking them, so `Text as="output"` in the `Card`, `Checkbox`, and
  `Radio` examples had gone unnoticed — `TextProps['as']` does not accept
  `output`. The site build typechecks them and caught all three. They now render
  `as="span" role="status"`, which preserves the live-region behavior. Whether
  `output` belongs in the `as` union is a public API question and is left for
  the owner; it is recorded below as a follow-up rather than changed here.
- **`scripts/link-self.mjs` was added** and is not in the expected files.
  Turbopack does not implement Node's package self-reference rule, so the
  playground examples — which live above `site/` — could not resolve the package
  by name. The link points at the package root so the export map still applies;
  aliasing to `dist/` would have fixed the build while removing the guarantee
  the whole task rests on.
- **`scripts/fetch-symbols-font.mjs` and a vendored font subset were added.**
  The library ships no icon font by design, and Material Symbols is absent from
  Next's font manifest, so icons rendered as their ligature text. The script
  fetches a subset containing exactly the 52 icons the site renders (45 kB) and
  commits it, so builds need no network. CI asserts it is not stale.
- **`marked` is a site dependency.** It renders repository Markdown during the
  build and ships nothing to the browser, so it is not a UI, styling, or
  component dependency. `check-site.mjs` pins the allowed set, so a fourth
  dependency fails the gate. Syntax highlighting is hand-written against the
  Material color roles rather than delegated to a highlighter, so code blocks
  re-theme with the page.
- **The `site/` import-direction assertion lives in `check-site.mjs`,** not
  `check-architecture.mjs` as the plan said, keeping every site boundary rule in
  one gate. `check-architecture.mjs` gained `site` as a required directory.
- **A mobile navigation drawer was added.** The sidebar is hidden below 60rem,
  which would have left component pages reachable only through search.
- **A link-button adapter was added.** `Button` renders a native `<button>` and
  documents that a link needs "a separately designed link-button adapter"; the
  site's calls to action are anchors styled from the public
  `--m3e-comp-button-*` tokens rather than anchors nested inside buttons.

### Follow-ups for the owner

1. **`Text` cannot render `<output>`.** Three examples wanted it and the type
   rejects it. `as` already admits `label`, `legend`, and `figcaption`, so the
   omission looks incidental rather than principled. Adding it is a public API
   change and needs its own task and ADR.
2. **The playground is outside `tsconfig.json`.** Only the site build typechecks
   it today, and only in the site CI job. Adding `playground/**` to the root
   `include` would move that coverage into `npm run typecheck`, where it
   belongs.
3. **There is no `List` component.** The sidebar and search results are
   hand-rolled because the library offers no list primitive. That is a
   legitimate scope decision, but the site is evidence about where the surface
   ends.
