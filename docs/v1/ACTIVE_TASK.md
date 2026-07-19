# Active v1 task

## T07 — Button

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement `Button` as a framework-neutral native HTML button for React
  consumers, defaulting to `type="button"` while preserving submit/reset,
  form-owner, naming, value, and disabled behavior.
- Support the five current Material button variants: filled, filled tonal,
  elevated, outlined, and text.
- Support the current Material 3 Expressive extra-small, small, medium, large,
  and extra-large size tiers with sourced container, padding, typography, icon,
  spacing, outline, and shape values.
- Provide intrinsic and full-width layout, round and square resting shapes, and
  the sourced size-aware pressed shape.
- Adapt the first-party no-bounce default-effects spring to deterministic CSS
  motion tokens once, then use it for the pressed-shape morph and disable
  nonessential transitions under reduced motion.
- Preserve consumer classes, styles, native button attributes, ARIA/data
  attributes, and event handlers while forwarding an `HTMLButtonElement` ref.
- Provide explicit leading and trailing icon slots whose visual content is
  hidden from assistive technology so the button label owns one accessible
  name.
- Preserve a minimum 48 by 48 CSS-pixel interaction target independently of the
  smaller Expressive visual container sizes, with visible keyboard focus and
  forced-colors behavior.
- Document the web adaptation from Compose overloads and modifiers to one
  stable React API with explicit variants, sizes, widths, and shapes.

Link-button polymorphism, toggle state, icon-only controls, loading state,
button groups, split buttons, routing adapters, arbitrary custom shape models,
Next/Vite runtime adapters, private downstream application integration, and legacy implementation
changes are out of scope.

### Expected files

- `src/v1/components/Button/`, the v1 component/public barrels, complete style
  assembly, and sourced Button component-token defaults.
- A reusable, deterministic CSS spring projection in the v1 token/motion
  boundary, with focused token serialization coverage.
- Button behavior, interaction, accessibility, theme, CSS, SSR, and conformance
  evidence under `tests/v1/components/Button/`.
- A mirrored example under `playground/v1/examples/` and playground usage.
- Button documentation, a public-API/motion ADR, architecture/provenance notes,
  and the component inventory status/exports.
- Vite/Next consumer fixture coverage and an explicit bundle-budget update only
  if justified by measured output.

### Acceptance checks

- All five Material variants and five Expressive sizes map to sourced colors,
  dimensions, type roles, icon metrics, outlines, elevation, and resting/pressed
  shapes through stable namespaced variables and data attributes.
- Round and square shapes morph to the correct size-aware pressed shape using a
  deterministic projection of the theme's Expressive default-effects spring;
  reduced motion removes the transition without hiding pressed state.
- Intrinsic width is the default, full width is explicit, content remains
  logical-direction safe, and leading/trailing slots render in source order
  while staying decorative to assistive technology.
- The root is a native `button`, defaults to `type="button"`, forwards its ref,
  preserves native form and consumer behavior, and does not add link, toggle,
  loading, or framework semantics.
- Native disabled behavior prevents activation and exposes the disabled state;
  pointer, Enter, and Space activation remain browser-owned with no duplicate
  callbacks or custom keyboard simulation.
- Every size provides at least a 48 by 48 CSS-pixel target, focus remains visible,
  and disabled, forced-colors, RTL, and reduced-motion outcomes are explicit.
- Empty unnamed content produces an actionable development warning without
  changing server markup; rendering and hydration remain deterministic and
  inject no styles.
- Default, custom, and nested theme scopes prove token consumption; production
  CSS resolves every referenced custom property.
- Documentation, current primary-source links, example, public exports,
  production stylesheet coverage, and inventory agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
