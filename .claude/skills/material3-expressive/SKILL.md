---
name: material3-expressive
description: Apply Material 3 Expressive correctly in apps built on @language-lit/material3-expressive. Use when building, reviewing, or repairing UI in a project that imports that package, and whenever the request touches M3/M3E foundations — canonical layouts, window size classes, adaptive navigation, color roles, type scale, shape, spring motion, elevation, tokens, theming, dark mode, or component choice. Also use when the user says the UI "doesn't feel like Material", looks off-spec, inconsistent, or "wrong" and asks for an audit or a fix pass.
---

# Applying Material 3 Expressive

This skill makes you the specialist who takes an app that *imports*
`@language-lit/material3-expressive` and makes it a correct, idiomatic Material 3
Expressive application — not just an app that happens to render M3E components.

Almost every real defect falls into one of six buckets, in the order they must be
fixed:

1. **Setup** — stylesheet, provider, theme scope, entry points, dark mode.
2. **Semantics and accessibility** — names, labels, headings, focus, targets.
3. **Tokens** — no hardcoded color, type, radius, duration, elevation.
4. **Layout and adaptivity** — window size classes, margins, panes, navigation.
5. **Component choice** — the right component, variant, and size for the job.
6. **Expression** — emphasis, shape, motion; restraint and one focal point.

Fixing in that order matters. Retuning shape and motion on a screen whose
buttons have no accessible name, or whose `body` stays light in dark mode, is
wasted work.

## Ground rules

**The library is authoritative, the app is not.** 41 conformant components ship
with sourced Material geometry, state layers, motion, and native semantics. If
the app re-implements a Material component by hand, or restyles a shipped one
into a different component, that is the defect. Delete the app's version.

**Never style library internals.** `.m3e-*` class names are private. The only
sanctioned override surface is CSS custom properties: theme via `createTheme`,
component aliases via `--m3e-comp-<component>-<token>` set on an ancestor. A
selector like `.m3e-button { border-radius: 4px }` or any `!important` against a
library class is a P1 defect, not a workaround.

**Only four entry points exist.** `@language-lit/material3-expressive`,
`/theme`, `/tokens`, `/styles.css`. Any deep import (`/dist/...`,
`/components/...`) is broken and must be rewritten.

**Tokens, always.** Every color, type style, corner, duration, easing, elevation,
and state opacity in app code must resolve to an `--m3e-*` variable. A literal
`#6750a4`, `font-size: 14px`, `border-radius: 12px`, or `transition: .2s ease` in
app CSS is a defect even when it happens to match the current theme, because it
will not follow theme, density, color mode, or reduced motion.

**Native semantics are already correct.** The components render real `button`,
`input`, `dialog`, `progress`, `nav`, `a`. Do not add `role`, `tabIndex`,
`onKeyDown`, or synthesized activation on top of them. Do supply the things the
platform cannot infer: accessible names for icon-only controls, `<label>`
association for `Checkbox`/`Radio`/`Switch`, heading structure, live-region
policy.

**Expression is a budget, not a default.** Google's own research behind M3
Expressive — 46 studies, 18k+ participants — found users spot key elements up to
4× faster when *one* thing is emphasized. Emphasized type, large/extra-large
buttons, vibrant containers, and shape morphs are for the one focal element per
screen. Everywhere else, restraint is the spec.

**Do not edit the library from an app repo.** If a genuine library defect or gap
appears, report it with a reproduction and work around it in app code only if the
workaround is idiomatic. Never patch `node_modules`, never fork a component to
change its geometry.

## Reference material

Load only what the task needs.

| File | Use it for |
| --- | --- |
| `references/audit.md` | The full audit procedure: every check with an ID, the grep that finds it, severity, and the report format. Load this first for any "review/fix my app" request. |
| `references/api.md` | Every component: purpose, required props, defaults, when to use, when not to, and the gotcha that breaks people. Also what the library does *not* have. |
| `references/tokens.md` | CSS variable naming, complete role lists, theming, density, the dark-mode scope trap, sanctioned override recipes. |
| `references/layout.md` | Window size classes, margins, panes, canonical layouts (list-detail, supporting pane, feed), app-shell anatomy, adaptive navigation rules. |
| `references/styles.md` | Color role application, type scale and emphasis, shape scale and morph, spring motion, elevation vs tone. |
| `references/a11y.md` | Per-component accessibility contract, WCAG 2.2 criteria that bite in M3 apps, keyboard and focus expectations. |
| `references/recipes.md` | Copy-ready compositions for what the library deliberately leaves to the app: app shell, list-detail, feed, supporting pane, side sheet, date/time input, snackbar host, forms, empty/loading/error states. |

`references/api.md` documents **v1.2.0**. Always check the version the app
actually installs (`rg '"@language-lit/material3-expressive"' package.json`). If
it differs, the installed typings are authoritative — read
`node_modules/@language-lit/material3-expressive/dist/index.d.ts` (the complete
public surface, unions and doc comments included) and prefer it over this file.
The published docs at `m3e.language-lit.com` carry per-component anatomy,
accessibility notes, and token lists.

A fast, non-vacuous way to validate any composition you are about to recommend:
write it to a scratch `.tsx` and run the app's `tsc --noEmit` over it. The prop
unions reject combinations Material does not have, so a clean compile is real
evidence and an error is a specific, citable misuse.

## Workflow: auditing and fixing an app

Follow this whenever the request is "fix what's wrong", "review this UI", "make
this properly M3E", or any equivalent.

### Step 1 — Establish the setup baseline

Before judging any screen, confirm the foundation. Read
`references/audit.md` § Setup and run its checks. Answer, concretely:

- Is `@language-lit/material3-expressive/styles.css` imported exactly once, from
  the app's root entry?
