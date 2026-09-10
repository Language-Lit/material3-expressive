# Audit procedure

Run the sections in order. A grep hit is a **candidate**: open the file, confirm
the context, then decide. Report only what you have read.

Commands use `rg` (ripgrep); with plain grep use `grep -rn --include='*.tsx'`.
Scope every search to app source — add
`-g '!node_modules' -g '!dist' -g '!build' -g '!.next' -g '!coverage'`.

Severity: **P0** broken or inaccessible · **P1** wrong Material · **P2** polish.

---

## 0 · Orientation

```bash
rg -n '"@language-lit/material3-expressive"' package.json          # version in use
rg -l 'from .@language-lit/material3-expressive' | wc -l           # adoption breadth
rg -n '"(@mui/|@chakra-ui/|antd|bootstrap|@radix-ui/|tailwindcss)' package.json
rg -l "from '@language-lit/material3-expressive'" | head -50       # where components live
```

Note the package version, how widely the library is actually used, and every
competing UI dependency. Then list the app's screens/routes and, per screen, which
library components it uses and which UI it hand-rolls. Systemic findings beat
per-file findings.

---

## 1 · Setup

| ID | Check | Detect | Sev |
| --- | --- | --- | --- |
| SETUP-1 | `/styles.css` imported exactly once, at the root entry | `rg -n "material3-expressive/styles.css"` | P0 |
| SETUP-2 | A `Material3Provider` wraps all Material UI | `rg -n "Material3Provider"` | P0 |
| SETUP-3 | Painted page area is inside a theme scope (dark mode actually applies) | `rg -n "m3e-sys-color" --glob '*.css' -g '*.scss'` then check for `body`/`html`/`:root` rules; `rg -n 'data-m3e-color-mode' -g '*.html' -g '*layout*'` | P0 |
| SETUP-4 | No deep imports | `rg -n "material3-expressive/(dist\|src\|components\|theme/[a-z]\|tokens/[a-z])"` | P0 |
| SETUP-5 | `node_modules` not patched | `rg -n "patch-package\|patches/" package.json; ls patches 2>/dev/null` | P0 |
| SETUP-6 | Package not in a Tailwind content glob | `rg -n "material3-expressive" tailwind.config.*` | P1 |
| SETUP-7 | No competing theme scale (Tailwind colors/radii/screens, MUI theme, CSS-framework reset) | `rg -n "theme:\s*\{" tailwind.config.*; rg -n "createTheme\|ThemeProvider" -g '!*material3*'` | P1 |
| SETUP-8 | Library CSS not re-imported from a component/module stylesheet | `rg -n "@import.*material3-expressive"` | P1 |
| SETUP-9 | SSR: `theme`/`colorMode`/`systemModeFallback` stable across server and first client render; theme built in a server module via `/theme` | read the provider file | P1 |
| SETUP-10 | Icon font/SVG source actually served (self-hosted, `font-display: swap`) | `rg -n "Material Symbols\|material-symbols"` | P1 |

**SETUP-3 in detail.** The emitted CSS puts light colors on `:root` and dark
colors on `[data-m3e-color-mode="dark"]` / `system` + dark media query.
`Material3Provider` renders that attribute on its own `div`. Any rule that paints
`html`/`body` with `--m3e-sys-color-*` therefore stays **light forever**. Fix by
putting `class="m3e-theme" data-m3e-color-mode="system"` on `<html>`, or by
letting the provider/`Surface` own the painted area. Full explanation in
`tokens.md`.

---

## 2 · Semantics and accessibility

