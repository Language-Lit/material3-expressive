# Active v1 task

## T05 — Text

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement `Text` as the framework-neutral Material typography foundation for
  React consumers.
- Expose the complete current Material 3 Expressive type scale: all 15 baseline
  roles and their 15 emphasized counterparts, including themeable variable-font
  axes.
- Keep visual typography role independent from a bounded, explicitly selected
  native HTML element; default to neutral inline text and forward a correctly
  typed ref and native attributes.
- Inherit the surrounding Material content color instead of inventing a text
  color context, loading fonts, or coupling typography to `Surface`.
- Consume only theme-backed system typography tokens through stable namespaced
  selectors and state attributes, and preserve consumer classes, styles, event
  handlers, ARIA attributes, and data attributes.
- Document the web adaptation from Compose text styling to native HTML
  semantics and CSS variable-font support.

Automatic heading inference, font fetching, responsive text auto-sizing,
rich-text parsing, links, truncation/layout utilities, application recipes,
private downstream application integration, and legacy implementation changes are out of scope.

### Expected files

- `src/v1/components/Text/` and the v1 component/public barrels.
- Text tests and conformance evidence under `tests/v1/components/Text/`.
- A mirrored example under `playground/v1/examples/` and playground usage.
- Text documentation, a public-API ADR, architecture/provenance notes where
  needed, and the component inventory status.
- Vite/Next consumer fixture coverage and an explicit bundle-budget update if
  justified by the measured complete type-scale implementation.

### Acceptance checks

- `variant` and `emphasis` select all 30 sourced Material type styles without
  determining or changing the rendered HTML element.
- The default and every supported semantic element render without inferred
  roles, heading levels, focusability, or interaction behavior.
- Public props preserve relevant native attributes and forward a correctly typed
  ref to the selected element.
- Font family, weight, size, line height, tracking, and every supported variable
  axis resolve through v1 system typography tokens; component CSS contains no
  raw type metrics.
- Text inherits content color, performs no font fetching or runtime style-tag
  injection, and lets normal consumer CSS override presentation.
- Default, custom, and nested theme scopes prove token consumption; SSR and
  hydration remain deterministic.
- Accessibility tests prove native semantics are preserved and visual roles do
  not manufacture headings, labels, links, or keyboard stops.
- Documentation, current primary-source links, example, public exports,
  production stylesheet coverage, and inventory agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
