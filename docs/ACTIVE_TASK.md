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

Status: active
Approved: 2026-07-22 (owner request: publish the fix to npm)

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

### Not done

- **The package is not published.** `npm publish`, and the `v1.0.2` tag that
  follows it, are the owner's to run: publication is effectively irreversible
  (npm's unpublish window is 72 hours and closes entirely once a dependent
  exists). The working tree is prepared and verified, nothing more.
- `npm whoami` returned 401 at audit time, so the publishing session will need
  `npm login` first.
- After publishing, the `1.0.2` readiness entry should record it. The release
  gate matches the substring `Registry publication: not performed`, so append
  to that line rather than replacing it — the `1.0.0` entry shows the pattern.
