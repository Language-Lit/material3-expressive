# Material 3 Expressive React v1 Specification

Status: Draft approved for task-by-task implementation
Specification date: 2026-07-19
Target release: `1.0.0`
Legacy release: `0.3.0`

This document defines the product, architecture, compatibility boundary, quality
bar, migration gate, and implementation order for the v1 rewrite of
`@language-lit/material3-expressive`.

The terms **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** describe
normative requirements.

## 1. Safety and compatibility boundary

Private downstream applications must continue using their currently installed
library until their owners explicitly start a migration.

A downstream consumer is not the product definition for v1. Consumer usage may
inform private migration planning, but it MUST NOT determine the core
architecture, public component APIs, naming, theme model, or supported scope.
The package must remain independently useful to all React developers.

### 1.1 Verified consumer isolation

Consumer dependency revisions, repository paths, import inventories, and
migration plans are private consumer data and MUST NOT be recorded in this
public repository. Compatibility is enforced against the package's own public
legacy contract rather than against a private application's source tree.

During v1 development:

- No private consumer repository may be read or modified as part of a public
  library task.
- The legacy package root and all existing subpath exports must keep their current
  runtime and type behavior.
- The legacy `./styles` export must not import v1 styles.
- Existing token files, components, hooks, utilities, provider behavior, and the
  Tailwind preset must remain frozen unless a separately approved legacy fix is
  required.
- A v1 implementation must not be re-exported from the package root before the
  final migration gate.

### 1.2 Parallel v1 boundary

All new implementation work MUST live under an isolated namespace:

```text
src/v1/
  index.ts
  components/
  internal/
  motion/
  styles/
  theme/
  tokens/
  types/

tests/v1/
playground/v1/
```

Before the final migration, the only allowed package-facing additions are:

```text
@language-lit/material3-expressive/v1
@language-lit/material3-expressive/v1/styles.css
```

These are additive exports. Existing exports such as `.`, `./components/buttons`,
`./styles`, and `./tailwind-preset` MUST continue pointing to the legacy build.

The v1 stylesheet MUST be independent. Importing legacy CSS must not load v1 CSS,
and importing v1 CSS must not overwrite legacy selectors or legacy token names.

### 1.3 Legacy contract guard

The first implementation task MUST capture and continuously verify:

- The names and types of all legacy package exports.
- The existing package subpath map.
- A representative render snapshot for each legacy component group.
- The legacy stylesheet output.
- A representative build fixture that imports the public legacy package API.

Additive `./v1` exports are allowed. Any other contract difference must fail CI.

### 1.4 Migration authority

Only a downstream application's owner can authorize changes in that
application. Readiness of the library does not grant that permission.

## 2. Product definition

v1 is a general-purpose React implementation of Material 3 Expressive for the
web. It is not a direct Android Compose port, and it must respect native HTML and
web accessibility behavior where platforms differ. It is an independent design
system library rather than an extraction of any one application's component
layer.

### 2.1 Goals

v1 MUST provide:

- A coherent expressive theme covering color, typography, shape, motion,
  elevation, state, and density.
- Generic, composable React components rather than consumer domain models.
- Correct native and ARIA semantics.
- Complete keyboard, focus, form, RTL, reduced-motion, and forced-colors behavior.
- Server rendering and hydration support.
- Precompiled styles that work without consumer Tailwind configuration.
- Light, dark, system, custom, and nested theme scopes.
- Explicitly documented Material conformance and documented web deviations.
- A truthful supported-component matrix.

### 2.2 Non-goals

v1 core MUST NOT:

- Own application routing, URLs, image optimization, localization, or data models.
- Require consumers to scan library source or distribution files with Tailwind.
- Require a particular React framework.
- Couple visual typography roles to HTML heading structure.
- Bundle consumer-specific recipes, assets, domain models, or workflows as
  Material primitives.
- Claim support for components that have not passed the release gates in this
  specification.

### 2.3 Platform support

- React 18 and React 19 are supported.
- React Server Components may import types and server-safe modules; interactive
  components must declare their client boundary.
- Next.js SSR and a framework-neutral Vite application are mandatory fixtures.
- The concrete browser support matrix will be pinned in Task 01 and enforced in
  CI rather than expressed as an untested `browserslist` promise.

## 3. Sources of truth

