# Tokens, theming, and the override surface

Every design value in an M3E app resolves to a CSS custom property emitted by
`@language-lit/material3-expressive/styles.css`. App code consumes those
variables; it never restates their values.

## Naming

Token paths map mechanically to variable names — camelCase becomes kebab-case,
dots become hyphens, with three renames:

| Token path | CSS variable |
| --- | --- |
| `ref.palette.primary-40` | `--m3e-ref-palette-primary-40` |
| `ref.typeface.brand` | `--m3e-ref-typeface-brand` |
| `ref.typeface.weight.medium` | `--m3e-ref-typeface-weight-medium` |
| `sys.color.onSurfaceVariant` | `--m3e-sys-color-on-surface-variant` |
| `sys.typography.emphasized.titleLarge.fontSize` | `--m3e-sys-typescale-emphasized-title-large-font-size` |
| `sys.shape.cornerValues.large` | `--m3e-sys-shape-corner-value-large` |
| `sys.shape.corners.cornerExtraLarge` | `--m3e-sys-shape-corner-extra-large` |
| `sys.motion.expressive.default.spatial.stiffness` | `--m3e-sys-motion-expressive-default-spatial-stiffness` |
| `sys.elevation.level3.shadow` | `--m3e-sys-elevation-level3-shadow` |
| `sys.state.hover` | `--m3e-sys-state-hover` |
| `sys.density.minimumInteractiveTarget` | `--m3e-sys-density-minimum-interactive-target` |

Note `typography` → `typescale`, `cornerValues` → `corner-value`, and
`corners.cornerX` → `corner-x`. `tokenPathToCssVariable()` from `/tokens` does
this at runtime if you need it programmatically.

Component aliases are `--m3e-comp-<component>-<token>`, e.g.
`--m3e-comp-button-medium-container-height`,
`--m3e-comp-card-elevated-container-color`,
`--m3e-comp-navigation-bar-container-color`. Registered namespaces: `app-bar`,
`badge`, `bottom-sheet`, `button`, `button-group`, `card`, `carousel`,
`checkbox`, `chip`, `circular-progress`, `dialog`, `divider`, `fab-menu`,
`floating-action-button`, `floating-toolbar`, `icon`, `icon-button`,
`linear-progress`, `list-item`, `loading-indicator`, `menu`, `navigation-bar`,
`navigation-drawer`, `navigation-rail`, `radio`, `search-bar`,
`segmented-button-group`, `slider`, `snackbar`, `split-button`, `surface`,
`switch`, `tabs`, `text-field`, `tooltip`, `wavy-progress`.

## The four token layers

1. **Reference** — the raw palette (`primary-0…100`, `secondary-*`,
   `tertiary-*`, `neutral-*`, `neutral-variant-*`, `error-*`, `black`, `white`)
   plus typeface families (`brand`, `plain`) and weights. Apps almost never read
   these directly.
2. **System** — the semantic layer apps *do* use: color roles, typescale, shape,
   motion, elevation, state, density.
3. **Component** — `--m3e-comp-*` aliases that resolve to system tokens. The
   sanctioned per-component override point.
4. **App** — your own variables, defined in terms of the layers above.

## Color roles

48 system roles, all available as `--m3e-sys-color-<kebab>`:

**Accent triads** — `primary`, `on-primary`, `primary-container`,
`on-primary-container`, and the same for `secondary` and `tertiary`.
**Fixed accents** — `primary-fixed`, `primary-fixed-dim`, `on-primary-fixed`,
`on-primary-fixed-variant` (and secondary/tertiary equivalents): these keep the
same value in light and dark, for surfaces that must not flip.
**Error** — `error`, `on-error`, `error-container`, `on-error-container`.
**Surfaces** — `surface`, `surface-dim`, `surface-bright`,
`surface-container-lowest`, `surface-container-low`, `surface-container`,
`surface-container-high`, `surface-container-highest`, `surface-variant`,
`on-surface`, `on-surface-variant`, `surface-tint`.
**Utility** — `background`, `on-background`, `outline`, `outline-variant`,
`shadow`, `scrim`, `inverse-surface`, `inverse-on-surface`, `inverse-primary`.

Application rules live in `styles.md`. The mechanical rule: **never mix an `on-*`
role with a container it is not paired with.** `on-primary` goes on `primary`,
`on-primary-container` on `primary-container`, `on-surface`/`on-surface-variant`
on any `surface*`. `Surface` does this pairing for you.

## Typography tokens

15 roles × 2 emphases × 5 properties + 9 variable-font axes:

```css
font-family:     var(--m3e-sys-typescale-baseline-title-large-font-family);
font-weight:     var(--m3e-sys-typescale-baseline-title-large-font-weight);
font-size:       var(--m3e-sys-typescale-baseline-title-large-font-size);
line-height:     var(--m3e-sys-typescale-baseline-title-large-line-height);
letter-spacing:  var(--m3e-sys-typescale-baseline-title-large-letter-spacing);
```

Axes: `--m3e-sys-typescale-{emphasis}-{role}-axes-{CRSV|FILL|GRAD|HEXP|ROND|opsz|slnt|wdth|wght}`.

Sizes are in `rem`, so browser font-size settings and zoom work. Prefer the
`Text` component over writing these by hand; reach for the variables only when
styling an element `Text` cannot own (a `<td>`, a third-party widget).

## Shape tokens

Corner **values** (raw lengths): `none` 0, `extra-small` 4, `small` 8,
`medium` 12, `large` 16, `large-increased` 20, `extra-large` 28,
`extra-large-increased` 32, `extra-extra-large` 48 px.

Corner **roles** (`border-radius`-ready, includes directional forms):
`--m3e-sys-shape-corner-{none|extra-small|extra-small-top|small|medium|large|large-start|large-end|large-top|large-increased|extra-large|extra-large-top|extra-large-increased|extra-extra-large|full}`.
`full` is `9999px`.

