# Active v1 task

## T06 — Icon

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Implement `Icon` as a passive, framework-neutral Material icon foundation for
  React consumers.
- Support SVG React component sources and Material Symbols glyph sources without
  owning a vendor icon registry, loading a font, or importing a framework.
- Make decorative versus meaningful semantics explicit: decorative icons are
  hidden from assistive technology by default, while standalone meaningful icons
  require an accessible label and expose one image role.
- Apply inherited Material content color, a sourced 24px default size, consumer
  sizing, and the current Material Symbols `FILL`, `wght`, `GRAD`, `opsz`, and
  Expressive `ROND` axes through stable component variables.
- Preserve consumer classes, styles, non-semantic native attributes, data
  attributes, and a forwarded `HTMLSpanElement` ref while keeping visual source
  content out of the accessibility tree.
- Provide explicit opt-in RTL mirroring for directional artwork and keep icon
  interaction in later purpose-built controls.
- Document the web adaptation from Compose painter/vector sources to React SVG
  source components and consumer-owned Material Symbols fonts.

An icon-name registry, bundled icon set, font fetching, `@font-face`, arbitrary
image rendering, animated state transitions, icon-button behavior, Next/Vite
runtime adapters, private downstream application integration, and legacy implementation changes
are out of scope.

### Expected files

- `src/v1/components/Icon/`, the v1 component/public barrels, complete style
  assembly, and sourced Icon component-token defaults.
- Icon behavior, accessibility, theme, CSS, SSR, and conformance evidence under
  `tests/v1/components/Icon/`.
- A mirrored example under `playground/v1/examples/` and playground usage.
- Icon documentation, a public-API ADR, architecture/provenance notes, and the
  component inventory status/exports.
- Vite/Next consumer fixture coverage and an explicit bundle-budget update only
  if justified by measured output.

### Acceptance checks

- SVG component and Material Symbols glyph sources render through one stable,
  framework-neutral contract; the library ships no icon registry, icon font, or
  network behavior.
- Decorative icons are the default and expose no accessible image; meaningful
  icons require a non-empty label, expose exactly one named `img` role, and keep
  source markup hidden from assistive technology.
- The root remains a passive `span`, forwards an `HTMLSpanElement` ref, preserves
  supported native consumer props, and adds no focusability, click behavior, or
  interactive ARIA state.
- Default size, inherited `currentColor`, SVG sizing, symbol font family, and all
  five current Material Symbols axes resolve through stable component variables;
  explicit consumer values stay deterministic and theme defaults stay scoped.
- Optical size tracks visual size within the sourced 20–48 design range unless
  explicitly selected, and invalid numeric axis/size combinations produce
  actionable development warnings without changing server markup.
- RTL mirroring occurs only when explicitly requested; source direction,
  reduced-motion behavior, and forced-color behavior remain predictable.
- Default, custom, and nested theme scopes prove token consumption; SSR and
  hydration remain deterministic and rendering injects no styles.
- Documentation, current primary-source links, example, public exports,
  production stylesheet coverage, and inventory agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