| ID | Check | Detect | Sev |
| --- | --- | --- | --- |
| SEM-1 | Icon-only controls have `aria-label` | `rg -n "<IconButton" -A3 \| rg -v "aria-label"` (then read); same for `<FloatingActionButton` without `label` | P0 |
| SEM-2 | `Checkbox`/`Radio`/`Switch` are labelled | `rg -n "<(Checkbox\|Radio\|Switch)" -A4` — need `id` + `<label htmlFor>` or `aria-label` | P0 |
| SEM-3 | `Slider`/`RangeSlider` labelled; visible value; non-drag alternative | `rg -n "<(Slider\|RangeSlider)" -A4` | P0 |
| SEM-4 | Progress/loading components have `aria-label` | `rg -n "<(LinearProgress\|CircularProgress\|WavyProgress\|LoadingIndicator)" -A2` | P0 |
| SEM-5 | Exactly one `<h1>` per screen; no skipped levels | `rg -n '<h[1-6]\|as="h[1-6]"'` | P0 |
| SEM-6 | Headings are real headings, not styled spans | `rg -n 'variant="(display\|headline)[A-Za-z]+"' -A1` — check `as=` | P1 |
| SEM-7 | `AppBar title` is not the only page heading | `rg -n "<AppBar" -A6` | P1 |
| SEM-8 | No `role=`/`tabIndex`/`onKeyDown` bolted onto library controls | `rg -n "<(Button\|IconButton\|Card\|ListItem\|Chip)[^>]*(role=\|tabIndex\|onKeyDown)"` | P1 |
| SEM-9 | `Menu` triggers carry `aria-haspopup="menu"` + `aria-expanded` | `rg -n "<Menu" -B8` | P1 |
| SEM-10 | No focus-trap library or `aria-modal` around native `dialog` components | `rg -n "focus-trap\|FocusLock\|aria-modal"` | P1 |
| SEM-11 | No `outline: none` / `outline: 0` | `rg -n "outline:\s*(none\|0)"` | P0 |
| SEM-12 | No nested interactives inside `Card interactive` | `rg -n "interactive" -A10 \| rg "Button\|<a \|href=\|<input"` | P0 |
| SEM-13 | One `<main>`; `nav` landmarks labelled when there is more than one | `rg -n "<main\|as=\"main\"\|aria-label" -g '*nav*'` | P1 |
| SEM-14 | Skip link to `#main` on shells with navigation | `rg -n "Skip to"` | P1 |
| SEM-15 | No duplicate `aria-label` over visible text | read SEM-1 hits that also have text children | P1 |
| SEM-16 | Async regions announce (`role="status"` / `alert`), no wrapper live region around `Snackbar` | `rg -n "aria-live\|role=\"status\"\|role=\"alert\""` | P1 |
| SEM-17 | Sticky bars don't obscure focus (`scroll-padding-block`) | `rg -n "position:\s*(sticky\|fixed)" -A6` | P1 |
| SEM-18 | Dragging has a pointer alternative (`BottomSheet`, reorder lists, `Carousel`) | `rg -n "draggable\|dragHandle\|onDragStart"` | P1 |
| SEM-19 | Form fields: `autoComplete`, error text that explains the fix, no paste blocking | `rg -n "<TextField" -A6`; `rg -n "onPaste"` | P1 |
| SEM-20 | `Badge` with meaning has `label`; `Carousel` items have `label` | `rg -n "<Badge\|items=\{" -A3` | P1 |

Per-component requirements are in `a11y.md`.

---

## 3 · Tokens and styling

| ID | Check | Detect | Sev |
| --- | --- | --- | --- |
| TOK-1 | No hardcoded colors | `rg -n "#[0-9a-fA-F]{3,8}\b\|rgba?\(\|hsla?\(" -g '*.css' -g '*.scss' -g '*.tsx' -g '*.ts'` | P1 |
| TOK-2 | No hardcoded type | `rg -n "font-size\|fontSize\|font-weight\|fontWeight\|line-height\|lineHeight\|letter-spacing"` | P1 |
| TOK-3 | No hardcoded radii | `rg -n "border-radius\|borderRadius"` | P1 |
| TOK-4 | No hand-written shadows | `rg -n "box-shadow\|boxShadow\|elevation-\d\|drop-shadow"` | P1 |
| TOK-5 | No ad-hoc motion | `rg -n "transition:\|transitionDuration\|animation:\|cubic-bezier\|ease-in-out\|\b\d+ms\b\|\b0?\.\d+s\b"` | P1 |
| TOK-6 | No `.m3e-*` selectors in app CSS (layout-only positioning of a library root is the single tolerated exception, and even then prefer a wrapper) | `rg -n "\.m3e-" -g '*.css' -g '*.scss'` | P1 |
| TOK-7 | No `!important` against library styles | `rg -n "!important"` | P1 |
| TOK-8 | Component overrides go through `--m3e-comp-*`, scoped to an ancestor | `rg -n "--m3e-comp-"` | P2 |
| TOK-9 | Theme customisation goes through `createTheme`/`extendTheme`, not CSS overwrites of `--m3e-sys-*` | `rg -n "createTheme\|extendTheme"; rg -n "--m3e-sys-[a-z-]+:\s"` | P1 |
| TOK-10 | Spacing on the 4/8 grid | `rg -no "\b\d+px\b" -g '*.css' \| sort -u` — flag values not divisible by 4 | P2 |
| TOK-11 | State layers use `--m3e-sys-state-*`, not hand-mixed alphas | `rg -n "opacity:\s*0\.\d\|rgba\("` | P2 |
| TOK-12 | Text colors use `on-surface` / `on-surface-variant`, not `on-surface` at reduced opacity | `rg -n "on-surface[^-]" -A1` | P2 |
| TOK-13 | `sr-only`/visually-hidden helper exists and is correct if used | `rg -n "sr-only\|visually-hidden"` | P2 |

