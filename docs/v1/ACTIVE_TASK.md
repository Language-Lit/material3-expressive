# Active v1 task

## T10 — Card

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement one framework-neutral `Card` API with filled, elevated, and
  outlined Material variants and generic consumer-owned content.
- Keep passive and interactive behavior statically distinct. Passive cards
  render an `article` by default and support a bounded set of passive block and
  landmark elements. Interactive cards render a native `button`, default to
  `type="button"`, and preserve native form, focus, disabled, ref, event, ARIA,
  and keyboard activation behavior.
- Use current first-party Card container colors, content colors, medium shape,
  outline, disabled treatment, and per-state elevation. Interactive hover,
  focus, and pressed states consume stable namespaced component tokens and
  semantic motion tokens.
- Preserve visible focus, forced-colors, logical RTL behavior, reduced-motion
  outcomes, deterministic SSR/hydration, and default/custom/nested theme token
  resolution.
- Warn in development when runtime callers provide interactive-only props to a
  passive card, combine `interactive` with `as`, or provide content that is
  detectably unsafe inside a native button.
- Document the web adaptation from Compose's passive and clickable overloads to
  a discriminated React API and the HTML restriction that whole-card buttons
  cannot contain nested interactive descendants.

Link-card navigation, selection/toggle behavior, arbitrary polymorphic
interactive elements, overlay-link patterns, nested action orchestration,
card-specific content slots, media/image loading, drag behavior, swipe/dismiss
behavior, loading, long-press, custom colors/shapes/elevations, framework
adapters, private downstream application integration, and legacy implementation changes are out
of scope.

### Expected files

- `src/v1/components/Card/`, public component barrels, complete style assembly,
  and sourced Card component-token defaults.
- Card behavior, interaction, accessibility, theme, CSS, SSR, type-contract,
  and conformance evidence under `tests/v1/`.
- A mirrored example under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- Card documentation, a passive/interactive semantics ADR,
  architecture/provenance notes, and the component inventory status/exports.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- Filled, elevated, and outlined variants map to current sourced container,
  content, medium-corner, outline, disabled, and elevation tokens through stable
  `--m3e-comp-card-*` variables and `data-m3e-*` attributes.
- Passive cards render no interactive role, focus behavior, disabled state, or
  activation logic; `as` selects only a documented passive block or landmark
  element and forwards the corresponding ref and native props.
- Interactive cards render a native `button`, default to `type="button"`,
  forward their ref, preserve forms and browser-owned Enter/Space activation,
  and do not synthesize keyboard events.
- Interactive cards omit `aria-pressed`, forward consumer click handlers
  directly, and do not own selection or toggle state that is absent from the
  pinned first-party Card API.
- Filled elevation resolves to Level 0 at rest/focus/press and Level 1 on hover;
  elevated resolves to Level 1 at rest/focus/press and Level 2 on hover;
  outlined resolves to Level 0 at rest/focus/press and Level 1 on hover.
- Disabled interactive cards do not activate or mutate selection and retain
  sourced disabled container/content/outline/elevation treatment. Passive cards
  never accept a disabled state.
- Interactive cards reserve at least a 48 by 48 CSS-pixel target, expose visible
  focus, and document that their children must not contain links, buttons, or
  other interactive descendants.
- Invalid mode combinations produce actionable development warnings without
  changing server markup; rendering and hydration remain deterministic and
  inject no styles.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, examples, public exports,
  production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
