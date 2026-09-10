# Applying color, type, shape, motion, and elevation

Token *names* are in `tokens.md`. This file is about choosing correctly.

## Color

### Hierarchy comes from surface tone, not shadow

M3 replaced elevation overlays with tone-based surfaces. Resting hierarchy is
expressed by which surface container role a region uses; shadow is reserved for
things that genuinely float.

| Role | Use for |
| --- | --- |
| `surface` | the page/pane background |
| `surface-container-lowest` | the quietest inset region (wells, code blocks, disabled areas) |
| `surface-container-low` | cards and sections resting on the page |
| `surface-container` | the default container tone; a card on a card |
| `surface-container-high` | menus, docked toolbars, raised sheets, selected rows |
| `surface-container-highest` | the topmost stacked layer, emphasised group |
| `surface-dim` / `surface-bright` | whole-screen tonal shifts (photo viewers, focus modes) |
| `surface-variant` | legacy-ish quiet fill; prefer a container role |
| `inverse-surface` + `inverse-on-surface` | snackbars and inverted callouts only |

Going *up* the container ladder means "closer to the user". Going down means
"recede". Two nested regions with the same container role and no divider read as
one region — that is either the effect you want or a bug.

### Accents

- **`primary` / `on-primary`** — the single most important action per view, active
  states, selected indicators, focus rings. A screen with three filled primary
  buttons has no primary action.
- **`primary-container` / `on-primary-container`** — a tinted region tied to the
  primary action: selected nav item pill, highlighted card, active chip.
- **`secondary*`** — supporting controls: filter chips, tonal buttons, secondary
  toggles. Lower-emphasis brand presence.
- **`tertiary*`** — contrasting accent, used sparingly: an accolade, a badge on a
  promo card, one accent in a data visualisation. If tertiary appears on every
  screen it is no longer an accent.
- **`*-fixed` / `*-fixed-dim`** — the same tone in both color modes. For surfaces
  that must not flip (a brand banner, a hero over artwork).
- **`error` / `error-container`** — validation and destructive states only. Never
  as a decorative red.
- **`outline`** — borders that carry meaning (an outlined field, an outlined
  button). **`outline-variant`** — decorative rules and dividers.
- **`on-surface`** — primary text and icons. **`on-surface-variant`** — secondary
  text, supporting text, inactive icons, placeholders. Using `on-surface` at low
  opacity instead of `on-surface-variant` is a common defect: it breaks in dark
  mode and forced colors.

### Non-negotiables

- Never mix an `on-*` role with a container it is not paired with. Let `Surface`
  pair them.
- Never express state with a hand-mixed color. State layers use
  `--m3e-sys-state-{hover|focus|pressed|dragged}` over the content color;
  disabled uses `--m3e-sys-state-disabled` (0.38).
- Contrast: 4.5:1 body text, 3:1 large text (≥18.66px regular / 14px bold) and
  non-text UI boundaries. `validateColorContrasts` from `/tokens` will check a
  custom palette.
- Never encode meaning in color alone — pair it with an icon, text, or shape.
- Forced-colors mode: the library falls back to system colors and explicit focus
  outlines. App CSS must not fight that; test with forced colors on.

## Typography

Two parallel scales — `baseline` and `emphasized` — over 15 roles.

| Role | Use for |
| --- | --- |
| `display` L/M/S | one short, large statement per screen: a hero number, a marketing headline. Not for section titles. |
| `headline` L/M/S | screen and major section titles |
| `title` L/M/S | card titles, list section headers, dialog titles, app bar titles |
| `body` L/M/S | prose and long-form content; `bodyLarge` is the default reading size |
| `label` L/M/S | component text, captions, metadata, overlines, timestamps |

- Element comes from structure (`as`), size from hierarchy (`variant`). Keep them
  coherent: one `h1` per page, no skipped levels, no headings faked from spans.
- **`emphasized`** raises the weight and tightens the design for a focal point:
  the screen headline, a selected item, a hero metric. One or two per screen. An
  interface where everything is emphasized has no emphasis.
- Do not restate type in CSS. `font-size: 14px` in app code is a defect; use
  `Text` or the typescale variables.
- No more than two typefaces (`brand`, `plain` — the theme already has exactly
  these slots). Self-host them; declare `font-display: swap`.
- Body text: 40–60 characters per line, `max-width: 65ch`.

## Shape

Corner radius is a hierarchy and identity signal, not decoration.