**Triage for TOK-1/2/3/5.** A hit is fine in: a token/theme definition module, a
non-Material marketing page that deliberately opts out, an SVG `fill` inside
artwork, or a third-party widget's required config. It is a defect anywhere in
app UI that sits on a Material surface. Prefer replacing with the matching
`--m3e-*` variable; if no variable matches, that is a design question for the
user, not a licence to hardcode.

---

## 4 · Layout and adaptivity

| ID | Check | Detect | Sev |
| --- | --- | --- | --- |
| LAY-1 | Breakpoints are 600/840/1200/1600 | `rg -n "min-width:\s*\d+px\|max-width:\s*\d+px"` | P1 |
| LAY-2 | Margins 16px compact / 24px medium-and-up | read the shell/page CSS | P2 |
| LAY-3 | One navigation host at a time; correct one per class | `rg -n "<(NavigationBar\|NavigationRail\|NavigationDrawer\|NavigationSuite)"` | P1 |
| LAY-4 | ≤5 top-level destinations | read the items array | P2 |
| LAY-5 | One `AppBar` per screen; `SearchAppBar` replaces it rather than stacking | `rg -n "<(AppBar\|SearchAppBar)"` | P1 |
| LAY-6 | `scrollContainer` passed when an inner element scrolls | `rg -n "scrollBehavior" -A3` | P1 |
| LAY-7 | One FAB per screen, primary action, 16px clearance from bottom bars | `rg -n "<FloatingActionButton"` | P1 |
| LAY-8 | Two-pane layouts exist above 840px where the content warrants it | read screens | P2 |
| LAY-9 | Second pane has a placeholder / empty state | read the detail pane | P1 |
| LAY-10 | Feed grids are intrinsic (`auto-fill`/`minmax`), not breakpoint-counted columns | `rg -n "grid-template-columns"` | P2 |
| LAY-11 | Prose has a max width (~65ch); nothing stretches across 1600px | `rg -n "max-width\|max-inline-size"` | P2 |
| LAY-12 | `100dvh` not `100vh`; safe-area insets used on fixed bottom UI | `rg -n "100vh\|env\(safe-area"` | P2 |
| LAY-13 | Logical properties for spacing (RTL-safe) | `rg -n "margin-left\|margin-right\|padding-left\|padding-right\|\bleft:\|\bright:"` | P2 |
| LAY-14 | No fixed heights on containers holding Material controls (200% text) | `rg -n "height:\s*\d+px"` | P2 |
| LAY-15 | Modal drawer not used at desktop width | `rg -n "NavigationDrawer" -A3` | P2 |

---

## 5 · Component choice

| ID | Check | Detect | Sev |
| --- | --- | --- | --- |
| COMP-1 | No hand-rolled Material components | `rg -n 'className="[^"]*(card\|chip\|dialog\|modal\|tooltip\|toast\|snackbar\|tab\|badge\|drawer\|sheet)'` | P1 |
| COMP-2 | Raw `<button>`/`<input>`/`<select>`/`<textarea>`/`<dialog>` replaced by library components | `rg -n "<button\|<input\|<select\|<textarea\|<dialog"` | P1 |
| COMP-3 | One `filled` primary action per view; correct emphasis ladder | `rg -n 'variant="filled"'` | P2 |
| COMP-4 | Button `size` used for hierarchy, not density (`large`/`extra-large` are hero-only) | `rg -n 'size="(large\|extra-large)"'` | P2 |
| COMP-5 | `Tabs` used for in-page content only, never app navigation | `rg -n "<Tabs" -A5` | P1 |
| COMP-6 | Correct chip `kind` for the job | `rg -n "<Chip" -A2` | P2 |
| COMP-7 | `SegmentedButtonGroup` (not `ButtonGroup`) for single/multi choice | `rg -n "<ButtonGroup" -A5` | P2 |
| COMP-8 | `Select` for fixed options; not for free text | `rg -n "<Select" -A4` | P2 |
| COMP-9 | `Dialog role="alertdialog"` for destructive confirmation; undo-snackbar preferred where reversible | `rg -n "<Dialog" -A4` | P2 |
| COMP-10 | `Snackbar` not carrying errors that need a decision | `rg -n "<Snackbar" -A4` | P2 |
| COMP-11 | Right progress component (determinate vs indeterminate vs `LoadingIndicator`); not spinner + skeleton together | `rg -n "Progress\|LoadingIndicator\|skeleton"` | P2 |
| COMP-12 | `Surface` (not a bare styled div) for Material regions | `rg -n "background:\s*var\(--m3e-sys-color-surface" -g '*.css'` | P2 |
| COMP-13 | `Text` used for typography instead of raw elements + CSS | `rg -n "<(p\|span\|h[1-6])[ >]" \| wc -l` vs `rg -c "<Text"` | P2 |
| COMP-14 | Elevation expresses floating, tone expresses resting hierarchy | `rg -n "shadowElevation\|tonalElevation"` | P2 |
| COMP-15 | Nothing re-implements a documented library behavior (scroll-collapse app bar, sheet drag, carousel keylines, chip morph) | read | P1 |

