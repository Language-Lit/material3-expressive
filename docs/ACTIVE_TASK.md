# Active v1 task

## T31 — Expressive redesign of the documentation site's marketing surfaces

Status: complete
Approved: 2026-07-22
Completed: 2026-07-22

### Scope

The site renders the library correctly but does not look like the design system
it documents. Three defects are measurable rather than matters of taste:

1. `next/font/google` fetches Roboto Flex with only the `wght` axis. A browser
   probe measured `"wdth" 25`, `"wdth" 100`, and `"wdth" 151` rendering at an
   identical 652.81px, so the `wdth`, `GRAD`, and `opsz` values the typescale
   tokens emit are inert. The library ships expressive type machinery and the
   site discards it.
2. Every homepage section is painted `surface` or `surface-container-low`,
   which differ by roughly two percent lightness. Four sections read as one
   flat slab, and no expressive color role (`primary-container`,
   `tertiary-container`, inverse) appears anywhere.
3. The site has no imagery. Its one graphic device, the tonal ramp, is a
   40px-tall swatch table that reads as data rather than as an image, and the
   components index is 32 identically shaped grey cards.

This task addresses the home page and the components index, plus the shared
chrome both draw from. Guide pages keep their current prose treatment: they
are readable, and styling them harder would trade that away for decoration.

- Load Roboto Flex with its `wdth` axis so the typescale's existing axis tokens
  resolve against a font that has it. `opsz` and `GRAD` stay unrequested: the
  latin subset measures 34kB at weight only, 60kB with `wdth`, 196kB once
  `opsz` joins it, and 241kB with `GRAD` too — and `GRAD` cannot render
  anything, because every role in the scale sets it to 0. Only the 25kB that
  buys the width axis is worth spending on a site that advertises a 50kB
  bundle.
- Give site chrome a display voice by overriding the public
  `--m3e-sys-typescale-*` custom properties on site classes only. Nothing under
  a demo or showcase stage is retuned: a demo must keep rendering the library's
  documented defaults.
- Add `site/theme/shapes.ts`, a dependency-free generator producing SVG path
  data for the Material 3 Expressive shape vocabulary, and `site/ui/ShapeField.tsx`,
  which composes those shapes filled from the live tonal palette. This becomes
  the site's imagery: it is generated from the current source color, so it
  recomposes with the theme and ships no static asset.
- Rebalance the home page onto expressive color fields and a varied shape
  scale, and rebuild the components index so each card carries color and shape
  rather than repeating one grey rectangle.
- Keep the precise tonal-ramp readout, relocated to the theming section where
  palette generation is the subject.

The shape compositions are site brand, not a component claim. They stay out of
the component catalogue and out of the inventory, so the site continues to
advertise exactly the conformant surface.

### Expected files

- Modified: `site/app/layout.tsx`, `site/app/page.tsx`, `site/app/globals.css`,
  `site/app/components/page.tsx`, `site/ui/SiteBar.tsx`.
- Added: `site/theme/shapes.ts`, `site/ui/ShapeField.tsx`.
- No file under `src/`, `tests/`, or `playground/` changes. This task alters no
  published surface.

`site/ui/Ramp.tsx` and `site/ui/ThemeShowcase.tsx` were expected to change and
did not. Relocating the tonal readout turned out to be a composition change on
the page that hosts it, not a change to either component, so both were left
alone.

`site/ui/SiteBar.tsx` was not expected and did change; see the app-bar note
under completion evidence.

### Acceptance checks

- A browser probe reports the `wdth` axis moving: `"wdth" 25` and `"wdth" 151`
  must render at measurably different widths.
- Rendered demos are unaffected — computed `font-variation-settings` inside a
  `.demo__stage` and `.showcase__stage` still read `"wdth" 100`, and the type
  overrides do not leak past site chrome.
- `npm run check:site` passes, including the icon-subset equality gate.
- `npm run site:build` completes and the static export renders.
- Light and dark mode both hold, and every non-default source color in
  `presetSources` produces a legible page.
- No public export, prop type, or token value changes.

### Completion evidence

- The width axis is live. The same browser probe that measured `wdth` 25 / 100
  / 151 at an identical 652.81px before now measures 580 / 652.81 / 751.72 on
  the production build, and the generated `@font-face` carries
  `font-stretch: 25% 151%`, so the chrome's 118–134 working range is not
  clamped.
- The retune does not leak. Computed `font-variation-settings` reads `wdth`
  132 on `.hero__title`, 128 on `.section__title`, and 130 on
  `.page-head__title`, while a `Text` inside `.showcase__stage` and one inside
  `.demo__stage` both still read `wdth` 100 / `wght` 500 — the library's
  documented defaults. A demo renders what the package ships.
- Font cost was measured rather than assumed, and the axis list narrowed to
  `wdth` alone as a result: 34kB weight-only, 60kB with `wdth`, 196kB with
  `opsz`, 241kB with `GRAD`. The shipped latin subset is 59,696 bytes. `GRAD`
  was dropped because every role sets it to 0 and it therefore cannot render
  anything at any size.
- `site/theme/shapes.ts` generates nineteen shapes from three primitives — a
  rounded polygon, an arc-lobed disc, and a per-corner rounded rectangle. Both
  the lobe radius and the polygon fit are solved rather than eyeballed, so a
  shape fills its box at any lobe depth. Verified against a rendered contact
  sheet; a first pass using quadratic lobes drew clovers as thin spikes and was
  replaced with circular arcs and the large-arc flag.
- Artwork tones are per color mode. Fixed tones left the `primary-20` anchor
  invisible on a dark surface, so each placement now carries a light and a dark
  stop, both drawn from the standard tone ladder.
- Checked at 1440px and at 390px, in light and dark, and against the Viridian
  and Crimson source colors. The composition and every claim card recolor with
  the theme.
- The two places this design dims text over a validated role pair — the claim
  card bodies and the inverted band's lede — were measured rather than assumed.
  Compositing each color over its real backdrop gives 5.22, 5.14, 9.06, 8.39,
  and 8.88 in light and 5.82, 5.81, 6.95, 6.21, and 10.91 in dark. The lowest
  is 5.14 against a 4.5 floor for text at this size, so the dimming does not
  spend the contrast the library guarantees.
- The app bar was fixed beyond the planned scope. `SiteBar.tsx` set
  `display: contents` as an inline style on the group holding the Components
  and Guides links, which outranked the media query meant to hide it below
  60rem; those links overlapped the wordmark and pushed `documentScrollWidth`
  to 423px inside a 390px viewport. The declaration moved to the stylesheet and
  the wordmark now truncates rather than running under the controls; scroll
  width equals the viewport at 320, 390, and 480px. The defect predates this
  task — `git show HEAD:site/ui/SiteBar.tsx` carries the inline style — but it
  sits in chrome this task restyles, so it was repaired here.
- `npm run verify` passes in full: 13 gates, including `check:site` at 32
  conformant components and 31 demos with the export map respected.
  `npm run site:build` generates all 44 routes.


---

## T32 — Machine-readable discovery for the documentation site

Status: complete
Approved: 2026-07-22 (owner request: assistant crawlers could not reach the site)

### Scope

The reported symptom was that an assistant crawler could not read the site.
The site itself answers: every crawler user agent tested — `GPTBot`,
`OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Googlebot` — receives 200 and
the full prerendered HTML, because the export is static and carries its prose
in the markup. There is no user-agent block and no JavaScript gate to remove.

What the site had none of was the layer a crawler reads *first*. Four defects,
each measurable:

1. `/robots.txt` and `/sitemap.xml` both 404. The export has no `robots.ts` or
   `sitemap.ts`, so both requests fall through to the 404 page — which answers
   with `Content-Type: text/html` and a body carrying
   `<meta name="robots" content="noindex">`. A fetcher's first request returns
   an error document where a policy should be, and nothing points at the other
   forty routes.
2. No `llms.txt`. The site's navigation is a client component, so the route
   list is reachable only after several kilobytes of drawer and theme-panel
   markup.
3. Twenty-one navigation headings preceded the `<h1>` on every docs route —
   nine `h2` from `Sidebar`, nine `h3` from `MobileNav`, three `h3` from the
   theme panel. A reader building an outline from headings met
   "Guides, Overview, Foundations…" twice before it met the page's subject.
4. No canonical URLs, no structured data, and no Open Graph image.

This task adds the discovery layer and repairs the outline. No page's prose,
layout, or color changes, and the published package is untouched.

### Expected files

- Added: `site/content/site.ts`, `site/app/robots.ts`, `site/app/sitemap.ts`,
  `site/app/llms.txt/route.ts`, `site/app/llms-full.txt/route.ts`,
  `site/app/opengraph-image.tsx`, `site/ui/StructuredData.tsx`.
- Modified: `site/app/layout.tsx`, `site/app/page.tsx`,
  `site/app/components/page.tsx`, `site/app/components/[component]/page.tsx`,
  `site/app/docs/page.tsx`, `site/app/docs/[slug]/page.tsx`,
  `site/ui/Sidebar.tsx`, `site/ui/MobileNav.tsx`, `site/ui/ThemeControls.tsx`,
  `vercel.json`.
- No file under `src/`, `tests/`, or `playground/` changes.

The route enumeration lives in `site/content/site.ts` and reads the inventory
and the guide list, so the sitemap and `llms.txt` cannot drift from the routes
the export actually produces.

### Acceptance checks

- `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/llms-full.txt` each return 200
  with a correct content type.
- The sitemap lists every route the export emits except the two error pages.
- Every page's first heading is its own `<h1>`.
- Every route emits a canonical URL matching its trailing-slash path.
- All JSON-LD parses and is typed.
- `npm run verify` passes.

### Completion evidence

- All four discovery files serve from the built export: `robots.txt` 447B
  `text/plain`, `sitemap.xml` 5520B `application/xml`, `llms.txt` 7607B and
  `llms-full.txt` 127574B both `text/plain`.
- The sitemap carries 41 `<loc>` entries. The export emits 43 `index.html`
  files; the two absent from the sitemap are `/_not-found/` and `/404/`.
- Heading outlines start at `h1` on every route checked — `/`, `/components/`,
  `/components/Button/`, `/docs/theming/`. The nav group labels became `p`
  elements with the name carried on the list via `aria-label`, and the three
  theme-panel rows became `role="group"` with `aria-label`, so both keep their
  accessible names without entering the outline.
- Eleven JSON-LD blocks across the four page types parse, typed `WebSite`,
  `SoftwareSourceCode`, `TechArticle`, `ItemList`, and `BreadcrumbList`.
- The Open Graph card renders at 1200x630 and reads its figures from the
  inventory, so "32 components · 0 dependencies" is generated rather than
  typed. Next emits it without a file extension, which static hosting serves
  with an empty content type; `vercel.json` sets `image/png` for that path.
- `npm run verify` passes in full: 13 gates, `check:site` at 32 conformant
  components and 31 demos with the export map respected.

### Not done

- The reported symptom could not be reproduced from this vantage: every crawler
  user agent already received 200. The robots.txt 404 is the most plausible
  cause and is now fixed, but if an assistant still reports a failure the next
  thing to check is Vercel's firewall and bot-protection settings, which are
  project configuration rather than repository state.


---

## T33 — Modal NavigationDrawer scrim dismissal

Status: complete
Approved: 2026-07-22 (owner report: the modal drawer on
`/components/NavigationDrawer/` cannot be closed once opened)
Completed: 2026-07-22

### Scope

The modal `NavigationDrawer` had exactly one dismissal path — Escape — and
nothing on screen said so. `NavigationDrawer.tsx` wired `showModal()`/`close()`
and a native `close` listener, but no outside-click handling, so a click on the
scrim did nothing, and the component renders no close affordance of its own.
A pointer user who opened it was stuck.

This is a defect against two records that already specified the behavior, not a
new feature:

1. `docs/components/NavigationDrawer.md` documents the modal variant's contract
   as "`showModal()`/`close()`, Escape/outside-click dismissal". The
   outside-click half never existed.
2. The pinned source's scrim is itself clickable whenever the drawer is open —
   `Scrim(onClick = if (drawerState.isOpen) onDismissRequest else null)` in
   `ModalNavigationDrawer` — so the omission is also a conformance gap.

The repair ports `Dialog`'s existing manual light-dismiss hit test: native
`<dialog>` has no automatic outside-click close at this library's browser floor,
so a click landing on the dialog element itself (never a descendant) with
coordinates outside its own rendered box is a scrim click and calls `close()`.

Dismissal is unconditional. `Dialog` gates the equivalent behind
`dismissOnOutsideClick`/`dismissOnEscape` because a dialog may pose a forced
choice; a navigation drawer never does, and adding a prop would make a
`NavigationDrawerProps` surface change out of a repair — a minor release and an
ADR for an escape hatch nothing needs. A consumer that must suppress the
dismissal already can: `onClick` runs before the library handler and
`preventDefault()` cancels it, the documented `composeEventHandlers` contract.

Auto-closing on item selection is deliberately not added — the source leaves
that to the caller's own `onClick`, which is free to set `open` to `false`.

### Expected files

- Modified: `src/components/NavigationDrawer/NavigationDrawer.tsx`,
  `tests/components/NavigationDrawer/NavigationDrawer.test.tsx`,
  `tests/components/NavigationDrawer/NavigationDrawer.conformance.md`,
  `docs/adr/0020-web-native-navigation-semantics-and-composed-adaptive-suite.md`,
  `docs/SPEC.md`.
- No CSS, token, example, or site file changes: the scrim already paints, and
  the site renders the library, so the site is repaired by the library fix.
- No export, prop type, or token value changes — `docs/component-inventory.json`
  is unchanged because the public surface is unchanged.

### Acceptance checks

- A click on the scrim closes the modal drawer and reports `onOpenChange(false)`.
- A click inside the sheet — on the dialog's own box and on a descendant item —
  does not close it.
- A consumer `onClick` calling `preventDefault()` suppresses the dismissal.
- The scrim test fails against the unrepaired component, proving it is not
  vacuous.