Implementation decisions MUST be traceable to:

1. Google's Material 3 and Material 3 Expressive documentation and first-party
   component APIs.
2. Google's Material 3 Expressive research and design guidance.
3. Native HTML behavior and web platform specifications.
4. WCAG 2.2 AA.
5. WAI-ARIA Authoring Practices for composite widget behavior.

Primary references:

- Material 3 package reference:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/package-summary>
- Material expressive theme:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/MaterialExpressiveTheme.composable>
- Material motion schemes:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/MotionScheme>
- Material expressive shapes:
  <https://developer.android.com/reference/kotlin/androidx/compose/material3/MaterialShapes>
- WCAG 2.2:
  <https://www.w3.org/TR/WCAG22/>
- ARIA Authoring Practices:
  <https://www.w3.org/WAI/ARIA/apg/>

The component conformance record MUST include the URL and access date of its
normative Material references because expressive APIs are still evolving.

When Material platform guidance conflicts with native web semantics, the web
semantic requirement wins and the visual/behavioral adaptation must be recorded.

## 4. Conformance model

Each component has a conformance record stored with its tests. The record MUST
cover:

- Material name and supported specification version.
- Anatomy and slots.
- Variants, sizes, widths, and color roles.
- Enabled, disabled, hovered, focused, pressed, selected, checked, indeterminate,
  loading, and error states where applicable.
- Shape and shape transitions.
- Motion and reduced-motion behavior.
- Component token mapping.
- DOM structure and native behavior.
- Accessible name, description, role, state, and keyboard interaction.
- Bidirectional and adaptive behavior.
- Known web-specific deviations.

Conformance statuses are:

- `planned`: no supported implementation.
- `experimental`: implementation exists but has not passed all gates.
- `conformant`: all required gates pass.
- `deprecated`: supported only for migration.

Only `conformant` components may appear in stable v1 documentation.

## 5. Distribution and styling contract

### 5.1 Consumer contract

The minimum setup must be:

```tsx
import { Button, Material3Provider } from
  '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'
```

No Tailwind preset, content glob, runtime style injection, or additional base CSS
may be required.

### 5.2 CSS architecture

- v1 uses authored CSS plus CSS custom properties.
- CSS is compiled and minified as a library-owned build artifact.
- Public classes and variables use an `m3e` namespace.
- Token variables use three layers: `--m3e-ref-*`, `--m3e-sys-*`, and
  `--m3e-comp-*`.
- Component class names use `m3e-<component>`.
- Styles use cascade layers with a documented order.
- Component styles must not contain application selectors or global element
  resets.
- All dimensions must use valid web units. Material `dp` dimensions map to CSS
  pixels at the component-token boundary; `dp` is never emitted as a CSS unit.
- Components must not construct CSS class names dynamically.
- Raw palette colors, radii, shadows, and animation timing values are forbidden
  inside component styles when a token exists.

### 5.3 Style entry points

v1 ships:

- One complete `v1/styles.css` entry point.
- One token-only stylesheet for advanced integrations.
- Optional component styles only if they can be made dependency-complete and
  reliably tree-shaken.

The complete stylesheet is the normative supported path for v1.0.

### 5.4 Repository architecture and agentic maintainability

The v1 repository structure MUST optimize for safe work by both human and
agentic contributors. A contributor should be able to locate a component's
implementation, public types, styles, tests, conformance evidence, and
documentation without reconstructing implicit conventions from unrelated code.

The architecture MUST provide:

- A documented dependency direction from foundational types and tokens through
  internal primitives, theme and motion services, components, and finally public
  entry points.
- A consistent component directory template and naming scheme. Each component's
  implementation, public props, styles, test suite, conformance record, and
  examples must have an obvious one-to-one location.
- Explicit public barrels. Deep imports into another component's implementation
  or internal files are forbidden.
- Machine-enforced module boundaries so components cannot create hidden cycles,
  reach into legacy code, or bypass public foundation APIs.
- Small, cohesive modules with explicit inputs and outputs. Cross-cutting
  behavior such as event composition, refs, IDs, state attributes, focus,
  presence, positioning, shape interpolation, and motion belongs in named shared
  primitives rather than being copied between components.
- Searchable, stable token and state names. Runtime-generated class names,
  convention-only wiring, and undocumented magic values are forbidden.