---

## 6 · Expression

| ID | Check | Detect | Sev |
| --- | --- | --- | --- |
| EXP-1 | ≤1–2 emphasized type roles per screen | `rg -n 'emphasis="emphasized"'` | P2 |
| EXP-2 | One focal element per screen (primary action, hero type, or one flourish — not all three) | read screens | P2 |
| EXP-3 | Corner roles coherent within a family, contrasting between families | `rg -n 'shape="'` | P2 |
| EXP-4 | One motion scheme app-wide; the other only for a deliberate moment | `rg -n "m3e-sys-motion-(standard\|expressive)"` | P2 |
| EXP-5 | `prefers-reduced-motion` guard on every app-owned animation | `rg -n "prefers-reduced-motion"` vs TOK-5 hits | P1 |
| EXP-6 | Top-level navigation transitions kept minimal | read route transitions | P2 |
| EXP-7 | Tertiary/vibrant accents used sparingly | `rg -n "tertiary\|vibrant"` | P2 |
| EXP-8 | Empty/loading/error states present and on-brand for every pane | read | P1 |

---

## 7 · Verification after fixing

```bash
# whatever the app uses
npm run typecheck || npx tsc --noEmit
npm test --silent
npm run build
```

Type errors are informative here: the library's discriminated unions reject
combinations Material does not have (`flexible` on a small `AppBar`, `peekHeight`
on a modal `BottomSheet`, `variant="elevated"` on an input chip, controlled state
without its handler). Fix the usage, not the types — never `as any` past one.

Then, in a real browser (jsdom cannot see any of this):

- 375 / 700 / 1100 / 1400px widths — navigation switches at 600 and 840, panes
  appear, nothing clips or overflows horizontally.
- Light and dark, plus forced-colors.
- Keyboard-only pass: focus visible everywhere, order matches reading order,
  nothing hidden under a sticky bar.
- 200% text zoom; 320px width.
- `prefers-reduced-motion: reduce`.
- Elevation shadows not clipped by an ancestor `overflow: hidden`.

Re-run every check you fixed.

---

## Report template

```markdown
## M3E audit — <app>

**Library** v<x.y.z>, used in <n> modules. **Setup**: <sound | broken: …>

### P0 — broken or inaccessible
- [SETUP-3] Dark mode never applies: `body` paints `--m3e-sys-color-surface`
  outside the theme scope (`app/globals.css:12`). Fixed by moving the scope to
  `<html>`. — fixed
- [SEM-1] 14 `IconButton`s without `aria-label` (`src/…`, list). — fixed

### P1 — wrong Material
- [COMP-1] Hand-rolled card in `src/components/ItemCard.tsx` (+6 call sites)
  replaced with `Card variant="elevated"`. — fixed
- [TOK-6] `.m3e-button { border-radius: 4px }` in `globals.css:88` replaced with
  a scoped `--m3e-comp-button-small-container-shape-round`. — fixed

### P2 — polish
- [EXP-1] `emphasis="emphasized"` on every card title; reduced to the screen
  headline. — fixed
- [LAY-11] Prose runs the full 1600px width on /docs. — not fixed, needs a
  content-width decision.

### Left alone, with reasons
- `src/marketing/*` deliberately opts out of Material; confirmed with the user's
  existing pattern.

### Needs a product decision
- Date picker: the library has none. Currently a native `<input type="date">`
  styled with tokens (recipe applied). A full M3 calendar is a scoped feature.

### Verification
typecheck ✓ · tests ✓ (42) · build ✓ · browser: 375/700/1100/1400 ✓, dark ✓,
keyboard ✓, reduced-motion ✓
```

Do not list checks that passed. One sentence that setup is sound is enough.