- `npm run verify` passes.

### Completion evidence

- The scrim test was run against the unrepaired component before the fix
  landed and failed with `expected "vi.fn()" to be called with arguments:
  [ false ] / Number of calls: 0`, then passed after. The two negative tests
  hold in both states by design — they are regression guards, not the proof.
- 35 `NavigationDrawer` tests pass across its five files (32 before, 3 added).
- `npm run verify` passes in full: 13 gates, `check:site` at 32 conformant
  components and 31 demos with the export map respected. The packed tarball is
  306,970 bytes, within budget.
- The built `dist/index.js` carries the hit test, so the site — which consumes
  the package through its `file:..` link — is repaired by the library fix with
  no site-side change.
- The defect predates `1.0.0`: the outside-click claim in
  `docs/components/NavigationDrawer.md` and in ADR 0020 has never matched the
  shipped component. Every published version to date has a modal drawer that
  only Escape can close.

### Not done

- No release. This ships to consumers only once a patch is cut, the same
  separation T29 and T30 used; the version is still `1.0.1`. **Superseded by
  T34**, which cuts that patch.
- The rendering audit was not re-run. It needs a real Chromium and this change
  alters no geometry, elevation, or state layer — only an event handler.


---

## T34 — 1.0.2 patch release

Status: complete
Approved: 2026-07-22 (owner request: publish the fix to npm)
Completed: 2026-07-22 (status flipped under T36; the evidence below already
recorded the publication)

### Scope

Prepare the T33 `NavigationDrawer` repair for the registry.

The audit that motivated the version number: `npm view
@language-lit/material3-expressive versions` reports `1.0.0-next.0` and `1.0.0`
only. `1.0.1` was prepared under T30, recorded "Registry publication: not
performed", and no publish ever followed — but its `v1.0.1` tag *was* pushed to
`origin` at `13d9449`. So the registry is a full patch behind what the
repository believes it shipped, and the T29 `FabMenu` repair has never reached a
consumer either.

Republishing the current tree as `1.0.1` would place content in the registry
that the already-pushed tag does not describe. The release moves to `1.0.2`
instead; `1.0.1` stays a version that never existed on npm, and `1.0.2` carries
both patches. A consumer upgrading from `1.0.0` gets the `FabMenu` elevation
repair as well as the drawer one.

No export, prop, token, or dependency changes.

### Expected files

- Modified: `package.json`, `scripts/check-release.mjs` (its `releaseVersion`
  constant gates the version and must move in step), `docs/RELEASE_NOTES.md`,
  `docs/RELEASE_READINESS.md`, `docs/ACTIVE_TASK.md`, `docs/SPEC.md`.
- No file under `src/`, `tests/`, `playground/`, or `site/` changes. This task
  alters no behavior.

### Acceptance checks

- `npm run verify` passes at `1.0.2`, including `check:release`.
- The readiness report carries the three strings the release gate matches for
  `1.0.2`.
- The release notes state plainly that `1.0.1` was never published and that
  `1.0.2` carries both patches, so the gap in the registry's version sequence
  is explained rather than silent.
- Publication and the `v1.0.2` tag are performed by the owner, not from here.

### Completion evidence

- `npm run verify` passes in full at `1.0.2`: 13 gates, 165 test files, 946
  tests, `check:release` green against the new constant, packed tarball 306,961
  of 342,900 budgeted bytes, `check:site` at 32 conformant components.
- Re-verified after `7978299`, which changed the `repository.url` field —
  a `package.json` edit lands in the published tarball, so the audit figures
  above are measured against that commit, not the release-prep commit.

- Published 2026-07-22 from commit `7978299`. `npm view` confirms the registry
  holds `1.0.0-next.0`, `1.0.0`, and `1.0.2`, with `latest` at `1.0.2`. Tagged
  `v1.0.2`. The `FabMenu` repair reached consumers here too, a full patch late.
- The account's 2FA mode is `auth-and-writes`, so the publish went through a
  granular access token with npm's bypass-2FA flag, authorized under the
  package's "Require two-factor authentication or a granular access token with
  bypass 2fa enabled" publishing-access setting.

### Not done

- The rendering audit was not re-run for the release, for the same reason T33
  did not run it: no geometry, elevation, or state layer changed.
- **Follow-up, security:** the publishing token was transmitted in
  conversation, so it must be treated as disclosed and revoked. See the note
  below.


---

## T35 — Repair the documentation site's Vercel deployment

Status: complete
Approved: 2026-07-22 (owner report: production build failing)
Completed: 2026-07-22

### Scope

Every production deployment since `13a5860` has failed schema validation:

```
The `vercel.json` schema validation failed with the following message:
`headers[0]` should NOT have additional property `comment`
```

`13a5860` annotated both `headers` entries with a `comment` field explaining
why each exists. JSON has no comment syntax, and Vercel's schema is closed:
`headers.items` declares `additionalProperties: false` and allows exactly
`source`, `headers`, `has`, and `missing` — checked against the live schema at
`https://openapi.vercel.sh/vercel.json` rather than inferred from the error.

So the site has been undeployable for six commits, spanning the whole T33/T34
release. The published package was never affected — `vercel.json` is not in the
`files` allowlist, and `npm run verify` does not read it, which is why 13 green
gates and a successful publish sat alongside a broken deploy.

The two annotations were the only violation. Rather than lose what they
recorded, their content moves here:

- **`/opengraph-image` → `Content-Type: image/png`.** Next emits the generated
  card as an extensionless file, so static hosting has nothing to infer a type
  from and serves it with none at all. A card served without `image/png` is a
  card the scrapers decline to render. (Already noted in T32's evidence; this
  is the same finding.)
- **`robots.txt`/`llms.txt`/`llms-full.txt`/`sitemap.xml` → one-hour
  `max-age`.** Retrieval agents re-read these on their own schedule; a day of
  staleness is cheaper than making every crawl revalidate four files.

### Expected files

- Modified: `vercel.json`, `docs/ACTIVE_TASK.md`.
- No `src/`, `tests/`, `playground/`, or `site/` change, and no published
  surface change. No `docs/SPEC.md` ledger row, matching T31 and T32: the
  ledger records library scope, and this is deployment configuration.

### Acceptance checks

- `vercel.json` validates against the live Vercel schema — every key present is
  in the allowed set, and both entries carry the required `source`/`headers`.
- The rationale the removed comments carried survives in this record.
- The production deployment succeeds.

### Not done

- Nothing prevents this recurring. Vercel validates `vercel.json` server-side
  at deploy time, so a malformed file passes every local gate and fails only
  after a push. A `check:site` assertion against the published schema would
  catch it locally; that is a real gap, deliberately left for a separate task
  rather than widened into this repair.


---

## T36 — Portaled overlays lose the theme scope

Status: complete
Approved: 2026-07-22 (owner report: menus render light in dark mode)
Completed: 2026-07-22

### Scope

`Menu`, `Select`'s popup listbox, `Tooltip`, and `Snackbar` portal into
`document.body`, which is a sibling of the provider's `.m3e-theme` element
rather than a descendant. Every ingredient of a theme scope reaches a component
by inheritance — the class the generated stylesheet keys its base and alias
declarations on, the `data-m3e-color-mode` attribute its light/dark rules select
through, and the provider's inline differences from the default theme — so a
portaled overlay inherits none of them and resolves against `:root`, which
carries the light scheme unconditionally as the no-JavaScript visual contract.

Measured in the playground with the provider scope resolved dark:
`--m3e-sys-color-surface-container` read `#211f26` on the provider element and
`#f3edf7` on the portaled menu in the same document, painting
`rgb(243, 237, 247)`.

The color-mode symptom is the visible half. The same inline block carries
density, typography, shape, motion, and component-token overrides, so under a
custom theme a portaled overlay rendered the default theme in every domain.
`Menu.theme.test.tsx` asserted a `container-max-width` override on the provider
element and never on the menu meant to obey it, which is why the gap survived a
full conformance pass.

`Tooltip` and `Snackbar` paint `inverseSurface` — `neutral-20` light,
`neutral-90` dark — so a light-looking tooltip on a dark page is correct and the
defect read as intentional. They were rendering the light scheme's inverse: the
right role against the wrong scheme.

The repair carries the scope to the portal root through React context, so the
nearest provider wins and a nested scope travels out with its own overlay. See
ADR 0029 for the alternatives considered, including why the overlays are not
portaled into the provider element instead.

### Expected files

- Modified: `src/theme/contexts.ts`,
  `src/theme/Material3Provider/Material3Provider.tsx`,
  `src/components/Menu/Menu.tsx`, `src/components/Select/Select.tsx`,
  `src/components/Tooltip/Tooltip.tsx`, `src/components/Snackbar/Snackbar.tsx`,
  the four matching `tests/components/*/*.theme.test.tsx`, the four matching
  `*.conformance.md`, `docs/THEMING.md`, `docs/SPEC.md`,
  `docs/ACTIVE_TASK.md`.
- Added: `docs/adr/0029-portal-roots-reconstitute-the-enclosing-theme-scope.md`.
- Also modified: `.claude/skills/run-playground/driver.mjs`, which had no way to
  emulate the OS color preference. Headless Chromium reports `light`, so no
  dark-mode defect was visible to the playground driver at all.
- No CSS, token, example, or site file changes: the generated stylesheet already
  carries every rule this needs, and the site consumes the package.
- No export, prop type, or token value changes — `ThemeScopeContext` and
  `usePortalThemeScope` stay internal, so `docs/component-inventory.json` is
  unchanged.

### Acceptance checks

- With the provider resolved dark, a portaled `Menu`, `Select` listbox,
  `Tooltip`, and `Snackbar` each resolve their container role against the dark
  scheme in a real browser, not just in the DOM contract.
- A custom theme's component-token override reaches the portal root.
- An overlay opened inside a nested provider carries the *nested* scope.
- Without any provider, an overlay emits neither the class nor the mode
  attribute, so a document-level scope still governs.
- The new tests fail against the unrepaired components, proving they are not
  vacuous.
- `npm run verify` passes.

### Completion evidence

- The browser probe that measured the defect now measures the repair, on the
  same page with the OS preference emulated dark: the menu paints
  `rgb(33, 31, 38)` against the provider's `#211f26`, and its label reads
  `rgb(230, 224, 233)` — the dark scheme's `onSurface`. `Select`'s listbox
  matches. `Tooltip` and `Snackbar` paint `rgb(230, 224, 233)` on
  `rgb(50, 47, 53)`, the dark scheme's `inverseSurface`/`inverseOnSurface`
  pair, inverted the correct way for the first time.
- The four theme tests were run against the unrepaired components before the fix
  landed: 6 failed, 15 passed. The four "no provider" cases pass in both states
  by design — they are regression guards against emitting a scope where none was
  asked for, not the proof.
- 146 tests pass across the four components and the theme suite (136 before,
  10 added).
- `npm run verify` passes in full: 13 gates, 165 test files, 956 tests,
  packed tarball 308,547 of 342,900 budgeted bytes, `check:site` at 32
  conformant components.

### Not done

- The rendering audit was not re-run. It needs a real Chromium and this change
  alters no geometry, elevation, or state layer — only which scope a portal root
  resolves its custom properties against. The playground probe above covers the
  color question it would have answered.
- No release. The registry still holds `1.0.2`; publishing this repair is a
  separate task, the same separation T33 and T34 used.


---

## T37 — 1.0.3 patch release

Status: complete
Approved: 2026-07-22 (owner request: publish the T36 repair to npm)
Completed: 2026-07-22

### Scope

Prepare the T36 portal-scope repair for the registry.

The registry holds `1.0.0-next.0`, `1.0.0`, and `1.0.2`, with `latest` at
`1.0.2`. `1.0.3` is an ordinary next patch — no gap to explain this time, unlike
T34's skip over the never-published `1.0.1`.

Every published version to date carries the T36 defect, so this is the first
release in which a portaled `Menu`, `Select` listbox, `Tooltip`, or `Snackbar`
honors color mode, a custom theme, or a nested scope.

No export, prop, token, or dependency changes. `ThemeScopeContext` and
`usePortalThemeScope` are internal.

### Expected files

- Modified: `package.json`, `package-lock.json`, `scripts/check-release.mjs`
  (its `releaseVersion` constant gates the version and must move in step),
  `docs/RELEASE_NOTES.md`, `docs/RELEASE_READINESS.md`, `docs/ACTIVE_TASK.md`,
  `docs/SPEC.md`.
- No file under `src/`, `tests/`, `playground/`, or `site/` changes. This task
  alters no behavior.

### Acceptance checks

- `npm run verify` passes at `1.0.3`, including `check:release`.
- The readiness report carries the three strings the release gate matches for
  `1.0.3`.
- Publication and the `v1.0.3` tag are performed by the owner, not from here.

### Completion evidence

- `npm run verify` passed in full at `1.0.3` before publication: 13 gates, 165
  test files, 956 tests, `check:release` green against the new constant.
- Published by the owner 2026-07-22 from commit `fda9cb7`. `npm view` confirms
  the registry holds `1.0.0-next.0`, `1.0.0`, `1.0.2`, and `1.0.3`, with
  `latest` at `1.0.3`.
- The published artifact was verified rather than assumed: the `1.0.3` tarball
  was re-downloaded from the registry and its `dist/index.js` carries the
  portal-scope code. A release that shipped only the version bump would have
  passed every other check here.
- Tagged `v1.0.3` at `fda9cb7`, the commit the publish was cut from. The
  repository's own history motivates checking this: `v1.0.1` was tagged and
  never published, and `check:release` verifies rollback against tags, so a
  published-but-untagged version is the same class of drift in the other
  direction.

### Not done

- The rendering audit was not re-run, for the same reason T36 did not run it:
  no geometry, elevation, or state layer changed.
- **Security boundary, unlike T34:** the publishing token was again transmitted
  in conversation, and the publish was **not** performed from the assistant
  session — the sandbox declined to run a command carrying the credential, and
  the step was handed back to the owner rather than worked around. The token
  must still be treated as disclosed and revoked, exactly as T34's follow-up
  records.


