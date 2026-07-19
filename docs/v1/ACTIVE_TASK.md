# Active v1 task

## T04 — Surface

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement `Surface` as the non-interactive visual and semantic container
  foundation for v1 components and consumer layouts.
- Support explicit, bounded semantic polymorphism, forwarded refs, native
  attributes, Material container/content color pairs, elevation levels, and
  shape roles.
- Consume only theme-backed system and registered component tokens through
  stable namespaced selectors and state attributes.
- Keep server markup deterministic and preserve consumer-provided class names,
  styles, event handlers, ARIA attributes, and data attributes.
- Document the deliberate web adaptation from Compose's rendering model to
  native HTML and CSS.

Interactive surface overloads, clickable or selectable behavior, arbitrary
custom elements, application layout recipes, `Card`, private downstream application integration,
and legacy implementation changes are out of scope.

### Expected files

- `src/v1/components/Surface/` and the v1 component/public barrels.
- Surface token registration in the v1 token defaults and generated stylesheet
  assembly support.
- Surface tests and conformance evidence under
  `tests/v1/components/Surface/`.
- A mirrored example under `playground/v1/examples/` and playground usage.
- Surface documentation, architecture notes where needed, and the component
  inventory status.
- Vite/Next consumer fixture coverage and any explicit bundle-budget update
  justified by the new public component.

### Acceptance checks

- The default element and each supported semantic element render without
  adding inferred roles, focusability, or interaction behavior.
- Public props are framework-neutral, preserve relevant native attributes, and
  forward a correctly typed ref to the rendered element.
- Every supported container color selects its documented Material content
  color; elevation and shape values resolve through v1 tokens with no raw
  palette, radius, or shadow values in component CSS.
- Surface styles clip content to their shape, keep elevation visual-only, and
  expose stable `data-m3e-*` attributes for color, elevation, and shape.
- Default, custom, light/dark, and nested theme scopes prove token consumption;
  SSR and hydration remain deterministic.
- Accessibility and interaction tests prove the passive container adds no
  keyboard or pointer contract and preserves consumer semantics.
- Documentation, conformance source links, example, public exports, production
  stylesheet coverage, and inventory agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