- Deterministic, independently runnable checks for types, unit tests, contracts,
  styles, accessibility, SSR, fixtures, and package output, plus one aggregate
  verification command.
- Narrow test commands and fixtures so a contributor can validate one component
  without running the entire project, while CI still runs the complete gate.
- Architecture decision records for choices that affect multiple components or
  constrain future public APIs.
- Repository-level contributor instructions that state the active task, safety
  boundary, dependency rules, file conventions, and required checks without
  relying on chat history.
- A machine-readable component inventory containing ownership path,
  dependencies, conformance status, and public exports. Documentation and
  release claims must be derived from or checked against this inventory.

Abstraction is justified by repeated behavior or a platform requirement, not by
the possibility of future reuse. Agents and humans must be able to change one
component without editing unrelated component internals. Generated files must be
clearly marked and reproducible from a checked-in source.

## 6. Theme architecture

### 6.1 Theme data

The public model is conceptually:

```ts
interface Material3Theme {
  colorSchemes: {
    light: ColorScheme
    dark: ColorScheme
  }
  typography: TypographyScheme
  shapes: ShapeScheme
  motion: MotionScheme
  elevation: ElevationScheme
  state: StateScheme
  density: DensityScheme
}
```

Every field must be serializable and validated. Default theme data is immutable.
Theme extension creates a new theme and must not mutate defaults.

### 6.2 Provider behavior

`Material3Provider` MUST:

- Accept `theme` and `colorMode="light | dark | system"`.
- Scope tokens to its rendered element so nested themes work.
- Render deterministic server markup.
- Avoid unconditional mutation of `document.documentElement`.
- Expose the resolved mode without making components subscribe to the full theme
  object.
- Support a nonce for any optional anti-flash script.
- Apply a complete default theme when no custom theme is supplied.

Framework Link and Image components are not theme data. Framework integration
belongs in separate adapters or explicit component props.

### 6.3 Color

The system MUST include the complete Material color-role set used by supported
components, light and dark defaults, fixed roles where applicable, state layers,
and contrast validation.

A seed-color utility SHOULD generate schemes using the current Material color
algorithm. Consumers may also provide complete schemes directly.

### 6.4 Typography

- All baseline and emphasized Material typography roles are represented.
- Visual role and semantic element are independent.
- Font families, weights, variable axes, tracking, size, and line height are
  themeable.
- Font fetching is not a side effect of rendering `Text`.
- A separate optional font-loading helper may be provided.

### 6.5 Shape

- The complete supported corner scale is themeable.
- Component tokens define container, pressed, selected, checked, and grouped
  shapes.
- Expressive polygon shapes and morph pairs use a shared normalized shape model.
- Shape interpolation is implemented once in an internal primitive rather than
  independently in components.

### 6.6 Motion

The theme MUST expose standard and expressive schemes with semantic fast,
default, and slow spatial/effects specifications.

- Spatial motion controls position, size, and shape changes.
- Effects motion controls opacity and color-like visual effects.
- Components consume semantic motion tokens, never arbitrary durations.
- Spring or spring-equivalent motion is implemented behind an internal adapter.
- Every motion has a reduced-motion outcome that preserves state comprehension.
- Infinite decorative motion stops under reduced motion.

### 6.7 Elevation, state, and density

- Elevation includes shadow and tonal treatment where required by the component.
- Hover, focus, pressed, and dragged state layers use theme tokens.
- Focus indication must remain visible in forced-colors mode.
- v1.0 ships the default Material density. The model may permit future density
  variants, but they must not reduce interactive targets below accessibility
  requirements.

## 7. React component API rules

Every public component MUST:

- Be a named export with an exported props type.
- Forward its ref to the primary semantic element.
- Accept relevant native element props, `className`, `style`, `id`, `data-*`, and
  `aria-*` attributes.
- Compose consumer and internal event handlers without silently replacing either.
- Support controlled and uncontrolled state where both models are meaningful.
- Use stable `data-*` state attributes for styling and testing.
- Avoid exposing its internal animation or positioning implementation.
- Avoid framework-specific types in its core props.
- Have a display name and actionable development warnings for invalid prop
  combinations.

Semantic element rules:

- `Button` renders a `<button>` and defaults to `type="button"`.
- A link styled as a button uses an explicit link component/API rather than
  nesting interactive elements.
- `Text` may accept an `as` prop, but its typography role does not determine the
  element automatically.
- Icon-only controls require an accessible name.
- Form controls participate in forms and use native elements whenever possible.
- Polymorphism must not permit invalid semantics merely for convenience.

## 8. Accessibility requirements

All stable v1 components target WCAG 2.2 AA and MUST satisfy:

- Complete keyboard operation with no keyboard trap.
- Visible focus and correct focus restoration.
- Correct accessible name, description, role, value, and state.
- Native label, error, and description relationships for form controls.
- Minimum 48 by 48 CSS-pixel interaction target for Material controls, allowing
  the visible glyph/container to be smaller where specified.
- Sufficient text, icon, focus, and state contrast.
- No information conveyed only by color or motion.
- Reduced-motion support.
- Forced-colors support.
- Logical properties and RTL keyboard behavior.
- Screen-reader-safe decorative icons.

Dialog, menu, listbox/select, tabs, toolbar, tooltip, and navigation composites
must implement their corresponding APG behavior. ARIA must not replace available
native HTML semantics.

## 9. Initial stable component scope

The v1.0 stable claim covers only the following components once each becomes
`conformant`.

### Foundations

- `Material3Provider`
- `Surface`
- `Text`
- `Icon`

### Actions and containment

- `Button`
- `IconButton`
- `FloatingActionButton`
- `ButtonGroup`
- `SplitButton`
- `Card`

### Selection and input

- `Checkbox`
- `Radio`
- `Switch`
- `SegmentedButtonGroup`
- `TextField`
- `TextArea`
- `Select`

### Feedback and overlays

- `LinearProgress`
- `CircularProgress`
- `WavyProgress`
- `LoadingIndicator`
- `Dialog`
- `Menu`
- `Tooltip`
- `Snackbar`

### Navigation and expressive layout

- `Tabs`
- `NavigationBar`
- `NavigationRail`
- `NavigationDrawer`
- `NavigationSuite`
- `FloatingToolbar`
- `FabMenu`

Additional components such as chips, slider, search, sheets, list items, app bars,
and carousel belong to a documented v1.x scope. Changes to stable core scope
require an independent Material/web product rationale; consumer-specific
migration needs remain outside this public repository.

## 10. Private downstream consumer boundary

Private application inventories and migration plans belong in the application
repository or another access-controlled system. This public repository MUST NOT
record a private consumer's symbol usage, routes, domain models, repository
paths, dependency revisions, compatibility gaps, or migration status.

The public project may document generic legacy-to-v1 mappings for APIs exported
by this package. A consumer-specific need changes v1 only when it independently
qualifies as a generic Material or web primitive through the normal public task
and conformance process.

## 11. Testing and release gates

### 11.1 Per-component gates

A component is `conformant` only when it has:

- Unit tests for public behavior and prop combinations.
- Real user-event interaction tests.
- Keyboard and focus tests.
- Automated accessibility checks.
- Visual snapshots for variants, states, sizes, light/dark, RTL, forced colors,
  and reduced motion as applicable.
- Theme override tests proving it consumes tokens.
- SSR render and hydration coverage.
- A production-build test proving its styles are present.
- A conformance record with primary-source links.
- Documentation and examples.

### 11.2 Package gates

Every v1 pull request or task completion must pass:

- Type checking.
- Unit and interaction tests.
- CSS compilation and validation.
- Legacy contract guard.
- Vite consumer build.
- Next.js SSR consumer build.
- Package export validation.
- Bundle-size budget.

Visual and browser-level gates become mandatory before the first prerelease.

### 11.3 Quality budgets

- Zero serious or critical automated accessibility violations.
- Zero unresolved CSS custom properties in default-theme component fixtures.
- Zero invalid CSS declarations in distributed styles.
- Zero inaccessible interactive elements detected by semantic tests.
- No unapproved change to legacy root exports or legacy CSS.
- Bundle budgets are set from the Task 01 baseline and may change only through a
  recorded decision.

## 12. Documentation requirements

The v1 documentation MUST include:

- Installation without Tailwind.
- Theme creation and nested theme examples.
- SSR and system-color-mode setup.
- A component page containing anatomy, variants, states, accessibility, tokens,
  and code examples.