---

## T38 — Material 3 Expressive Chip family

Status: complete
Approved: 2026-07-23 (owner request: expand the supported catalogue one
component task at a time, with every original-source behavior accounted for)
Completed: 2026-07-23

### Scope

Add one public, discriminated `Chip` component covering all four Material chip
purposes from the pinned AndroidX implementation:

- assist;
- filter;
- input;
- suggestion.

The flat and elevated treatments are supported wherever the pinned source
defines them: assist, filter, and suggestion have both; input is flat only.
Filter and input chips support controlled and uncontrolled selection. All chips
render one native `<button type="button">`, with selectable chips exposing
their state through `aria-pressed`; this translates the source's button and
selection behavior onto native web activation, focus, disabled, form, and
event-cancellation semantics.

This task is source-completeness gated. The conformance record and ADR must
inventory every non-deprecated public composable, defaults object, slot,
state-resolution path, geometry value, shape, color, outline, elevation,
typography role, arrangement rule, and motion used by:

- AndroidX `Chip.kt` at revision
  `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`;
- `AssistChipTokens.kt`, `FilterChipTokens.kt`, `InputChipTokens.kt`,
  `SuggestionChipTokens.kt`, and the expressive `ChipsTokens.kt` at that same
  revision;
- the pinned AndroidX `ChipTest.kt` and `ChipScreenshotTest.kt`.

Each source item must be marked implemented, adapted to a named native-web
contract, or excluded with a concrete reason. Deprecated binary-compatibility
overloads, Compose `Modifier`/`InteractionSource` plumbing, arbitrary
per-instance token objects, and Compose-only layout machinery are not public
React APIs, but their observable output remains in scope. Generated token names
that the pinned implementation never reads are recorded as unread rather than
registered as fictitious runtime behavior.

The observable contract includes:

- the 32px visual container inside a minimum 48px interaction target;
- label, leading-icon, trailing-icon, and input-avatar slots, with avatar
  precedence and sourced 18px/24px slot geometry;
- slot-aware 8px/4px spacing and logical 4px/8px input-chip edge padding;
- flat outlines, selected outline removal, elevated containers, all enabled,
  disabled, selected, hover, focus, press, and available dragged elevation
  values;
- input-avatar clipping and disabled opacity;
- the expressive unselected, selected, and pressed shape set for filter/input
  chips, including immediate reduced-motion outcomes;
- retained leading/trailing content during selectable-slot exit motion;
- long-label/trailing-slot containment, intrinsic sizing, large-text growth,
  RTL, forced-colors, SSR, and hydration behavior.

No runtime dependency or package export path changes. Publication is a separate
task.

### Expected files