Use the role tokens for containers; use `Surface shape=` when the element is a
`Surface`.

## Motion tokens

The theme stores springs (`dampingRatio` + `stiffness`) across
`{standard|expressive} × {fast|default|slow} × {spatial|effects}`. Because CSS has
no spring primitive, the build **projects each spring into a duration and a
sampled `linear()` easing**:

```css
transition-property: transform, opacity;
transition-duration: var(--m3e-sys-motion-expressive-default-spatial-duration);
transition-timing-function: var(--m3e-sys-motion-expressive-default-spatial-easing);
```

Rules:

- **spatial** for anything that moves, grows, or reshapes (position, size,
  corner, transform). Spatial springs may overshoot — that is the point.
- **effects** for color, opacity, elevation. Critically damped, no bounce.
- **fast** for small local changes, **default** for most, **slow** for large or
  entering surfaces.
- Pick **one scheme for the product** (`standard` or `expressive`) and use the
  other only to mark a deliberate highlighted moment.
- The raw `-damping-ratio`/`-stiffness` variables exist for JS animation
  libraries; CSS should use the `-duration`/`-easing` pair.
- Always pair app-owned motion with a reduced-motion guard (see `styles.md`).

## Elevation, state, density

- `--m3e-sys-elevation-level{0..5}-shadow` — ready for `box-shadow`. Also
  `-dp` and `-tonal-overlay-opacity` per level.
- `--m3e-sys-state-{hover|focus|pressed|dragged|disabled}` — 0.08 / 0.1 / 0.1 /
  0.16 / 0.38. Use these opacities for app-owned state layers so they match
  component behavior.
- `--m3e-sys-density-scale` and `--m3e-sys-density-minimum-interactive-target`
  (48px). Honour the latter for every app-authored control.

## Theming

```ts
// server-safe module — no React
import { createTheme } from '@language-lit/material3-expressive/theme'

export const appTheme = createTheme({
  reference: { typeface: { brand: ['Roboto Flex', 'sans-serif'] } },
  colorSchemes: {
    light: { primary: { $ref: 'ref.palette.primary-30' } },
  },
  density: { scale: -1 },
})
```

- `createTheme(overrides)` deep-merges onto the complete default, validates, and
  returns a deeply frozen theme. `extendTheme(base, overrides)` does the same from
  an existing theme.
- Color roles are **references into `reference.palette`**, not literals. To
  rebrand, override the palette tones; to remap a role, override its `$ref`.
  Invalid references and contrast-breaking schemes are rejected at creation time —
  a thrown `ThemeValidationError` is the system catching a real accessibility
  problem, not an obstacle to route around.
- Theme objects are serializable and may cross a server→client boundary.
- Nested `Material3Provider`s are isolated; use one for a distinctly branded
  region (an editor, a preview canvas) rather than restyling components.
- `validateColorContrasts(tokenSet)` from `/tokens` reports role-pair contrast if
  you want a CI gate on a custom palette.

## The override surface, in order of preference

1. **`createTheme`** — anything global: brand palette, typefaces, density,
   corner values, motion springs.
2. **`--m3e-comp-*` on an ancestor** — a scoped, one-component deviation:

   ```css
   .marketing-hero { --m3e-comp-button-large-container-shape-round: 8px; }
   ```

3. **App-owned CSS on app-owned elements** — layout, spacing, and your own
   containers, written in `--m3e-*` values.
4. **Nothing else.** Never target `.m3e-*` classes, never `!important` against
   library styles, never patch `node_modules`, never deep-import a component's
   CSS. If a component cannot express what you need, that is a library gap to
   report, not an override to force.

## The dark-mode scope trap

The most common real bug in apps built on this library.

How the emitted CSS is scoped:

```
:root, .m3e-theme          → all non-color tokens
:root                      → LIGHT color roles
[data-m3e-color-mode="light"], [data-m3e-color-mode="system"]  → light
[data-m3e-color-mode="dark"]                                   → dark
@media (prefers-color-scheme: dark) { [data-m3e-color-mode="system"] → dark }
```

`Material3Provider` renders a `div.m3e-theme[data-m3e-color-mode]`. Anything
**outside** that div — `html`, `body`, a wrapper above the provider — resolves
`--m3e-sys-color-*` from `:root`, which is **always light**. So:

```css
/* ✗ stays light forever in dark mode */
body { background: var(--m3e-sys-color-surface); }
```

Two correct fixes:

```html
<!-- A. put the theme scope on the document root (documented and supported) -->
<html class="m3e-theme" data-m3e-color-mode="system">
```

This also sets `color-scheme`, so native scrollbars, form chrome, and
`prefers-color-scheme`-aware UA styling follow.

```tsx
/* B. let the provider own the painted area */
<Material3Provider colorMode="system" style={{ minHeight: '100dvh' }}>
  <Surface as="div" color="surface" style={{ minHeight: '100dvh' }}>…</Surface>
</Material3Provider>
```

Keep the server and first client render consistent: same `theme`, `colorMode`,
and `systemModeFallback`. A later prop change is ordinary state; a mismatch is a
hydration error.

## Setup checklist

```tsx
// root entry, exactly once
import '@language-lit/material3-expressive/styles.css'
```

- Stylesheet imported once, at the app entry — not per component, not per route.
- One `Material3Provider` above all Material UI (plus intentional nested scopes).
- Theme scope covers the painted page area (see above).
- The package is **not** in any Tailwind `content` glob, and if Tailwind is
  present its palette/radius/breakpoint scales are either removed or aligned to
  the tokens. Two competing scales is the defect.
- No `@import` of library CSS from inside a CSS module or component stylesheet.
