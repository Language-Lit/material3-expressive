# Generic legacy-to-v1 migration

This guide maps public package contracts. It intentionally contains no
application-specific imports, routes, data models, dependency revisions, gap
analysis, or rollout status.

## Coexistence boundary

The prerelease keeps the package root and every existing subpath on the frozen
legacy implementation. v1 is additive, so both surfaces can be installed from
one package version while migration happens in an application-owned branch.

| Legacy contract | v1 contract |
| --- | --- |
| `@language-lit/material3-expressive` | `@language-lit/material3-expressive/v1` |
| `@language-lit/material3-expressive/styles` | `@language-lit/material3-expressive/v1/styles.css` |
| Component-group subpaths | Named exports from `/v1` |
| `tailwind-preset` plus package content glob | No v1 equivalent or requirement |
| Legacy provider for link/image adapters | v1 theme-scoping `Material3Provider` |
| Legacy hooks and utilities | Use only explicitly exported v1 theme/token/component APIs |

Do not mix legacy and v1 styles as if their tokens were interchangeable. They
are deliberately independent surfaces.

## Setup changes

1. Install a `1.0.0-next.*` candidate in an isolated migration branch.
2. Import `/v1/styles.css` once without a Tailwind content glob or preset.
3. Render `Material3Provider`; select `light`, `dark`, or `system` mode.
4. Move custom design values into `createTheme`/`extendTheme` data rather than
   legacy CSS or Tailwind configuration.
5. Replace components by semantic area and verify forms, keyboard behavior,
   focus, RTL, forced colors, reduced motion, SSR, and production CSS.
6. Remove legacy styles only after no legacy component remains in that rendered
   surface.

## Common public concept mappings

| Legacy concept | v1 direction |
| --- | --- |
| `Button`, `IconButton` | Use the same named v1 concepts with native button/form semantics and new variant/size contracts. |
| `FAB` | Use `FloatingActionButton`; momentary, extended, and toggle modes have explicit prop shapes. |
| Name-based `Icon` registry | Pass a Material Symbols ligature or an SVG source to v1 `Icon`; font delivery remains consumer-owned. |
| `Input` | Use `TextField`; choose filled/outlined styling through its public variant. |
| `TextArea` | Use v1 `TextArea`, which shares TextField chrome and preserves native vertical resizing. |
| `SegmentedButtons` | Use data-driven `SegmentedButtonGroup` in single or multiple mode. |
| `Modal` | Use `Dialog`; choose modal or non-modal behavior and follow its controlled open lifecycle. |
| Legacy menu/select components | Use v1 `Menu` for APG menu semantics and v1 `Select` for combobox/listbox semantics. |
| `Tabs`, `TabItem`, `TabsContainer` | Use one data-driven v1 `Tabs` component with link-safe items and optional panels. |
| Navigation bar/rail/drawer | Use the shared `NavigationItem` shape or `NavigationSuite` for adaptive switching. |
| Linear/circular progress | Use v1 `LinearProgress`/`CircularProgress`; omit `value` for indeterminate mode. `WavyProgress` is the Expressive treatment. |
| Theme/font loader hooks | Create serializable theme data through `/v1/theme`; font loading remains application-owned. |

Consult the [supported-component matrix](SUPPORTED_COMPONENTS.md) and each linked
page for exact props. Similar names do not promise prop-level compatibility.

## Public legacy APIs without a v1.0 primitive

The legacy package includes utilities and application-level presentation
patterns that are not Material primitives in the v1.0 matrix. Keep those on the
legacy surface, replace them with application composition, or propose a future
generic component through the public task process. Their existence does not
expand the advertised v1 surface.

Examples include legacy-only data/display recipes, framework adapter context,
and hooks that load application fonts or themes. Do not copy those contracts
into v1 core merely to make a private migration one-to-one.

## Breaking changes when opting into v1

- Imports move to explicit `/v1` entry points.
- CSS moves to the `m3e` namespace and does not consume legacy/Tailwind tokens.
- `Material3Provider` scopes themes on a real `div`; it no longer owns framework
  link or image adapters.
- Components favor native elements and APG semantics over ported application or
  Compose roles.
- Stateful composites use explicit controlled/uncontrolled value callbacks and
  data arrays rather than legacy child or router coupling.
- Icons do not bundle a registry or font loader.
- Only the generated conformant matrix is a support promise.

## Validation and rollback

Run the application's own typecheck, tests, accessibility checks, SSR build, and
production bundle after each migrated area. Public package validation is
`npm run verify:v1` in this repository.

Before stable cutover, rollback means restoring the previous package version and
legacy imports/styles in the consumer's own change. Consumer-specific rollout
and rollback procedures belong outside this public repository.