- A supported-component matrix with conformance status.
- A legacy-to-v1 migration guide.
- A list of deliberate web deviations from first-party platform APIs.
- Versioned release notes and breaking changes.

The phrases “complete”, “comprehensive”, and “correct Material 3 Expressive
implementation” may be used only when qualified by the supported-component
matrix.

## 13. Package migration and release sequence

1. Develop v1 behind additive `./v1` entry points.
2. Publish or tag `1.0.0-next.*` builds without changing legacy root exports.
3. Validate v1 in its independent playground and consumer fixtures.
4. Produce public documentation, release notes, and generic legacy API/token
   mappings without consumer inventories.
5. Run every package, accessibility, browser, SSR, and distribution gate against
   public repository fixtures.
6. Redirect the stable package root to v1 only in a separately approved
   major-release task after prerelease validation.
7. Retain legacy exports under a documented compatibility path for the agreed
   deprecation period.

Package rollback uses the prior published version or release tag. Downstream
application rollback procedures remain private to each consumer.

## 14. Task-by-task implementation order

Only one task is active at a time. Before starting each next task, the implementer
must state its scope, expected files, and acceptance checks, then obtain owner
approval. Once started, the task proceeds without non-blocking clarification; any
important design choice must be resolved at its boundary.

| ID | Task | Required result |
| --- | --- | --- |
| T00 | v1 specification | This document; no runtime changes |
| T01 | Isolation and build harness | `src/v1` build, additive exports, legacy contract guard, architecture boundaries/inventory, Vite/Next fixtures |
| T02 | Token schema and default data | Typed reference/system/component tokens with validation |
| T03 | Theme runtime | Theme creation, provider, color mode, SSR, nested scopes |
| T04 | `Surface` | Foundational color, elevation, shape, and semantic container |
| T05 | `Text` | Baseline/emphasized roles with independent semantics |
| T06 | `Icon` | Accessible icon contract and icon-source adapters |
| T07 | `Button` | Expressive sizes, widths, variants, states, shape and motion |
| T08 | `IconButton` | Expressive sizes, widths, toggle states, accessible naming |
| T09 | `FloatingActionButton` | Standard, medium, large, extended, toggle, elevation behavior |
| T10 | `Card` | Generic filled, elevated, outlined, interactive card primitives |
| T11 | `Checkbox` | Native form, indeterminate, touch target and state behavior |
| T12 | `Radio` | Native form and group behavior |
| T13 | `Switch` | Native form, labels, state shape and motion |
| T14 | `TextField` and `TextArea` | Shared field foundation, labels, errors, descriptions, forms |
| T15 | `SegmentedButtonGroup` | Single/multiple selection and grouped shape behavior |
| T16 | `Dialog` | Modal/non-modal semantics, focus lifecycle and adaptive container |
| T17 | `Menu` and `Select` | Separate menu/listbox semantics, positioning and keyboard behavior |
| T18 | `Tooltip` and `Snackbar` | Accessible transient feedback and timing behavior |
| T19 | `Tabs` | Roving focus, panels, indicator motion and link-safe API |
| T20 | Navigation suite | Bar, rail, drawer and adaptive switching |
| T21 | Progress indicators | Linear, circular and wavy determinate/indeterminate behavior |
| T22 | Expressive loading indicator | Shared polygon shape morphing and reduced-motion fallback |
| T23 | Button groups and split button | Group containment, semantics and expressive interaction |
| T24 | Floating toolbar and FAB menu | Roving focus, expansion motion and adaptive placement |
| T25 | Documentation and prerelease | Complete public docs, generic legacy migration guide, conformance matrix and `next` release candidate |
| T26 | Release readiness audit | All public package, browser, accessibility, SSR and distribution gates green |
| T27 | Stable v1 cutover | Stable root exports changed only after successful prerelease validation and separate approval |

## 15. Definition of project completion

The independent v1 library is complete when its advertised component matrix is
conformant, all public package gates pass, and its documentation truthfully
describes the supported Material 3 Expressive surface. Completion does not
depend on adoption by any particular downstream application.

Stable cutover additionally requires passing Vite and Next.js production
fixtures, publishing an exact generic legacy API/token/CSS migration guide,
testing the package rollback path, and obtaining separate release approval.