- Added: `src/components/Chip/Chip.tsx`,
  `src/components/Chip/Chip.types.ts`, `src/components/Chip/Chip.css`,
  `src/components/Chip/index.ts`, `src/tokens/defaults/chip.ts`,
  `docs/components/Chip.md`, `playground/examples/Chip.example.tsx`,
  the mirrored `tests/components/Chip/*` suite and conformance record, and a
  Chip API/source-translation ADR.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `docs/component-inventory.json`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/ACTIVE_TASK.md`, and the
  relevant token, documentation, playground, site-demo, rendering-audit, and
  bundle-budget registries.
- Generated documentation and site-demo artifacts are regenerated with their
  documented scripts rather than hand-edited.

### Acceptance checks

- The source-completeness ledger accounts for every item named above and is
  enforced by focused token/CSS/type/behavior tests rather than prose alone.
- All four chip purposes, supported treatments, slots, selection modes, and
  state combinations render their sourced output; TypeScript rejects elevated
  input chips and selection props on momentary chips.
- Native click, Enter/Space activation, focus, disabled, cancellation, form
  safety, ref forwarding, controlled/uncontrolled selection, and accessible
  naming/state behavior pass user-event and accessibility tests.
- Light/dark, custom-token scope, RTL, forced-colors, reduced-motion, large
  text, SSR, hydration, long-label, intrinsic-size, and slot-transition cases
  pass.
- Component-token source metadata pins the exact AndroidX revision and access
  date; no raw palette, shape, elevation, or motion value is hidden in
  component CSS when a source or system token exists.
- The public inventory, documentation page, example, named exports, complete
  stylesheet, token-only stylesheet, and built package agree.
- Narrow component, token, CSS, documentation, architecture, type, and
  production-build checks pass while iterating.
- `npm run verify` passes.
- Because this task changes geometry, elevation, and state layers:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes in a real browser, with any allowlist addition carrying a specific
  Material-contract reason.

### Completion evidence

- The executable source ledger accounts for all 19 current public
  composable/default/value-class entries, all 14 deprecated compatibility
  entries, eight pinned implementation anomalies, all 220 generated token
  declarations (118 read, 102 deliberately unread), all 59 pinned `ChipTest`
  cases, and all 34 pinned `ChipScreenshotTest` cases.
- The mirrored Chip suite passes 44 focused tests across behavior,
  accessibility, CSS, types, themes, SSR/hydration, and source completeness.
  The aggregate suite passes 171 files and 1,000 tests.
- `npm run verify` passes all 13 gates: source typecheck, tests, package and
  playground production builds, architecture, docs, browser floor, CSS,
  tokens, release contract, bundle budgets, packed Vite/Next consumer
  fixtures, and site consistency.
- The required real-browser audit passes in Chrome after a production package
  and playground build. T38 strengthened that gate to check Chip's 48px target,
  32px visual minimum, centering, 18px icon and 24px avatar slots, collapsed
  absent slots, and constrained-label/trailing-slot non-overlap in addition to
  the existing shadow-clip and target-size checks. No allowlist was added.
- The documentation site production build passes and statically generates all
  50 routes, including the new Chip contract page and live example. The
  inventory-derived matrix now reports 33 conformant components and the site
  registry 32 demos.
- Existing bundle ceilings remain sufficient; the packed package is 321,754 /
  342,900 bytes and the full stylesheet is 401,858 / 417,600 bytes. No budget
  baseline was loosened.
- Publication is outside T38. The working package remains `1.0.3`; a release
  version and registry action require a separately approved task.


---

## T39 — Material 3 Expressive Slider family

Status: complete
Approved: 2026-07-23 (owner request: continue the deferred catalogue one
component family at a time without omitting any original-source behavior)
Completed: 2026-07-23

### Scope

Add a complete Slider family from the same pinned AndroidX Material 3 revision
used by T38:

- a single-value `Slider`;
- a two-value `RangeSlider`;
- horizontal and current Expressive vertical orientation;
- the source's ordinary and centered track treatments.

The public React API must support controlled and uncontrolled values, continuous
and discrete steps, enabled/disabled state, change-finished notification,
logical direction, custom passive thumb/track/tick/stop-indicator presentation
where it can preserve the native-web contract, and every observable source
geometry/state path. `Slider` maps the source's `VerticalSlider` onto a typed
orientation/direction option rather than adding a third nearly identical React
component. `RangeSlider` remains separate because it owns two independently
focusable slider semantics and a non-crossing ordered value.

Native web semantics win over Compose plumbing. Each semantic thumb is a native
`<input type="range">` so forms, labels, accessible value state, focus,
keyboard operation, disabled state, and browser activation remain platform
owned. The authored track, handle, ticks, stop indicator, focus treatment, and
range geometry are decorative siblings. The range pair must keep both native
inputs independently nameable while preventing values from crossing and
preserving the pinned source's overlapping-thumb selection behavior.

This task is source-completeness gated. Before implementation, an executable
ledger must account for every current and deprecated public composable,
`SliderDefaults` overload/value, `SliderColors`, `SliderPositions`,
`SliderState`, `RangeSliderState`, internal observable resolution path, and
known source anomaly in:

- AndroidX `Slider.kt` at revision
  `225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`;
- generated `SliderTokens.kt` at that revision (51 declarations);
- pinned `SliderTest.kt` (55 tests);
- pinned `SliderScreenshotTest.kt` (50 tests).

Each source item must be marked implemented, adapted to a named native-web
contract, or excluded with a concrete reason. Compose `Modifier`,
`MutableInteractionSource`, draw scopes, state objects, and arbitrary
per-instance color objects are not copied as React mechanisms, but their
observable semantics and output stay in scope. Generated names the pinned
implementation never reads are classified as unread rather than registered as
fictitious behavior.

The observable contract includes value coercion, continuous/discrete snapping,
tap and drag, completion callbacks, zero/constrained dimensions, RTL, vertical
top-to-bottom and bottom-to-top direction, minimum target behavior, active and
inactive track segmentation, range-thumb overlap and collision, centered
tracks, ticks and endpoint stop indicators, handle width changes on focus and
press, disabled resolution, focus rings, custom theme tokens, forced colors,
reduced motion, SSR, hydration, form participation, and ref forwarding.

No runtime dependency or package export path changes. Publication is a separate
task.

### Expected files

- Added: `src/components/Slider/Slider.tsx`,
  `src/components/Slider/RangeSlider.tsx`,
  `src/components/Slider/Slider.types.ts`, `src/components/Slider/Slider.css`,
  `src/components/Slider/index.ts`, `src/tokens/defaults/slider.ts`,
  `docs/components/Slider.md`, `playground/examples/Slider.example.tsx`,
  the mirrored `tests/components/Slider/*` suite and conformance record, and a
  Slider API/source-translation ADR.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `docs/component-inventory.json`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/ACTIVE_TASK.md`,
  `docs/TOKEN_PROVENANCE.md`, and the relevant token, documentation,
  playground, site-demo, rendering-audit, release-count, and bundle registries.
- Generated documentation and site-demo artifacts are regenerated through
  their documented scripts rather than hand-edited.

### Acceptance checks

- The executable source ledger freezes every public/deprecated source entry,
  all 51 generated token declarations with their literal read/unread
  classification, all 55 pinned behavior tests, all 50 pinned screenshot
  tests, and every discovered implementation anomaly.
- `Slider` and `RangeSlider` pass controlled/uncontrolled, continuous/stepped,
  coercion, pointer, touch-equivalent, keyboard, completion, disabled, form,
  cancellation, ref, orientation, direction, RTL, overlap, and collision tests.
- Each semantic thumb has a correct native accessible name, min/max/now state,
  independent focus, forced-colors focus indication, and no serious or critical
  automated accessibility violation.
- Sourced handle, track, gap, corner, tick, stop-indicator, state, and centered
  geometry passes CSS/token tests and a real-browser audit; jsdom assertions are
  not treated as evidence for physical layout.
- Light/dark, custom-token scope, reduced motion, SSR/hydration, production
  styles, the public inventory, documentation, example, root exports,
  token-only stylesheet, and packed package agree.
- Narrow component/token/CSS/type/documentation/architecture checks pass while
  iterating, followed by `npm run verify`.
- Because this task changes interactive geometry and state layers:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes without an unexplained allowlist addition.

### Completion evidence

- The public root exports `Slider`, `RangeSlider`, their props/value/state
  types, and no new package subpath. Both semantic controls are native range
  inputs; the package still has zero runtime dependencies and React/React DOM
  remain its only peers.
- `Slider.source.test.ts` freezes the four pinned upstream blobs and line
  counts, all 25 current entries, five deprecated entries, 25 observable
  implementation paths, 13 source anomalies, all 51 generated declarations
  partitioned into 15 read and 36 unread roles, all 55 behavior tests, and all
  50 screenshot cases.
- The focused Slider suite passes 58 tests across behavior, accessibility,
  CSS, theme, SSR/hydration, types, source identity, production styles, and
  conformance. It covers controlled/uncontrolled state, semantic and pointer
  tie differences, continuous/discrete values, source slop consumption,
  sub-slop press coordinates, out-of-bounds and zero-size mapping, scrolling
  cancellation, keyboard/Page asymmetry, forms/reset, disabled state, refs,
  vertical reversal, CSS/HTML RTL, range selection/overlap/collision, dynamic
  semantic bounds, and completion timing.
- Track translation retains source details that are easy to flatten away:
  discrete points project between corner centers; reversed vertical direction
  reverses complete colored segments and gap sides; centered tracks distinguish
  the real thumb's 8px gap from the virtual center's 6px gap; focus grows those
  gaps by 4px without moving anchors; physical CSS masks remove ticks/stops
  from gaps; and logical negative margins keep fixed-size handles/ticks/stops
  centered in RTL.
- The strengthened real-Chromium rendering audit passes without an allowlist
  addition. It measures 48px targets, 16px tracks, horizontal 4×44px and
  vertical 44×4px handles, 8px thumb gaps, 6px centered virtual gaps, RTL
  discrete positions, bottom-to-top active placement, 8→12px focus gaps with
  invariant anchors, 4→2px focused handles, and pixel-level tick suppression
  in centered and constrained layouts.
- The token registry emits 1,641 resolved custom properties, including 26
  Slider properties. Light/dark, nested custom scopes, crossed tick roles,
  disabled compositing, forced colors, reduced motion, and token-only output
  pass their relevant gates.
- Documentation generation reports 34 conformant component pages. The
  production playground builds with continuous, stepped, centered, RTL, range,
  and both vertical-direction examples; the generated site registry reports 33
  demos and the exact export map.
- T39 legitimately exceeded four T27 bundle ceilings. ADR 0031 records the
  measured 352,500-byte JavaScript closure (61,654 gzip), 81,461-byte
  declaration closure (18,976 gzip), 414,869-byte full CSS (45,036 gzip),
  124,371-byte token CSS (10,891 gzip), and 352,618-byte package, then applies
  the established approximately-12% proportional headroom to every artifact.
- `npm run verify` passes all 13 gates: 177 files / 1,058 tests, distributable
  and playground builds, architecture, documentation, browser support, CSS,
  tokens, release contract, bundle budgets, Vite/Next packed consumers, and
  site structure. The task-specific build/playground/Chrome audit also passes.
- Publication remains outside T39. The working package is still `1.0.3`; a
  version and registry action require a separately approved release task.


---

## T40 — Material 3 Expressive List Item family

Status: complete
Approved: 2026-07-24 (owner request: add `ListItem` and
`SegmentedListItem`, with particular care around correct component tokens)

### Scope

Add one public List Item family containing two named exports:

- `ListItem`;
- `SegmentedListItem`.

Both exports use one discriminated interaction model covering passive content,
native button actions, native-radio-backed single selection, and
native-checkbox-backed multiple selection. The native semantic element owns
activation, keyboard behavior, focus, disabled state, form participation,
reset, cancellation, and the forwarded ref. Controlled and uncontrolled
selection are supported where meaningful.

The shared anatomy includes headline, leading, trailing, overline, and
supporting slots; one-, two-, and three-line geometry; short-item centering and
tall-item top alignment; intrinsic and constrained sizing; logical layout and
RTL. `SegmentedListItem` accepts validated `index` and `count` values and
reproduces the first, middle, last, and only-item corner treatment plus the
sourced segmented gap.

This task is source-completeness gated against immutable AndroidX revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab`. The executable ledger covers:

- `ListItem.kt` and `ListItemDefaults.kt`;
- generated `ListTokens.kt` v29.0.0, containing 120 declarations;
- generated `ReorderListTokens.kt` v29.0.0, containing nine declarations;
- `ListItemTest.kt` and `InteractiveListTest.kt`, containing 44 behavior tests;
- `ListItemScreenshotTest.kt` and `InteractiveListScreenshotTest.kt`,
  containing 27 screenshot tests.

Every current/deprecated composable, defaults path, value class, state
resolution, geometry, typography, shape, color, elevation, and motion path must
be implemented, adapted to a named native-web contract, or excluded with a
concrete reason. Only generated roles the pinned implementation observes are
registered. Direct implementation geometry is recorded separately rather than
hidden as unexplained CSS. `ReorderListTokens` remains a distinct source family
for dragged colors and shape, even where values could be flattened.

Long-press is excluded as a public pointer-only React API because the web has no
equivalent native keyboard activation. Native drag events keep the source's
dragged visual state reachable. Arbitrary Compose color/shape/elevation objects,
`Modifier`, `InteractionSource`, measure policies, and semantics DSL are
platform mechanisms rather than React APIs, but their observable output remains
in scope.

No runtime dependency, peer dependency, or package export-path change.
Publication is a separate task.

### Expected files

- Added: `src/components/ListItem/ListItem.tsx`,
  `src/components/ListItem/ListItem.types.ts`,
  `src/components/ListItem/ListItem.css`,
  `src/components/ListItem/index.ts`,
  `src/tokens/defaults/list-item.ts`, `docs/components/ListItem.md`,
  `playground/examples/ListItem.example.tsx`, the mirrored
  `tests/components/ListItem/*` suite and conformance record, and a List Item
  API/source-translation ADR.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `docs/component-inventory.json`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/ACTIVE_TASK.md`,
  `docs/TOKEN_PROVENANCE.md`, and the relevant token, documentation,
  playground, site-demo, rendering-audit, release-count, and bundle registries.
- Generated documentation and site-demo artifacts are regenerated through
  their documented scripts rather than hand-edited.

The inventory gains one List Item family/page containing both named exports.

### Acceptance checks

- The executable ledger freezes every pinned upstream file identity,
  declaration, current/deprecated surface, behavior test, screenshot test, and
  discovered implementation anomaly.
- Registered component tokens match sourced reads, including the distinct
  `ReorderListTokens` dragged-state roles. Generated-but-unread names remain
  explicitly classified instead of becoming fictitious runtime behavior.
- Passive, action, radio, and checkbox modes pass native click, Enter/Space,
  focus, disabled, cancellation, form/reset, ref, controlled/uncontrolled, and
  accessible name/state behavior tests.
- Type tests reject invalid interaction/state combinations and invalid
  segmented `index`/`count` combinations.
- Sourced height, padding, alignment, slot spacing, segmented gap, corners,
  elevation, state precedence, typography, and motion pass focused CSS/token
  tests and real-browser measurement.
- Light/dark, scoped token overrides, RTL, large text, forced colors, reduced
  motion, SSR/hydration, production styles, public exports, inventory,
  documentation, examples, complete/token-only stylesheets, and packed
  consumers agree.
- Narrow component/token/CSS/type/documentation/architecture checks pass while
  iterating, followed by `npm run verify`.
- Because this task changes geometry, elevation, and state layers:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes without an unexplained allowlist addition.

### Completion evidence

- `ListItem` and `SegmentedListItem` are public named exports with passive,
  native-button action, native-radio single-selection, and native-checkbox
  multiple-selection branches. Controlled/uncontrolled state, form/reset,
  cancellation, refs, disabled behavior, drag state, SSR, and hydration pass.
- The pinned ledger freezes eight file identities; all 120 `ListTokens` and
  nine `ReorderListTokens` declarations; their 46/74 and 7/2 read/unread
  partitions; 25 current and 13 deprecated source-surface entries; all 44
  behavior and 27 screenshot cases; and four translation-sensitive source
  details.
- The token registry adds 50 resolved List Item properties and emits 1,691
  custom properties overall. Sourced 56/72/88px heights, 16/10/12px padding,
  12px slot spacing, 2px segmented gap, logical corners, content roles,
  disabled opacity, selected colors, distinct Reorder List dragged colors/
  shape, Level 4 dragged shadow, typography, and motion paths are covered.
- The focused List Item suite passes 38 behavior, accessibility, CSS, theme,
  SSR/hydration, and source-ledger tests; compile-only type cases accept all
  valid refs/modes and reject invalid state/interaction/segmented combinations.
  The full suite passes 183 files / 1,096 tests.
- Documentation generation reports 35 conformant component pages; the site
  registry reports 34 demos. Architecture, CSS, token, browser-support,
  release, and site checks pass.
- Bundle checks remain within the existing ADR 0031 ceilings: 369,231-byte
  JavaScript closure (64,462 gzip), 88,240-byte declaration closure (20,150
  gzip), 432,367-byte full CSS (46,838 gzip), 128,129-byte token CSS (11,199
  gzip), and a 366,647-byte packed package.
- `npm run verify` passes all 13 gates, including distributable/playground
  builds and both Vite and Next.js packed consumers.
- The required real-Chromium audit passes after
  `npm run build && npm run playground:build`, measuring List Item line
  minimums, logical padding, slot spacing, full-row native inputs, segmented
  gap/corners, and selected state shape alongside every existing rendering
  probe. No rendering allowlist was changed.
- Publication remains outside T40. The working package stays `1.1.0`; a
  version and registry action require a separately approved release task.


---

## T41 — Material catalog parity roadmap

Status: complete
Approved: 2026-07-24 (owner request: make full primitive-then-composite
Material catalog coverage the official cross-document roadmap)

### Scope

Create a documentation-only, source-dated
[roadmap](MATERIAL_CATALOG_ROADMAP.md) for complete coverage of the official
Material 3 component catalog. The roadmap separates:

- public primitives;
- public composite components;
- tested composition recipes that should not become package exports.

Every family shown on the official Material 3 Components index at the source
snapshot date receives exactly one current disposition: `conformant`,
`partial`, `planned`, or `excluded`. Existing inventory entries remain the only
source of stable support claims; a roadmap row does not advertise an
implementation.

Future component tasks must freeze the relevant first-party surfaces and
classify every documented variant, state, token, behavior, and composition as a
public API, a tested recipe, a native-web adaptation, or an exclusion with a
concrete reason. Composite implementation follows completion of the remaining
primitive tranche. Catalog reconciliation and recipe parity follow composite
implementation.

No runtime, public API, token, generated artifact, dependency, package export,
inventory status, or publication change is in scope.

### Expected files

- Added: `docs/MATERIAL_CATALOG_ROADMAP.md` and a roadmap-governance ADR.
- Modified: `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/ACTIVE_TASK.md`, and `docs/README.md`.

### Acceptance checks

- The roadmap names its first-party catalog URL and access date and accounts
  for every top-level family visible in that snapshot exactly once.
- The roadmap defines primitive, composite, recipe, status, sequencing, and
  exclusion rules without weakening the inventory-backed conformance model.
- Project completion requires catalog-family disposition plus variant/recipe
  reconciliation; planned roadmap work is not presented as stable support.
- The specification, architecture, documentation index, active-task record,
  and accepted ADR cross-link the canonical roadmap.
- Local Markdown links resolve and `npm run check:docs`,
  `npm run check:architecture`, and `npm run verify` pass.

### Completion evidence

- The rendered first-party Material 3 Components index was frozen on
  2026-07-24 as 36 sequential family rows: 25 Conformant, 2 Partial, 9 Planned,
  and 0 Excluded. The aggregate `all-buttons` route is explicitly classified
  outside the family count.
- The roadmap separates primitive, composite, mixed, and recipe delivery;
  preserves `component-inventory.json` as the sole stable conformance truth;
  and requires a public API, tested recipe, native-web adaptation, or concrete
  exclusion for every detailed family-ledger entry.
- The official sequence now finishes Badges and Divider, then implements the
  seven wholly planned composite families, closes the partial Lists and
  Toolbars families, and finishes with a refreshed catalog audit. Expanding
  lists are named explicitly in the recipe tranche and completeness contract.
- `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/README.md`, this task record,
  and accepted ADR 0033 link the canonical roadmap. No runtime, token,
  inventory, export, dependency, generated artifact, version, or release claim
  changed.
- `npm run check:docs` and `npm run check:architecture` pass. `npm run verify`
  passes all 13 gates with 183 files / 1,096 tests, 35 conformant inventory
  entries, 1,691 generated token properties, both packed consumer builds, and
  the documentation-site check. The successful aggregate run used an isolated
  temporary npm cache because the user-level cache contains root-owned files.


---

## T42 — Material 3 Divider primitive

Status: complete
Approved: 2026-07-24 (owner request: add the next primitive, then update the
components that rely on a divider to use the real one)

### Scope

Add one public `Divider`, the first of the two families the T41 roadmap leaves
in its primitive tranche, and repair the one existing consumer the new
component makes traceable.

The pinned source is small and fully accountable. `Divider.kt` exports
`HorizontalDivider`, `VerticalDivider`, a deprecated `Divider` alias, and
`DividerDefaults`; generated `DividerTokens.kt` declares exactly two roles and
the implementation reads both. This task is source-completeness gated against
immutable AndroidX revision `a90df2fc27e026b9ad2ed569f203a260c1041fab` — the
same revision T40 pinned, so the four `ListTokens.Divider*Space` roles frozen
there describe one upstream snapshot. The executable ledger covers `Divider.kt`,
`DividerTokens.kt`, `DividerTest.kt` (6 tests), and `DividerScreenshotTest.kt`
(4 tests).

Three translation decisions carry the design, all recorded in ADR 0034:

- Both current composables collapse into one `orientation` prop, the
  one-component-per-axis rule ADR 0031 established for `VerticalSlider`.
- `as` selects `hr`, `div`, or `li`. The set is closed and decided by HTML
  content models: `ul`/`ol` accept only `li` and script-supporting children, so
  an `hr` between list items is invalid, and separating list items is one of the
  divider's two named purposes.
- Semantics are exposed by default and opted out of with `decorative`. Compose
  dividers carry no semantics at all; on the web the accessible default is the
  opposite, and `hr` supplies the role for free.

`thickness` and `color` are adapted to component tokens rather than props, so no
arbitrary value has to be emitted as an inline style. `Dp.Hairline` is excluded:
it exists to paint one physical pixel against density scaling, a CSS pixel is
already density-independent, and the pinned hairline test asserts the modern
composables lay out at zero height. Indentation stays composition, matching the
pinned indent test.

The consumer repair: `Tabs` registered `divider-color`/`divider-height` from
`SecondaryNavigationTabTokens.DividerColor`/`DividerHeight`. `TabRow.kt` reads
neither — every `divider` parameter across both variants, both scrollable
forms, and the deprecated overloads defaults to
`@Composable { HorizontalDivider() }`, which is `outlineVariant` at 1dp. T19
encoded a generated-but-unread role as runtime behavior because no `Divider`
existed to trace the generic composable to; T21's `LinearProgress` note then
cited that registration as precedent for the opposite rule. Both records are
corrected here. `Tabs` keeps its own namespaced tokens and its
`border-block-end` painting, because `role="tablist"` owns only `role="tab"`
children.

No runtime dependency, peer dependency, or package export-path change. No token
is removed or renamed. Publication is a separate task.

### Expected files

- Added: `src/components/Divider/Divider.tsx`,
  `src/components/Divider/Divider.types.ts`,
  `src/components/Divider/Divider.css`, `src/components/Divider/index.ts`,
  `src/tokens/defaults/divider.ts`, `docs/components/Divider.md`,
  `playground/examples/Divider.example.tsx`, the mirrored
  `tests/components/Divider/*` suite and conformance record, and ADR 0034.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `src/tokens/defaults/tabs.ts`,
  `src/tokens/defaults/linear-progress.ts`, `docs/component-inventory.json`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/TOKEN_PROVENANCE.md`,
  `docs/MATERIAL_CATALOG_ROADMAP.md`, `docs/ACTIVE_TASK.md`,
  `tests/components/Tabs/Tabs.conformance.md`, `tests/tokens/schema.test.ts`,
  `tests/tokens/css.test.ts`, `scripts/check-release.mjs`, `package.json`,
  `site/content/site.ts`, `playground/src/main.tsx`,
  `playground/src/playground.css`.
- Generated: `docs/SUPPORTED_COMPONENTS.md`, `site/demos/registry.tsx`.

### Acceptance checks

- The executable ledger freezes all four pinned blob identities, both generated
  declarations with their read/unread partition, the 11 current and 4 deprecated
  source entries, all 6 behavior and 4 screenshot cases, and the 4 discovered
  implementation anomalies.
- Both orientations, all three elements, and both semantic modes render their
  sourced output; TypeScript rejects an open orientation, an unsupported
  element, children, a mismatched ref, and a non-boolean `decorative`.
- The role matrix holds: implicit on semantic `hr`, `separator` on `div`/`li`,
  `none` on decorative `hr`/`li`, absent on decorative `div`;
  `aria-orientation` only on vertical separators.
- Light/dark, scoped token overrides, RTL, forced colors, SSR, hydration,
  public exports, inventory, documentation, example, and packed consumers agree.
- The `Tabs` divider resolves `outlineVariant`, and the two registrations carry
  the same sourced values.
- `npm run verify` passes.
- Because this task adds component geometry:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes without an unexplained allowlist addition.

### Completion evidence

- `Divider` is a public named export with `orientation`, `as`, and `decorative`
  props. The package still has zero runtime dependencies, React/React DOM remain
  its only peers, and no export path, prop, or token was removed or renamed.
- `Divider.source.test.ts` freezes the four pinned blob identities, both
  generated declarations partitioned 2 read / 0 unread, the 11 current and 4
  deprecated source entries, all 6 behavior and 4 screenshot cases, and 4
  implementation anomalies. This is the first family in the library with no
  unread generated roles.
- The four anomalies are recorded rather than smoothed over. The KDoc on both
  current composables promises `Dp.Hairline` yields "a single pixel divider
  regardless of screen density", while the pinned `divider_hairlineThickness`
  asserts `heightPx == 0` — only the deprecated `Divider` implements the
  promise. The deprecated path fills a `Box` background where the current ones
  stroke a `Canvas`. `DividerTokens.kt` is generator version `v0_117` (shared
  with `RadioButtonTokens.kt` and `ScrimTokens.kt`) while the
  `ListTokens.kt`/`ReorderListTokens.kt` T40 pinned at this same revision are
  `29.0.0`; the tokens directory spans 19 generator versions in total, so the
  contrast is with the files this ledger shares a revision with, not with every
  sibling. Screenshot coverage has no
  `verticalDivider_darkTheme`.
- The focused Divider suite passes 50 tests across behavior, accessibility,
  CSS, theme, SSR/hydration, and the source ledger. Six compile-only type cases
  reject an open orientation, an unsupported element, children, a mismatched
  ref, and a non-boolean `decorative`; `tsc --noEmit` passes, so every
  `@ts-expect-error` is load-bearing.
- The `Tabs` correction is source-verified rather than asserted.
  `SecondaryNavigationTabTokens.kt` declares `DividerColor`/`DividerHeight`, and
  `TabRow.kt` imports that object but reads only `ContainerColor` (line 1005)
  and `ActiveLabelTextColor` (line 1021). All eight public `divider`
  parameters — the four current variants (lines 161, 212, 267, 337), the two
  hidden binary-compatibility overloads (1205, 1236), and the two deprecated
  composables (1349, 1414) — default to `@Composable { HorizontalDivider() }`,
  as does the private `ScrollableTabRowWithSubcomposeImpl` (834). The color
  moved to `outlineVariant`; the 1px height was already correct.
- Two provenance records that contradicted each other now agree. T21's
  `LinearProgress` note cited `Tabs`' `divider-color` as precedent for "prefer
  the value the code actually uses over an unread token" while `Tabs` had done
  the opposite. Both `docs/TOKEN_PROVENANCE.md` and
  `src/tokens/defaults/linear-progress.ts` state the correction rather than
  quietly agreeing after the fact.
- The token registry adds 2 Divider properties and emits 1,693 overall. Light,
  dark, nested custom scopes, and token-only output pass their gates; a theme
  test pins the Tabs and Divider registrations to identical sourced values so
  they cannot drift apart again.
- `npm run verify` passes all 13 gates: 189 test files / 1,146 tests, 36
  conformant inventory entries, 36 documentation pages, 39 stylesheets, both
  packed consumer fixtures, and the site check at 35 demos.
- Bundle checks stay inside the existing ADR 0031 ceilings with no baseline
  loosened: 370,960-byte JavaScript closure (64,699 gzip), 89,819-byte
  declaration closure (20,532 gzip), 432,926-byte full CSS (46,946 gzip),
  128,224-byte token CSS (11,212 gzip), and a 369,412-byte packed package.
- The required real-Chromium audit passes after a production package and
  playground build. T42 strengthened the gate with Divider probes measuring
  1px thickness on the correct axis per orientation, collapse detection,
  painted background, neutralised `hr` border and block margins, flex-row
  cross-axis fill, and container overflow. No allowlist was changed.
- The new probe was proven non-vacuous in both directions. It finds 6 rendered
  dividers — two `hr` and two `li role="separator"` at 576x1px, two vertical
  `hr` at 1x40px filling their flex row, all painting `rgb(202, 196, 208)`,
  which is `outlineVariant` in the light scheme. Replacing `align-self: stretch`
  with `flex-start` and rebuilding made the audit fail with "vertical divider
  collapsed to 0.0px"; restoring it returned the gate to green.
- A post-completion source re-verification (2026-07-24) re-fetched all four
  pinned blobs — the test files live under `androidDeviceTest`, not the older
  `androidInstrumentedTest` path — and confirmed every hash and every frozen
  test name. It corrected three defects the first pass recorded or shipped:
  - The `TabRow.kt` divider-parameter count above originally read "seven"; the
    pinned file has eight public sites (the deprecated `ScrollableTabRow` at
    line 1414 was missed) plus the private impl at 834. Every one still
    defaults to `HorizontalDivider()`, so the conclusion stands.
  - The generator-version anomaly claimed siblings "are v29.0.0"; the tokens
    directory actually spans 19 generator versions (`RadioButtonTokens` and
    `ScrimTokens` share `v0_117`), so the anomaly now contrasts specifically
    with the `29.0.0` `ListTokens`/`ReorderListTokens` T40 pinned at this
    revision.
  - The horizontal rule used `inline-size: 100%`, so a margin inset kept the
    full width and escaped the parent's end edge — measured at exactly 16px
    overhang on the playground's 1rem-inset example, unseen by the audit's
    width-based overflow check. The rule now fills by auto/stretch sizing, so
    a margin inset shortens the line the way the source's `padding(start)`
    indent does (the inset example measures 560px inside its 576px parent with
    0px overhang), and the audit probe compares edges instead of widths.
    Seeding the percentage rule back into the built stylesheet makes the audit
    fail with "horizontal divider escapes its container edges"; the restored
    build passes.
- Publication remains outside T42. The working package stays `1.1.0`; a version
  and registry action require a separately approved release task.

## T43 — Material 3 Badge family

Status: complete
Approved: 2026-07-24 (owner request: add the next primitive, complete, including
every component that depends on a badge)

### Scope

Add the `Badge` family, the last entry in the T41 roadmap's primitive tranche,
and wire it into every component the pinned source anchors a badge to.

Source-completeness gated against immutable AndroidX revision
`a90df2fc27e026b9ad2ed569f203a260c1041fab` — the revision T40 and T42 already
pin, so all three ledgers describe one upstream snapshot. The executable ledger
covers `Badge.kt`, `BadgeTokens.kt`, `BadgeTest.kt` (11 tests), and
`BadgeScreenshotTest.kt` (4 tests).

A module-wide sweep for the word `badge` establishes the consumer set and
proves it complete: `Badge.kt` (70 hits), `NavigationDrawer.kt` (21),
`NavigationDrawerTokens.kt` (2), `NavigationItem.kt` (2), `Tab.kt` (1),
`NavigationRail.kt` (1), `NavigationBar.kt` (1). No other file in `commonMain`
mentions a badge.

That sweep establishes the task's central finding: **the source has two
unrelated affordances named "badge"**, and they must not be collapsed.

- The **anchored pill** is `Badge` positioned by `BadgedBox` at the anchor's
  top-trailing corner. `NavigationBar` (535), `NavigationItem` (460, 512),
  `NavigationRail` (541), and `Tab` (113) apply `Modifier.badgeBounds()`, which
  publishes `BadgeTopRuler`/`BadgeEndRuler` so a badge cannot escape the item.
  These are clamp sites, not slots: none of the four exposes a `badge`
  parameter, because the application passes a `BadgedBox` through the icon slot.
- The **trailing label** is `NavigationDrawerItem.badge`, "optional badge to
  show on this item from the end side" — end-aligned text 12dp after the label,
  colored by `NavigationDrawerItemColors.badgeColor(selected)`. It is neither
  error-colored nor a `Badge`, and the library has never implemented it.

Three translation decisions carry the design, recorded in ADR 0035:

- Small and large are not a prop. The source selects by `content != null`, so
  childless `<Badge />` is the 6dp dot and `<Badge>3</Badge>` is the 16dp pill.
  This is the same "let the content decide" rule that made `Divider` one
  component with an `orientation` rather than two exports.
- `BadgedBox` becomes `BadgeAnchor`. The positioning is behavior the source
  owns — the offset switch (6dp bare, 12/14dp labelled), `placeRelative` RTL
  mirroring, and the ruler clamp — so per the roadmap's completeness contract it
  is a public API rather than a documented recipe. The Compose-only "Box" is
  dropped for the same reason T42 did not reintroduce the deprecated `Divider`
  name.
- Badges become announceable. Compose badges carry no semantics; the pinned
  `badge_notMergingDescendants_withOwnContentDescription` shows the application
  supplying the description. On the web the icon slots of `NavigationBar`,
  `NavigationRail`, and `Tabs` are `aria-hidden="true"`, so a badge rendered
  inside one would be silent. `Badge` therefore takes a `label` whose text is
  exposed to assistive technology while the glyph is hidden, matching the design
  guidance that a badge is read after its destination.

`containerColor` and `contentColor` are adapted to component tokens rather than
props, for the reason T42 recorded: an arbitrary per-instance value would have to
be emitted as an inline style.

The consumer wiring adds an optional `badge` to the shared `NavigationItem`
shape — reaching `NavigationBar`, `NavigationRail`, `NavigationDrawer`, and
`NavigationSuite` through one type — and to `TabItem`. Each component places it
per its own Material specification, exactly as the source does: an icon-anchored
pill in the bar, rail, and tabs; an end-side label in the drawer.

The drawer also carries a provenance correction of the T42 kind.
`NavigationDrawerTokens` declares `LargeBadgeLabelColor` (`OnSurfaceVariant`)
and `LargeBadgeLabelFont` (`LabelLarge`), and nothing in `commonMain` reads
either. The implementation resolves `badgeColor(selected)`, which defaults to
the item's own text colors — `ActiveLabelTextColor` (`OnSecondaryContainer`)
when selected, `InactiveLabelTextColor` (`OnSurfaceVariant`) when not. The
unread role therefore agrees only in the unselected state. The registration
follows the read path. `NavigationDrawer.conformance.md` currently mentions
`badge` neither as implemented nor as excluded while its inventory entry is
conformant; that silent gap is closed here.

No runtime dependency, peer dependency, or package export-path change. No token
or prop is removed or renamed; every added field is optional. Publication is a
separate task.

### Expected files

- Added: `src/components/Badge/Badge.tsx`,
  `src/components/Badge/Badge.types.ts`, `src/components/Badge/BadgeAnchor.tsx`,
  `src/components/Badge/Badge.css`, `src/components/Badge/index.ts`,
  `src/tokens/defaults/badge.ts`, `docs/components/Badge.md`,
  `playground/examples/Badge.example.tsx`, the mirrored
  `tests/components/Badge/*` suite and conformance record, and ADR 0035.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `src/tokens/defaults/navigation-drawer.ts`,
  `src/components/NavigationBar/NavigationBar.types.ts`,
  `src/components/NavigationBar/NavigationBar.tsx`,
  `src/components/NavigationBar/NavigationBar.css`,
  `src/components/NavigationRail/NavigationRail.tsx`,
  `src/components/NavigationRail/NavigationRail.css`,
  `src/components/NavigationDrawer/NavigationDrawer.tsx`,
  `src/components/NavigationDrawer/NavigationDrawer.css`,
  `src/components/NavigationSuite/NavigationSuite.tsx`,
  `src/components/Tabs/Tabs.types.ts`, `src/components/Tabs/Tabs.tsx`,
  `src/components/Tabs/Tabs.css`, the four affected conformance records,
  `docs/component-inventory.json`, `docs/SPEC.md`, `docs/ARCHITECTURE.md`,
  `docs/TOKEN_PROVENANCE.md`, `docs/MATERIAL_CATALOG_ROADMAP.md`,
  `docs/ACTIVE_TASK.md`, `tests/tokens/schema.test.ts`, `tests/tokens/css.test.ts`,
  `scripts/audit-rendering.mjs`, `scripts/check-release.mjs`, `package.json`,
  `site/content/site.ts`, `playground/src/main.tsx`,
  `playground/src/playground.css`.
- Generated: `docs/SUPPORTED_COMPONENTS.md`, `site/demos/registry.tsx`.

### Acceptance checks

- The executable ledger freezes all four pinned blob identities, all 8 generated
  declarations with their read/unread partition, the current source surface, all
  11 behavior and 4 screenshot cases, and every discovered implementation
  anomaly.
- Both variants render their sourced geometry: a childless badge at the 6px
  `size` on both axes, a labelled badge at a 16px minimum with 4px inline
  padding, both fully rounded, error container with an onError label at the
  label-small typescale.
- `BadgeAnchor` places the badge at the top-trailing corner with the source's
  offset switch, mirrors under RTL, and keeps the badge inside the anchor's
  bounds rather than letting it escape — the web reading of the ruler clamp.
- The badge is announced: `label` reaches the accessibility tree from inside the
  `aria-hidden` icon slots of `NavigationBar`, `NavigationRail`, and `Tabs`, and
  the visible glyph is hidden so a count is never read twice.
- The drawer renders its badge as an end-side label at the item's own text
  color, resolving `onSecondaryContainer` when selected and `onSurfaceVariant`
  when not — not the unread `LargeBadgeLabelColor` and not the error color.
- TypeScript rejects a `label`-less badge where a name is required, a
  non-`ReactNode` badge on an item, and a mismatched ref.
- Light/dark, scoped token overrides, RTL, forced colors, SSR, hydration,
  public exports, inventory, documentation, example, and packed consumers agree.
- `npm run verify` passes.
- Because this task adds component geometry:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes without an unexplained allowlist addition, with new probes proven
  non-vacuous in both directions.

### Completion evidence

- `Badge` and `BadgeAnchor` are public named exports. The package still has zero
  runtime dependencies, React/React DOM remain its only peers, and no export
  path, prop, or token was removed or renamed. Every added field is optional.
- `Badge.source.test.ts` freezes the four pinned blob identities, all 8
  generated declarations partitioned 6 read / 2 unread, the 11-entry current
  surface, the 7 internal geometry constants, the 5 `badgeBounds()` clamp call
  sites, all 11 behavior and 4 screenshot cases, and 8 implementation
  anomalies.
- The behavior-test count is 11, not the 10 this record first claimed. The
  original count came from a `grep -A1 '@Test'`, which silently skipped
  `badgeBox_shortContent_position` because it carries a second annotation
  between `@Test` and its `fun`. Counting `@Test` directly found the eleventh.
- The two unread generated roles are recorded rather than smoothed over, and
  neither contradicts the code: `LargeColor` repeats `Color`'s `Error`, and
  `LargeLabelTextColor` is the `OnError` that `contentColorFor(Error)` already
  resolves. This is the opposite of the `Tabs` case T42 corrected, where the
  unread role's value was wrong.
- Six further anomalies are recorded. `badgeBox_shortContent_position` and
  `badgeBox_longContent_position` were diffed and are assertion-identical, so
  the long-content case adds no coverage over the short one despite existing to
  exercise a wider badge. Both fold `BadgeWithContentHorizontalPadding` into
  their expected left edge, which the placement code never adds — the
  expectation holds only because the queried `onSibling()` node is the badge's
  content rather than its container. `badgeBox_shortContent_position` is
  suppressed above SDK 34 for b/384973010. `BadgeTokens.kt` is generator version
  `v0_103`, the oldest generated file any ledger in this library pins.
- The drawer separation is source-verified rather than asserted. A sweep of the
  pinned `commonMain` for the word `badge` returns exactly seven files:
  `Badge.kt` (70 hits), `NavigationDrawer.kt` (21),
  `NavigationDrawerTokens.kt` (2), `NavigationItem.kt` (2), `Tab.kt` (1),
  `NavigationRail.kt` (1), and `NavigationBar.kt` (1). The five
  `Modifier.badgeBounds()` sites expose no badge parameter; only
  `NavigationDrawerItem` does, and its parameter is end-side text colored by the
  item's own text colors.
- The drawer's token correction is measured, not argued. In Chromium the
  selected drawer badge paints `rgb(74, 68, 88)` — `onSecondaryContainer` — and
  the unselected one `rgb(73, 69, 79)` — `onSurfaceVariant`. The unread
  `LargeBadgeLabelColor` is `onSurfaceVariant`, so registering it would have
  been wrong for every selected item. Both badges sit 24px from the item's end
  edge, which is the item's own `padding-inline-end`.
- `NavigationDrawer.conformance.md` now records the `badge` parameter and the
  two unread roles. It had mentioned neither while the inventory entry was
  conformant — the same class of silent gap T42 found in `Tabs`.
- The focused Badge suite passes 49 tests across behavior, accessibility, CSS,
  theme, SSR/hydration, and the source ledger. `tsc --noEmit` passes, so every
  `@ts-expect-error` is load-bearing. Two candidate type cases were removed
  after proving non-load-bearing rather than left in place: `HTMLSpanElement`
  declares no members beyond `HTMLElement`, so no element ref can be rejected
  for a span, and `ReactNode` admits `boolean`, so a boolean badge is valid.
- The token registry adds 9 Badge properties and emits 1,702 overall. Light,
  dark, nested custom scopes, and token-only output pass their gates.
- `npm run verify` passes all 13 gates: 37 conformant inventory entries, 37
  documentation pages, both packed consumer fixtures, and the site check at 36
  demos.
- The required real-Chromium audit passes after a production package and
  playground build, with new Badge probes measuring both variants' geometry,
  full rounding, painted container, label clipping, and the anchor placement in
  both writing modes. No allowlist was changed.
- The probe was proven non-vacuous in both directions. It measures 7 rendered
  badges: two 6.0x6.0 dots and five 16.0px-tall pills growing 16.0 → 21.3 →
  28.2 → 34.8px across `3`, `12`, `99+`, and `999+` — the last matching the
  specification's 34dp maximum-character width — all painting `rgb(179, 38, 30)`
  on `rgb(255, 255, 255)` at a `9999px` radius, which is `error`/`onError` fully
  rounded. Every anchored badge measures exactly the source's offsets: 6.0px
  from the trailing edge and 6.0px below the top for a dot, 12.0px and 14.0px
  for a pill. Seeding a 4px large-badge offset into the built stylesheet makes
  the audit fail with "large badge sits 4.0px from the trailing edge, not
  12px"; seeding a 10px dot fails with three findings including "small badge
  escapes the icon bounding box it should sit inside". The restored build
  passes.
- The audit gained a specimen census, which this task's own mistake motivated.
  The Badge example first shipped `<Icon name>` instead of `<Icon source>`;
  `Icon` rendered an undefined element, React unmounted the whole playground,
  and the audit reported a clean pass over a blank page. Every probe reports
  "no defects" when it finds nothing, so the gate now fails when any probed
  family has zero specimens. Breaking the playground deliberately makes it fail with "The
  playground rendered no .m3e-chip, .m3e-list-item, .m3e-slider, .m3e-divider,
  .m3e-badge"; the restored build passes.
- A post-completion root-cause review (2026-07-24) corrected the record above
  and closed the static half of the same hole. The first analysis claimed
  TypeScript accepted `<Icon name>` because `name` is a valid HTML attribute;
  that is false — reseeding the typo produces `TS2322: Property 'name' does
  not exist on IconProps`. It shipped because no gate typechecks the
  playground: the root `typecheck` includes only `src/` and the
  `tests/**/*.types.tsx` assertions, `playground/tsconfig.json` was wired to
  nothing, and Vite transpiles without checking. `npm run verify` now runs
  `typecheck:playground` (`tsc --noEmit -p playground`) as a fourteenth gate,
  placed after the builds because the examples resolve the package's built
  declarations, and proven in both directions: the seeded typo fails it with
  the TS2322 above, and the restored tree passes all 14 gates. The runtime
  census remains the second, independent layer — it catches whatever renders
  wrong without failing to compile.
- The declaration-closure ceiling rises from 91,300 to 93,000 bytes with owner
  approval, recorded in ADR 0035, and `measuredForTask` moves from T39 to T43.
  The closure measures 92,018 bytes; the previous ceiling was set when the
  package had 34 components rather than 37, and the overage is TSDoc that
  TypeScript copies into the declaration file. Comments were trimmed once first,
  recovering about 600 bytes. No other baseline moved: 374,494-byte JavaScript
  closure (65,284 gzip), 435,850-byte full CSS (47,357 gzip), 128,612-byte token
  CSS (11,274 gzip), a 375,928-byte packed package, and the declaration
  closure's own 21,158 gzip against an unchanged 21,300 limit.
- `NavigationSuite` needed no change of its own: it forwards `items` wholesale,
  so the shared `NavigationItem` field reaches it for free. The expected-files
  list above named it and `src/tokens/defaults/navigation-drawer.ts`; the latter
  changed only its provenance comment, since the drawer badge correctly
  registers no token. `scripts/fetch-symbols-font.mjs` output was regenerated
  rather than hand-edited, adding the `list`, `report`, and `school` glyphs the
  new example renders.
- Publication remains outside T43. The working package stays `1.1.0`; a version
  and registry action require a separately approved release task.

## T44 — Primitive-family source refresh

Status: complete
Approved: 2026-07-24 (owner request: close the roadmap's primitive tranche before
moving to composites)
Completed: 2026-07-24

### Scope

The [Material catalog parity roadmap](MATERIAL_CATALOG_ROADMAP.md) leaves one item
in tranche P: the primitive-family source refresh. Every primitive family already
has conformant coverage — Divider (T42) and Badges (T43) closed the last two
implementation gaps — so this task adds and changes no component. It brings the
fifteen primitive families onto one verified-current, comparable source snapshot so
the tranche can be formally closed.

The pins are recent, not stale. Every primitive conformance record was authored in
a five-day window, 2026-07-19 to 2026-07-24, and Button's T07 ledger already
records the current Expressive size ladder (32/40/56/96/136px) and round/square
resting and pressed shapes. The task-number order (T07–T14) reflects build order,
not source age. The pinned revisions cluster into three:

- four one-off revisions accessed 2026-07-19 for the T07–T10 families —
  `dd849e20…` (Button), `f0793303…` (IconButton), `b0ef6d36…`
  (FloatingActionButton), and `0be207d9…` (Card);
- the dominant `225f50d4…`, accessed 2026-07-19 to 07-23, shared by Checkbox,
  Radio, Switch, TextField/TextArea, Slider, Chip, the three progress indicators,
  and LoadingIndicator;
- the newest `a90df2fc…`, accessed 2026-07-24, shared by Divider, Badge, and
  ListItem, and adopted here as the reference snapshot.

For each of the fifteen primitive families — Badges, Buttons, Cards, Checkbox,
Chips, Divider, Extended FABs, Floating action buttons, Icon buttons, Loading
indicator, Progress indicators, Radio button, Sliders, Switch, and Text fields —
fetch the pinned-revision source, token, and test files and the same files at the
reference snapshot and at upstream `androidx-main`, diff them, and record one
verdict per family:

- **identical** — the pinned files are substantively unchanged at the reference
  snapshot and at HEAD. Re-pin the family to the reference revision so every
  primitive ledger describes one snapshot, following the precedent the Divider and
  ListItem ledgers already set ("must describe one upstream snapshot to stay
  comparable").
- **delta** — upstream added or changed a variant, token, state, slot, or test.
  Record and classify the delta per the roadmap's family-task completeness
  contract. A substantive new-variant reconciliation is a tranche-A concern, not a
  refresh: it is recorded and spun into its own approved feature task, so a refresh
  never smuggles feature work past the one-task discipline. Given the pins are days
  old, the expected delta is near zero.

The rendered Material catalog index was already refreshed on 2026-07-24 in the
roadmap, so the snapshot-currency half of the tranche-close discipline is done;
this task completes the source-currency half.

### Expected files

- The primitive conformance records under `tests/components/*/`: refreshed access
  date and, where re-pinned, the unified revision and a recorded diff verdict.
- The pinned-source ledgers that assert a revision —
  `tests/components/{Badge,Chip,Divider,Slider}/*.source.test.ts` — and the
  `source.revision` fields in the affected `src/tokens/defaults/*.ts`.
- `docs/MATERIAL_CATALOG_ROADMAP.md`: mark the tranche-P source-refresh line done.
- `docs/adr/0036-*.md`: record the revision-unification decision.
- `docs/SPEC.md`: append the T44 row.
- No file under `src/` changes its component logic. If a real upstream delta forces
  a public export, prop, or token change, that change is deferred to its own
  approved task with its own ADR rather than made here.

### Acceptance checks

- `npm run verify` passes all fourteen gates.
- Every primitive conformance record cites a revision verified current against
  upstream at an access date of 2026-07-24 or later.
- Each of the fifteen families has a recorded diff verdict — identical (re-pinned)
  or delta (classified), with any substantive delta named and deferred to a
  follow-up task.
- `docs/MATERIAL_CATALOG_ROADMAP.md` no longer lists an open source-refresh item in
  tranche P.

### Completion evidence

- The refresh was executed as a real upstream diff, not an assertion. Both
  AndroidX mirrors were reachable, so for every primitive family the pinned
  source, token, and test files were fetched at the family's pinned revision, at
  the reference snapshot `a90df2fc27e026b9ad2ed569f203a260c1041fab`, and at
  `androidx-main` HEAD, and compared byte-for-byte. For every primitive file
  examined the reference snapshot equals HEAD, so the whole tranche is verified
  current — nothing has drifted upstream since the July pins.
- The five-day access window (2026-07-19 to 07-24) turned out to be our access
  window, not the commit-time spread, so the pinned revisions were genuinely
  compared rather than assumed identical. Eleven components came back
  byte-identical;
  four differ only non-substantively; one — Button — looked large (536 diff
  lines) but resolved to an experimental→stable graduation once inspected.
- **Eleven byte-identical components re-pinned to the reference snapshot:** Card,
  IconButton, Checkbox, Radio, Switch, TextField, TextArea, Chip, LinearProgress,
  CircularProgress, and WavyProgress. Their `src/tokens/defaults/*.ts`
  registrations (ten — TextArea shares TextField's) and the
  `tests/tokens/schema.test.ts` ledger move to
  `a90df2fc…` with access date 2026-07-24, and Chip's source and theme tests
  (which assert the registration revision) move with them. Because the content is
  identical, every frozen git blob identity — including Chip's per-file hashes —
  is unchanged; only the revision label and access date moved. Badge and Divider
  already pin the reference snapshot and were re-verified against HEAD.
- **Four non-substantive deltas retained with the delta classified:**
  - **Button** (`dd849e20…`): `@ExperimentalMaterial3ExpressiveApi` removed from
    members this port already ships as stable — the Expressive size ladder
    (32/40/56/96/136px) and round/square resting and pressed shapes — plus
    internal `contentPaddingFor`/`shadowElevation` refactors. No variant, token,
    state, or behavior changed.
  - **FloatingActionButton** (`b0ef6d36…`): the same experimental→stable
    graduation (`MediumIconSize`) and an internal shadow-inset precision refactor
    (`16.dp.toPx()` to `.toInt().toFloat()`).
  - **Slider** (`225f50d4…`): a binary-compatibility refactor — the previous
    `RangeSlider` preserved as a hidden-deprecated `RangeSliderLegacy` beside a
    new `RangeSlider` overload with the same `value`/`valueRange`/`steps`/`colors`
    contract, and `startInteractionSource`/`endInteractionSource` renamed to their
    `…ThumbInteractionSource` forms. Kotlin ABI shims with no web equivalent;
    `SliderTokens` is byte-identical.
  - **LoadingIndicator** (`225f50d4…`): five added `@material3expressive` KDoc
    tags only, no code change; `LoadingIndicatorTokens` is byte-identical.
  Each pin is retained because re-pinning would rewrite an immutable blob identity
  for a change a web port cannot observe. None is a substantive new-variant
  reconciliation, so none spun off a follow-up task; a substantive delta, had one
  been found, would have been deferred to its own approved feature task per the
  scope, and deep new-variant reconciliation remains a tranche-A concern.
- Unification is partial by design — thirteen primitive components on the
  reference snapshot, four retained — which ADR 0036 records, along with the
  reference-snapshot choice and the per-family verdicts. The comparability the
  Divider/ListItem precedent protects matters only where families share an
  upstream file, and the four retained families share none of their pinned files
  with the re-pinned set.
- Each of the seventeen primitive conformance records gained a dated
  "Source refresh (T44)" section recording its verdict; the historical audit
  prose was left intact, since it accurately describes the original access.
  `docs/MATERIAL_CATALOG_ROADMAP.md` marks tranche P complete,
  `docs/SPEC.md` gains the T44 row, and no `src/` component logic, public export,
  prop, token value, or CSS changed — the only `dist` delta is the exported
  provenance metadata itself, and the revision and date strings are same-length,
  so every bundle budget is unchanged.
- `npm run verify` passes all fourteen gates (1,195 tests; 1,702 generated
  custom properties; 37 conformant components; 375,729-byte packed tarball; site
  and consumer fixtures build).

## T45 — Material 3 Bottom sheet family

Status: complete
Approved: 2026-07-24 (owner request: open the roadmap's composite tranche,
starting with Bottom sheets)
Completed: 2026-07-24

### Scope

The [Material catalog parity roadmap](MATERIAL_CATALOG_ROADMAP.md) closed tranche
P in T44 and gates tranche C behind it. This is the first composite: catalog row
3, Bottom sheets, currently Planned with no coverage.

The pinned source is `a90df2fc27e026b9ad2ed569f203a260c1041fab` — the reference
snapshot T44 adopted. This is not an assumption: all eleven upstream sheet files
were fetched at that revision and at `androidx-main` HEAD
(`0f056f78299610de8a8dc1511671519aab75657d`, 2026-07-23) and are byte-identical,
so the family joins the unified snapshot rather than fragmenting it. The
executable ledger covers `BottomSheet.kt`, `BottomSheetScaffold.kt`,
`ModalBottomSheet.kt`, `SheetDefaults.kt`, generated `SheetBottomTokens.kt`, and
the six pinned test files — `BottomSheetTest.kt` (11),
`BottomSheetScaffoldTest.kt` (33), `ModalBottomSheetTest.kt` (17),
`ModalBottomSheetDialogTest.kt` (5), `ModalBottomSheetScreenshotTest.kt` (5), and
`SheetStateTest.kt` (14), 85 cases in total.

Upstream splits the family across three public composables. `BottomSheet` is the
surface and gesture behavior rendered inline; `ModalBottomSheet` wraps it in a
platform dialog window with a scrim; `BottomSheetScaffold` is an app-shell layout
that owns `topBar`, `snackbarHost`, and `content(PaddingValues)` and docks a
peek-height sheet beneath them. Five translation decisions carry the design, all
recorded in ADR 0037:

- One public `BottomSheet` with `variant="modal" | "standard"` collapses the two
  sheet composables, following the one-component-per-variant rule
  `NavigationDrawer` established for exactly this modal/permanent split rather
  than the one-component-per-axis rule ADR 0031 set for `VerticalSlider`.
- `BottomSheetScaffold`'s *scaffold* is excluded as an export and delivered as a
  documented recipe. Its `topBar`/`snackbarHost`/`content` slots are app-shell
  composition that public components already compose with no hidden behavior,
  which the roadmap's completeness contract names as the recipe case. Its
  *sheet* behavior is not excluded: `peekHeight` is what `variant="standard"`
  anchors on.
- Modal renders a native `<dialog>` driven by `showModal()`, reusing the
  technique ADR 0016 established for `Dialog` — backdrop, focus trap, inert
  background, and focus restoration are native, and `::backdrop` paints the
  scrim. It duplicates that small lifecycle rather than sharing it, the same
  call `NavigationDrawer` made and for the same reason.
- The three `SheetValue`s become a `value`/`defaultValue`/`onValueChange` triple
  over `'hidden' | 'partiallyExpanded' | 'expanded'`, this library's universal
  `useControllableState` shape. The partial anchor is source-exact and differs by
  variant, as upstream's does: modal shows `min(50%, content)` of its container,
  standard shows `peekHeight` (56px).
- The drag handle is a real `<button>`, so the M3 accessibility page's keyboard
  contract — Tab reaches the handle, Space/Enter cycles the available heights —
  is native rather than reconstructed, and it carries the source's own click
  cycle and `dismiss`/`expand`/`collapse` action labels.

Dragging is handle-only, using the pointer-capture session `Slider` established,
with the source's `PositionalThreshold` (56dp) and `VelocityThreshold` (125dp)
deciding the settle target. Upstream additionally drags the whole surface through
a nested-scroll connection that steals scroll from sheet content; that is
deliberately not ported, because the M3 accessibility page requires a
single-pointer alternative to any drag regardless, and a handle-only drag does
not have to arbitrate against a scrollable content area.

Excluded with reasons: predictive back and its five screenshot cases (an Android
system-gesture concept with no web equivalent), `securePolicy` (an Android window
flag), `verticalScaleUp`/`verticalScaleDown` (artifacts of Compose spring
overshoot, which CSS transitions do not produce), and the deprecated
`rememberModalBottomSheetState`/`rememberStandardBottomSheetState`/hidden `Saver`
and constructor overloads (Kotlin binary-compatibility shims, the same class T44
classified for `RangeSliderLegacy`). `standardWindowInsets` is not excluded but
adapted: `safeDrawing.only(Bottom)` becomes `env(safe-area-inset-bottom)`, a
genuine web equivalent.

No runtime dependency, peer dependency, or package export-path change. No token
is removed or renamed. Publication is a separate task.

### Expected files

- Added: `src/components/BottomSheet/BottomSheet.tsx`,
  `src/components/BottomSheet/BottomSheet.types.ts`,
  `src/components/BottomSheet/BottomSheet.css`,
  `src/components/BottomSheet/index.ts`,
  `src/tokens/defaults/bottom-sheet.ts`, `docs/components/BottomSheet.md`,
  `playground/examples/BottomSheet.example.tsx`, the mirrored
  `tests/components/BottomSheet/*` suite and conformance record, and ADR 0037.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `docs/component-inventory.json`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/TOKEN_PROVENANCE.md`,
  `docs/MATERIAL_CATALOG_ROADMAP.md`, `docs/ACTIVE_TASK.md`,
  `tests/tokens/schema.test.ts`, `tests/tokens/css.test.ts`,
  `scripts/check-release.mjs`, `package.json`, `site/content/site.ts`,
  `playground/src/main.tsx`, `playground/src/playground.css`.
- Generated: `docs/SUPPORTED_COMPONENTS.md`, `site/demos/registry.tsx`.

### Acceptance checks

- The executable ledger freezes all eleven pinned blob identities, the nine
  generated `SheetBottomTokens` declarations partitioned 7 read / 2 unread, the
  current and deprecated source entries, all 85 pinned test cases, and every
  recorded exclusion with its reason.
- Both variants render their sourced output across all three states; the modal
  variant opens through `showModal()` and dismisses on Escape and scrim click,
  and the standard variant does neither.
- The drag handle is a button carrying the source's click cycle and action
  labels; Space/Enter and pointer drag reach the same states, and the positional
  and velocity thresholds settle to the sourced target.
- TypeScript rejects an open variant, an open state, a mismatched ref, and a
  `peekHeight` on the modal variant.
- Light/dark, scoped token overrides, RTL, forced colors, reduced motion, SSR,
  hydration, public exports, inventory, documentation, example, and packed
  consumers agree.
- `npm run verify` passes.
- Because this task adds component geometry:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes without an unexplained allowlist addition.

### Completion evidence

- `BottomSheet` is a public named export with `variant`, `value`/`defaultValue`/
  `onValueChange`, `confirmValueChange`, `peekHeight`, `dragHandle`,
  `gesturesEnabled`, `dismissOnEscape`, and `dismissOnScrimClick`. The package
  still has zero runtime dependencies, React/React DOM remain its only peers,
  and no export path, prop, or token was removed or renamed.
- The pin was verified rather than assumed. All eleven upstream sheet files were
  fetched at `a90df2fc…` and at `androidx-main` HEAD
  (`0f056f78299610de8a8dc1511671519aab75657d`, committed 2026-07-23) and hashed:
  every one is byte-identical, so the family extends T44's unified reference
  snapshot instead of opening a second one.
- `BottomSheet.source.test.ts` freezes the eleven pinned blob identities, the
  nine generated declarations partitioned 7 read / 2 unread, 86 current and 7
  deprecated source entries, all 85 pinned test cases, six exclusions, and five
  native-web adaptations.
- The scope's test-case count was wrong when the task was approved and was
  corrected during execution. The initial survey reported 78 cases; extracting
  `@Test` methods directly from the six pinned files gives 85 — `BottomSheetTest`
  11 (not 9), `BottomSheetScaffoldTest` 33 (not 31), `ModalBottomSheetTest` 17
  (not 16), and `ModalBottomSheetDialogTest` 5 (not 3). The ledger and the
  acceptance check now assert the extracted number.
- The seven-file suite passes 90 tests across behavior, drag, accessibility,
  CSS, theme, SSR/hydration, and the source ledger. Twelve compile-only type
  cases reject an open variant, an open state, a `peekHeight` on either spelling
  of the modal variant, a non-boolean `dragHandle`, a CSS-length peek height, a
  state-returning `confirmValueChange`, and an event-shaped `onValueChange`;
  `tsc --noEmit` passes, so every `@ts-expect-error` is load-bearing. The root
  ref is asserted positively rather than as a rejection, because the root is a
  `<dialog>` or a `<div>` by variant and no single element type is correct for
  both.
- Three defects were found and fixed during execution rather than shipped:
  - **The top corners never rounded.** `CornerExtraLargeTop` is a four-value
    `border-radius` shorthand (`28px 28px 0px 0px`), which is invalid in the
    per-corner longhand the first draft used, so the declaration was dropped and
    the sheet rendered square. Only the browser audit could see this; the fix
    consumes the token through the shorthand, as `TextField` already does for
    `CornerExtraSmallTop`, and a CSS test now forbids the longhand form.
  - **Every controlled sheet was warned for a mistake it had not made.**
    `defaultValue` carried a destructuring default, so it was never `undefined`
    and the "use either value or defaultValue" check fired on all controlled
    usage. The default moved to the `useControllableState` call and two tests
    pin both directions.
  - **The drag offset never resolved.** It was written as a `--m3e-comp-*`
    custom property with no token definition; the CSS gate caught it. It is a
    runtime measurement rather than a design value, so it is now a local
    `--m3e-bottom-sheet-drag-offset` with a resting default, matching the
    convention the other components use for non-token variables.
- The rendering audit gained a Bottom Sheet probe measuring the 48px handle
  target, the sourced 32x4 bar and its centring, the 28px top corners with
  square bottom corners, the 640px cap, a painted container, and whether a
  standard sheet at peek height actually clips and stays inside its container.
  The probe proved itself non-vacuous by catching the corner defect above on its
  first run. `.m3e-bottom-sheet` joins the census that fails the audit if the
  playground renders none of a probed family.
- The audit's existing probes were corrected in the same pass. They measured
  every matching element including those inside a closed `<dialog>`, which is a
  `display: none` subtree where everything reads zero; this family is the first
  to put audited components inside one, and it produced six false findings. The
  six geometry loops now skip elements that generate no boxes at all, which was
  proven not to blunt them: seeding a zero-height rule into the built stylesheet
  still fails the audit on four visible dividers, and removing it restores green.
- The playground example's docked container no longer sets `overflow: hidden`,
  which the audit correctly reported as cutting the sheet's elevation shadow.
  The sheet clips its own content in the peek and hidden states, so the wrapper
  added nothing but the clip. No allowlist entry was added.
- The token registry adds 13 Bottom Sheet properties and emits 1,715 overall,
  seven of them from generated roles the source resolves. Both unread roles are
  recorded in the ledger, ADR 0037, and the conformance record rather than
  silently dropped, and `drag-handle-shape` registers the source's
  `MaterialTheme.shapes.extraLarge` rather than the pill it visually clamps to.
- `npm run verify` passes all 14 gates: 202 test files / 1,285 tests, 38
  conformant inventory entries, 38 documentation pages, 41 stylesheets, both
  packed consumer fixtures, and the site check at 37 demos.
- Only the declaration-closure ceiling was raised, and with a recorded decision:
  95,381 bytes measured against a 93,000 ceiling, about 2.5% over, essentially
  this component's own declarations and their consumer-facing documentation.
  Its baseline is rebased and its ceiling raised to 109,000/24,800 preserving
  the headroom ratio that artifact already encoded. The four passing
  artifacts — JavaScript closure, both stylesheets, and the packed package —
  keep their existing ceilings, unlike ADR 0031, which rebased everything.
- The required real-Chromium audit passes after a production package and
  playground build, with no allowlist change.
- Publication remains outside T45. The working package stays `1.1.0`; a version
  and registry action require a separately approved release task.

## T46 — Material 3 App bar family (top app bars)

Status: complete
Approved: 2026-07-24 (owner request: continue the composite tranche with App
bars; scope amendments — Partial landing, deferred overflow DSL — reviewed and
approved in discussion)
Completed: 2026-07-24

### Scope

Catalog row 1, App bars, currently Planned with no coverage. This task ports the
top app bar family; the row lands **Partial**, not Conformant, and that is the
honest status by design rather than a shortfall (see the boundary below).

The pinned source is `a90df2fc27e026b9ad2ed569f203a260c1041fab`, the reference
snapshot T44 adopted and T45 extended. Verified, not assumed: all eighteen
app-bar files — `AppBar.kt`, `AppBarRow.kt`, `AppBarColumn.kt`, `AppBarDsl.kt`,
the seven token files (`AppBarTokens`, `AppBarSmallTokens`, `AppBarMediumTokens`,
`AppBarMediumFlexibleTokens`, `AppBarLargeTokens`, `AppBarLargeFlexibleTokens`,
`BottomAppBarTokens`) plus `DockedToolbarTokens`, and the six pinned test files —
were fetched at that revision and at `androidx-main` HEAD
(`477f94858de4569261d2ba58329e928d2683b7eb`, committed 2026-07-24) and are
byte-identical, so the family joins the unified snapshot. The executable ledger
covers the six pinned test files: `AppBarTest.kt` (105),
`AppBarScreenshotTest.kt` (26), `AppBarRowTest.kt` (8),
`AppBarRowScreenshotTest.kt` (3), `AppBarColumnTest.kt` (8), and
`AppBarColumnScreenshotTest.kt` (3), 153 cases in total, each counted by
extracting `@Test` methods from the fetched files.

The family boundary follows the current official catalog, not the source file:

- **In scope — the six top-bar composables.** One public `AppBar` collapses
  `TopAppBar`, `CenterAlignedTopAppBar`, `MediumTopAppBar`,
  `MediumFlexibleTopAppBar`, `LargeTopAppBar`, and `LargeFlexibleTopAppBar`
  through `size`, `flexible`, `titleAlignment`, and `subtitle` props. The source
  itself collapses these — center-aligned is the small bar with a centered
  title (the current design index merged the specimen away), and every two-row
  variant delegates to one `TwoRowsTopAppBar` — and baseline-versus-flexible is
  a token-family axis (Large is 152px/headline-medium where Large flexible is
  120px/display-small), so it is a prop, not parallel exports. Baseline Medium
  and Large ship: upstream keeps them stable, and the design site's
  "not recommended" note is recorded in documentation, not spent as an
  exclusion.
- **Deferred to row 35 (Toolbars): `BottomAppBar` and `FlexibleBottomAppBar`.**
  They live in the same pinned `AppBar.kt`, but the current design index no
  longer files them under App bars — the bottom app bar is documented under
  Toolbars as "no longer recommended... replaced with the docked toolbar", and
  `FlexibleBottomAppBar` already reads `DockedToolbarTokens` for its geometry.
  Row 35 is where that reconciliation already lives. This is the first time one
  row's pinned file carries another row's components; the ledger accounts for
  them and ADR 0038 records the split.
- **Deferred to row 25 (Search): `AppBarWithSearch`.** The design site lists a
  "Search app bar" specimen under App bars, but its source is `SearchBar.kt` —
  a separate file that borrows `AppBarTokens` colors without composing any top
  app bar — and the guidelines' own rule is "don't transform app bars into a
  search app bar."
- **Deferred to a named follow-up: the overflow-action system**
  (`AppBarRow`/`AppBarColumn`/`AppBarDsl` and their 22 pinned tests). The
  guidelines document trailing actions collapsing into an overflow menu as
  family behavior, and auto-overflow is behavior-owning — it measures available
  width and relocates items into a menu, which a recipe composed from `Menu`
  and `IconButton` cannot express. Per the completeness contract that makes it
  an API, not a recipe, so the row stays Partial until it is reconciled. This
  is the `Lists` pattern, not the `BottomSheetScaffold` pattern.

The genuinely new machinery is scroll coupling. Compose drives the bar through a
nested-scroll connection with no web analog, so a new internal primitive
observes a scroll container (window by default, an element ref opt-in) and
produces exactly three outputs: a scrolled flag, a collapse fraction, and an
enter-always offset. `position: sticky` supplies pinning natively. The sourced
behaviors map as: `pinned` — sticky, container color swaps through the sourced
on-scroll role on any overlap; `enterAlways` — the bar translates away tracking
scroll deltas and returns immediately on scroll-up, with an idle snap to fully
shown or hidden replacing the source's fling-settle; `exitUntilCollapsed` — the
two-row bar's expanded row shrinks with a collapse fraction derived
deterministically from scroll position, which also gives the source's
"stay collapsed until scrolled back to the top" for free. Single-row bars snap
their container color (the source animates a binary swap at 0.01 overlap);
two-row bars blend it continuously with the fraction, painted as a scrolled
color overlay whose opacity is the fraction — alpha-compositing an opaque color
is exactly the source's lerp. The two-row title crossfade carries the source's
`TopTitleAlphaEasing` cubic-bezier(.8, 0, .8, .15), evaluated in the primitive,
and the accessibility semantics swap between the two title rows crosses at
fraction 0.5, exactly as the source hides one row's semantics from the other.

Accessibility decisions, recorded in ADR 0038: the root is a `<header>`
(`banner` in context); the title is a slot, not an automatic heading, following
the specification's rule that typography roles never determine document
structure; and because the accessibility page requires "maintain access to app
bar actions when content is scrolled", an enter-always bar reveals itself when
focus lands inside it. The collapse fraction gets no controlled prop — it is a
scroll-derived measurement, like T45's drag offset, not enumerable state; a
documented deviation from the controlled/uncontrolled rule.

Excluded with reasons: the bar-drag gesture (dragging the bar itself to resize —
a touch affordance the web reserves for scrolling; the scroll coupling is the
port), fling settle (`settleAppBar`, velocity-based — replaced by the idle
snap), the touch-exploration auto-disable (TalkBack detection is an Android
service query; the web equivalent is the focus-reveal above), `contentPadding`
(defaults to zero and exists for Compose inset composition), and the deprecated
hidden overloads plus per-variant `*TopAppBarColors` factories (compat shims,
the T44 class).

No runtime dependency, peer dependency, or package export-path change. No token
is removed or renamed. Publication is a separate task.

### Expected files

- Added: `src/components/AppBar/AppBar.tsx`, `src/components/AppBar/AppBar.types.ts`,
  `src/components/AppBar/AppBar.css`, `src/components/AppBar/index.ts`,
  `src/internal/useAppBarScroll.ts`, `src/tokens/defaults/app-bar.ts`,
  `docs/components/AppBar.md`, `playground/examples/AppBar.example.tsx`, the
  mirrored `tests/components/AppBar/*` suite and conformance record, and ADR
  0038.
- Modified: `src/components/index.ts`, `src/styles/styles.css`,
  `src/tokens/defaults/index.ts`, `docs/component-inventory.json`,
  `docs/SPEC.md`, `docs/ARCHITECTURE.md`, `docs/TOKEN_PROVENANCE.md`,
  `docs/MATERIAL_CATALOG_ROADMAP.md` (row 1 to Partial with named remainder;
  row 35 gains the bottom-bar/docked-toolbar item), `docs/ACTIVE_TASK.md`,
  `tests/tokens/schema.test.ts`, `tests/tokens/css.test.ts`,
  `scripts/check-release.mjs`, `scripts/audit-rendering.mjs` (a probe that
  scrolls), `package.json`, `site/content/site.ts`, `playground/src/main.tsx`,
  `playground/src/playground.css`.
- Generated: `docs/SUPPORTED_COMPONENTS.md`, `site/demos/registry.tsx`.

### Acceptance checks

- The executable ledger freezes all eighteen pinned blob identities; partitions
  the 29 declarations across `AppBarTokens` (6 read by top bars, 1 read only by
  the deferred bottom bar, 7 unread) and the five tier files (all 15 read);
  accounts for every current and deprecated source entry including the
  deferred-elsewhere composables; freezes all 153 pinned test cases; and
  records every exclusion and disposition with its reason.
- All six variant combinations render their sourced geometry and typography:
  64px small (title-large), 112px medium (headline-small), 112/136px medium
  flexible (headline-medium, label-large subtitle), 152px large
  (headline-medium), 120/152px large flexible (display-small, title-medium
  subtitle), collapsed rows at 64px small typography.
- The three scroll behaviors produce their sourced outcomes in jsdom-simulated
  scroll tests: pinned swaps the container color both ways; enter-always hides,
  reveals on scroll-up, snaps at idle, and reveals on focus-within; exit-until-
  collapsed tracks the fraction, crossfades the titles through the sourced
  easing, and swaps title semantics at 0.5.
- TypeScript rejects `flexible` on a small bar, `subtitle` and `titleAlignment`
  on baseline medium/large, an open size, an open scroll behavior, and a
  mismatched ref.
- Light/dark, scoped token overrides, RTL, forced colors, reduced motion, SSR,
  hydration, public exports, inventory, documentation, example, and packed
  consumers agree.
- `npm run verify` passes.
- Because this task adds component geometry and scroll-driven rendering:

  ```bash
  npm run build && npm run playground:build
  M3E_CHROMIUM_PATH=<chromium binary> npm run audit:rendering
  ```

  passes with a new probe that actually scrolls the page — asserting the
  pinned color swap, the collapse fraction, sticky pinning, and the sourced
  heights — and the probe is proven non-vacuous.

### Completion evidence

- `AppBar` is a public named export with `size`, `flexible`, `titleAlignment`,
  `subtitle`, `navigationIcon`, `actions`, `scrollBehavior`, and
  `scrollContainer`. The package still has zero runtime dependencies,
  React/React DOM remain its only peers, and no export path, prop, or token was
  removed or renamed.
- The pin was verified rather than assumed: all eighteen upstream app-bar files
  hash identically at `a90df2fc…` and at `androidx-main` HEAD
  (`477f94858de4569261d2ba58329e928d2683b7eb`, 2026-07-24), extending the
  unified snapshot for a third consecutive task. Every one of the 153 pinned
  test cases was counted by extracting `@Test` methods from the fetched files.
- `AppBar.source.test.ts` freezes the eighteen blob identities; partitions
  `AppBarTokens` 6 read / 1 bottom-bar-read / 7 unread and the five tier files
  15/15 read; accounts for 121 in-scope current entries at parameter
  granularity, 16 dispositioned entries at composable granularity (7 to the
  Toolbars row, 9 to the overflow follow-up), and 10 deprecated entries; and
  freezes the 153 test cases partitioned 92/13/19/7/22 by disposition, plus six
  exclusions, five native-web adaptations, and five recorded anomalies —
  including `LeadingSpace`/`TrailingSpace` being shadowed by the hand-tuned
  4dp constant the code actually reads.
- The nine-file suite passes 76 focused tests across behavior, scroll coupling,
  accessibility, CSS, theme, SSR/hydration, and the ledger. The scroll suite
  drives jsdom scroll events through all three behaviors: the pinned swap both
  ways, enter-always hide/reveal/idle-snap/focus-reveal with fake timers, and
  exit-until-collapsed fraction math against the sourced ranges, the sourced
  easing curve (asserted equal to the primitive's own evaluation and below the
  diagonal), and the 0.5 semantics swap in both directions. Eleven compile-only
  type cases reject `flexible` on small, `subtitle`/`titleAlignment` on
  baseline two-row bars, `exitUntilCollapsed` on a single-row bar, open unions,
  children, a missing title, and an element where a ref is required.
- Two defects were found and fixed during execution rather than shipped:
  - **Every baseline medium/large bar was warned for a prop it never passed.**
    `titleAlignment` carried a destructuring default, so the invalid-prop check
    could never see "not given" — the same trap T45's completion evidence
    documents for `defaultValue`, now caught by the no-warning-for-valid-combos
    test instead of by a consumer.
  - **The scroll primitive dirtied resting markup at mount.** Its initial
    application wrote fraction 0 and offset 0px inline even on a page at rest,
    which the hydration test surfaced as a server/client innerHTML divergence.
    A page at rest now writes nothing — the stylesheet's resting defaults
    already express that state — while a page restored mid-scroll still applies
    its position at mount.
- The rendering audit gained its first probe that scrolls: it drives the
  playground's two inner scroll panels and asserts the 64px row, sticky
  pinning against the scrollport top, the on-scroll color swap and its return,
  the 152px resting height, fraction 1 with a fully collapsed expanded row and
  the crossed semantics threshold after a deep scroll, the collapsed title at
  full opacity, and full restoration at the top. It reports its own vacuity if
  either coupled bar is missing. Proven non-vacuous in both directions: seeding
  a zero collapse range and a suppressed color swap into the built stylesheet
  produced exactly the two expected findings, and restoring returned green. The
  probe's first draft also caught its own timing naivety — the return-leg color
  check ran mid-transition — which is recorded here because the fix (waiting
  out the effects transition) is load-bearing for anyone extending the probe.
- The token registry adds 17 App bar properties and emits 1,732 overall. The
  two consequential unread roles are recorded in the ledger, the provenance
  document, and ADR 0038 rather than silently dropped.
- `npm run verify` passes all 14 gates: 209 test files / 1,361 tests, 39
  conformant inventory entries, 39 documentation pages, 42 stylesheets, both
  packed consumer fixtures, and the site check at 38 demos (the icon subset
  regenerated for the example's `arrow_back`).
- Three bundle ceilings were raised with a recorded decision, each breached
  marginally by real component code (JS closure +0.5%, its gzip +0.2%, packed
  +1.7%): their baselines rebased to measured T46 output and ceilings restored
  to the ~12% headroom each artifact already encoded, per ADR 0038. The
  declaration and both stylesheet ceilings keep their existing values —
  measured at 99,035/109,000, 450,798/464,700, and 130,443/139,300, all inside
  their prior budgets.
- Catalog row 1 lands **Partial by design**: the behavior-owning
  overflow-action system is named in the row's remaining work, the bottom bars
  are dispositioned to row 35 with the roadmap row updated in this task, and
  the search app bar is recorded as row 25's source. Snapshot accounting moves
  to 28 Conformant + 3 Partial + 5 Planned.
- Publication remains outside T46. The working package stays `1.1.0`; a version
  and registry action require a separately approved release task.