- Is there a `Material3Provider` above all Material UI, and does the painted
  page area actually sit inside a theme scope? (See the dark-mode trap in
  `references/tokens.md` — this is the single most common real bug.)
- Is a competing UI framework present (MUI, Chakra, Bootstrap, Ant, a shadcn
  copy, a Tailwind theme with its own palette/radii/breakpoints)? Duplicated
  primitives are a finding, not a detail.
- Version of the package vs. the app's usage: does the app use props that no
  longer exist, or hand-roll something a newer version now ships?

A setup defect invalidates downstream judgments. Fix it first, then re-look.

### Step 2 — Inventory what the app renders

Build a map before changing anything: routes/screens, which library components
each uses, which UI each hand-rolls, and where app-owned CSS touches Material
surfaces. The point is to find *systemic* problems — one wrong pattern repeated
across twelve files is one finding with twelve sites, not twelve findings.

### Step 3 — Run the checks

Work through `references/audit.md` in its section order (Setup → Semantics/a11y →
Tokens → Layout → Components → Expression). Each check has a detection command
and a fix. Record findings with IDs so the report and the diff line up.

Verify before reporting. A grep hit is a candidate, not a finding: open the file,
confirm the context, and confirm the fix is correct in that context. Report only
what you have read.

### Step 4 — Fix in priority order

- **P0** — broken or inaccessible: missing stylesheet or provider, dark mode not
  applying, icon-only controls with no name, unlabeled form controls, focus
  traps, targets below 48px, deep imports, patched `node_modules`.
- **P1** — wrong Material: hand-rolled component instead of the shipped one,
  overridden `.m3e-*` internals, hardcoded design values, wrong navigation
  component for the window class, elevation used where tone belongs, headings
  driven by `Text variant` instead of `as`.
- **P2** — polish: emphasis budget, shape coherence, motion tokens on app-owned
  animations, spacing off the 4/8 grid, line length, empty/loading/error states.

Prefer the smallest correct change. Replacing a hand-rolled card with `Card` is
correct; rewriting the screen's data flow to do it is not. Keep each fix class in
its own commit-sized batch so the user can review them independently.

### Step 5 — Verify

- Typecheck and build the app. The library's prop unions are discriminated, so
  many misuses (`flexible` on a small `AppBar`, `peekHeight` on a modal
  `BottomSheet`, `selected` without `onSelectedChange`) surface as type errors.
- Run whatever the project's test command is.
- Look at it. Layout, state layers, elevation clipping, focus rings, and dark
  mode are invisible to jsdom. If the project has a run/preview skill or Chrome
  automation available, drive the real app: light and dark, 375px / 700px /
  1100px / 1400px widths, keyboard-only tab pass, and
  `prefers-reduced-motion: reduce`.
- Re-run the audit checks you fixed and confirm they are clean.

### Step 6 — Report

Summarize as: what was wrong systemically, what you changed, what you left and
why, and what needs a product decision. Include the before/after for one
representative site per finding class. Do not pad the report with checks that
passed — say the setup is sound in a sentence and move on.

## Workflow: building new UI

When adding a screen or feature rather than repairing one:

1. **Pick the layout first.** Which canonical layout is this — list-detail,
   supporting pane, or feed? Which window size classes must it serve, and what
   collapses at each? `references/layout.md`.
2. **Pick the navigation host.** Compact gets a bottom navigation bar, medium a
   rail, expanded and larger a rail or permanent drawer. `NavigationSuite`
   already switches at 600/840. Never two navigation hosts at once.
3. **Choose components from the catalog, not from habit.** Check
   `references/api.md` before writing markup. If the thing you want exists, use
   it; if the library does not have it, use the recipe in
   `references/recipes.md` rather than inventing a new primitive.
4. **Name one focal element.** One primary action, one emphasized headline, at
   most one expressive flourish per screen. Everything else uses baseline type,
   `small`/`medium` sizes, and standard surfaces.
5. **Write only token-valued CSS.** Spacing on the 4/8 grid, colors and type and
   corners and motion from `--m3e-*`.
6. **Wire accessibility as you go**, not afterwards: heading level, control
   names, `<label>` association, live regions for async state.
7. **Verify in a browser** at the widths above, both color modes, and with
   reduced motion.

## Things that are always wrong

Fast list; the reasoning is in the reference files.

- A hand-written `div` "card", "chip", "dialog", "tab bar", or "snackbar" in an
  app that imports this library.
- Any `.m3e-*` selector or `!important` in app CSS.
- `Text` used to create document structure (`variant="headlineLarge"` on a
  `span`), or `as="h3"` chosen because the size looked right.
- `AppBar title` treated as the page heading — it is a slot; the page still owns
  its `<h1>`.
- Icon-only `IconButton`/`FloatingActionButton` without `aria-label`.
- `Checkbox`, `Radio`, `Switch`, or `Slider` with no associated `<label>` or
  `aria-label` — none of them render one.
- Progress/loading components with no accessible name.
- `box-shadow` written by the app to fake elevation, or elevation used to express
  resting hierarchy instead of `surface-container-*` tone.
- Breakpoints at 640/768/1024/1280 (framework defaults) instead of
  600/840/1200/1600.
- `NavigationBar` shown on a desktop-width window, or a bottom bar plus a rail.
- More than one FAB on a screen, or a FAB whose action is not the screen's
  primary action.
- `transition: 200ms ease` on app-owned motion instead of the token pair
  `var(--m3e-sys-motion-expressive-default-effects-duration)` /
  `-easing`, and no `prefers-reduced-motion` handling.
- Tailwind configured with this package in its content glob, or a Tailwind
  palette/radius/breakpoint scale competing with the tokens.
- Deep imports, or editing anything under `node_modules`.