- The scale: 0, 4, 8, 12, 16, 20, 28, 32, 48, `full`. Bigger corners read as
  softer, more contained, more prominent.
- Consistency inside a family: all cards in a list share one corner role. Contrast
  *between* families is what creates interest — a `full`-corner FAB against
  `large`-corner cards.
- Nested containers: the inner radius should be smaller than the outer, roughly
  outer minus the padding, or the corners look wrong.
- Directional roles exist for surfaces attached to an edge: `*-top` for bottom
  sheets and docked panels, `large-start`/`large-end` for side-attached panels.
- **Shape morph** on interaction is an M3E signature and the library already does
  it: Button/IconButton round↔pressed corner, filter and input chips with
  `shape="expressive"`, `Switch` pressed thumb, `SplitButton` trailing circle,
  `LoadingIndicator` polygon morphs. Do not re-implement these; do not disable
  them with CSS.
- No shape carries a fixed meaning. A wavy shape is not "the loading shape" — the
  same vocabulary can appear on a button.

## Motion

The theme stores springs; the build projects them into CSS `duration` + `linear()`
easing pairs (see `tokens.md`).

Choosing:

| Situation | Token |
| --- | --- |
| element moves/resizes/reshapes | `…-{scheme}-{speed}-spatial-*` |
| color, opacity, elevation change | `…-{scheme}-{speed}-effects-*` |
| small local change (state layer, icon swap) | `fast` |
| standard transition (sheet, expand, reorder) | `default` |
| large surface entering, full-screen change | `slow` |

- Pick **one scheme per product**. `standard` is calm and near-critically damped;
  `expressive` overshoots and feels playful. Mixing them randomly reads as
  inconsistency; using the other one deliberately for a single celebratory moment
  reads as intent.
- **Top-level navigation transitions get minimal motion.** Sibling destinations are
  unrelated; a big animated hand-off between them implies a relationship that
  isn't there. Cross-fade or no transition.
- Motion should follow the user's gesture direction and originate from the
  triggering element. A menu that grows from its button is legible; one that
  drifts in from a corner is not.
- Never animate `width`/`height`/`top`/`left` when `transform` and `opacity` will
  do. Never animate more than a couple of properties at once.
- Reduced motion is mandatory for app-owned animation:

  ```css
  .panel { transition:
      transform var(--m3e-sys-motion-expressive-default-spatial-duration)
                var(--m3e-sys-motion-expressive-default-spatial-easing); }
  @media (prefers-reduced-motion: reduce) {
    .panel { transition: none; }   /* state still changes, instantly */
  }
  ```

  The library already snaps spatial transitions and stops infinite decorative
  motion under `reduce`, while keeping state visible. App code must match that
  behavior — remove the motion, never the state change.

## Elevation

Six levels (0–5). Two mechanisms, different jobs:

- **Tonal** (`Surface color=` + `tonalElevation`, only meaningful on
  `color="surface"`): resting hierarchy. Prefer picking a `surface-container-*`
  role directly.
- **Shadow** (`shadowElevation`, `--m3e-sys-elevation-level*-shadow`): things that
  float above content and can be dismissed — dialogs, menus, FAB, snackbar, raised
  sheets, drag states.

Rules:

- Never write `box-shadow` by hand in an M3E app.
- Elevation does not change stacking order; `z-index` is still yours to manage.
- A resting card is level 0 or 1. Level 3+ belongs to overlays. If half the screen
  is at level 3, nothing is elevated.
- Elevation change on hover/press is an *effects* transition, not spatial.
- Watch for clipped shadows: an ancestor with `overflow: hidden` will cut the
  shadow of an elevated child. This is invisible in unit tests — check it in a
  browser.

## Expression, in practice

M3 Expressive is a hierarchy tool. The research behind it (46 studies, 18,000+
participants) found users identified key elements up to 4× faster when one element
was clearly emphasised — and the effect erased the usual age gap in
element-spotting speed. The mechanism is contrast, so it only works while
everything else stays quiet.

Per screen, budget:

- **one** primary action (filled button, or the FAB — not both competing),
- **one** emphasized type role (usually the headline),
- **at most one** expressive flourish: a large/extra-large button, a vibrant
  container, a shape morph, an expressive-scheme animation.

Then check the negative: does anything else compete? Two vibrant containers, three
filled buttons, emphasized type on every card title — each one halves the value of
the others.
