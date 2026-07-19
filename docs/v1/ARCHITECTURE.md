# v1 architecture

## Product boundary

v1 is a framework-neutral React implementation of Material 3 Expressive for
general use. private downstream application is a protected downstream consumer and later migration
target; it is not an architectural layer or API source.

React and React DOM are the only framework peers. Next.js and Vite are
development fixtures used to prove portability in an SSR framework and a
framework-neutral client application. v1 source, runtime dependencies, public
types, and public APIs must not import or expose either fixture framework.

## Dependency direction

Dependencies flow downward only:

```text
public entry points
        |
components and providers
        |
theme and motion services
        |
internal web/React primitives
        |
serializable types and token data
```

- `types/` and `tokens/` must not depend on React, DOM globals, components, or
  legacy source.
- `internal/` may depend on v1 types and tokens.
- `theme/` and `motion/` may depend on types, tokens, and internal primitives.
- `components/` may depend on those foundation layers. A component may consume
  another component only through that component's public `index.ts`.
- `index.ts` assembles the public API and must not contain implementation logic.
- Nothing in `src/v1/` may import from legacy `src/` paths outside `src/v1/`.

The `check:v1:architecture` command enforces the rules that can be checked
statically without interpreting component behavior.

## Token foundation

`src/v1/tokens/schema.ts` is the canonical inventory for every foundation token
domain and path. Runtime validation, reference resolution, public types, default
data, and CSS generation derive from that inventory. Token data stays JSON-like,
and parsing returns an independent deeply frozen value.

Defaults live in one file per domain under `src/v1/tokens/defaults/`. Source
revisions and web adaptations are recorded in `docs/v1/TOKEN_PROVENANCE.md` and
cross-cutting policy in ADR 0002. A later component task adds tokens through the
typed component registry only after recording its primary Material source; the
default registry stays empty otherwise.

Foundation paths use canonical dot notation in TypeScript and deterministic
namespaced custom properties in CSS:

```text
ref.palette.primary-40          -> --m3e-ref-palette-primary-40
sys.color.light.primary         -> --m3e-sys-color-primary (light scope)
sys.motion.expressive.fast.*    -> --m3e-sys-motion-expressive-fast-*
comp.button.container.color     -> --m3e-comp-button-container-color
```

This mapping is centralized rather than repeated in component code. The build
regenerates token CSS from the validated public default and checks it byte for
byte, so contributors do not manually edit generated output.

## Theme runtime

`src/v1/theme/theme.ts` is the only conversion boundary between public
`Material3Theme` data and `FoundationTokenSet`. Theme creation and extension
merge plain data, then validate and deep-freeze a detached result. This keeps
React, browser globals, and provider concerns out of server-safe theme data.

`Material3Provider/` renders the `.m3e-theme` token scope. The generated token
stylesheet assigns a complete default foundation to both the root and provider
scopes, while inline custom properties contain only validated differences.
Light/dark aliases let CSS media queries resolve custom system themes before
hydration. React tracks that browser preference only for the resolved-mode
context, which is separate from the theme context.

The main `./v1` entry is a client boundary. `./v1/theme` and `./v1/tokens` are
React-free data entries for SSR and server modules. Architecture checks protect
those files from React imports and protect the entire theme layer from upward
component imports. ADR 0003 records the full decision and measured cost.

## Component layout

Every public component uses the same mirrored layout:

```text
src/v1/components/ComponentName/
  ComponentName.tsx
  ComponentName.types.ts
  ComponentName.css
  index.ts

tests/v1/components/ComponentName/
  ComponentName.test.tsx
  ComponentName.ssr.test.tsx
  ComponentName.a11y.test.tsx
  ComponentName.conformance.md

playground/v1/examples/ComponentName.example.tsx
```

Files may be added when behavior genuinely needs separation, but the canonical
files keep discovery predictable. Private helpers remain inside the component
directory. Cross-component behavior moves to a named `internal/` primitive only
when it represents a shared web/platform rule or has at least two real users.

Tests normally import from the component's public `index.ts`; package and
consumer tests import from the v1 package entry. Conformance records contain
primary Material references, access dates, supported states, tokens, semantics,
keyboard behavior, and documented web deviations.

`Surface` establishes the containment boundary for later component tasks. It is
passive and accepts only a bounded set of non-interactive block/landmark
elements. Components that own click, selection, toggle, focus, or form behavior
must keep that behavior in their own semantic implementation rather than making
Surface polymorphic to an interactive element. ADR 0004 records the elevation,
color-pairing, and semantic decisions.

`Text` establishes the typography/semantics boundary. Its visual `variant` and
Expressive `emphasis` map literally to system type-scale tokens, while a bounded
native `as` prop alone determines document semantics. It inherits content color
and does not fetch fonts, generate token names, or subscribe to theme context.
The explicit 30-style CSS table keeps every baseline/emphasized mapping
searchable and distribution-checkable. ADR 0005 records the public contract.

## Styling

Component CSS is authored beside the component. `src/v1/styles/styles.css`
assembles the complete supported stylesheet in a fixed cascade-layer order.
Tokens and public selectors use the `m3e` namespace. Components use literal,
searchable class names and stable `data-*` states.

The authored style entry imports colocated component CSS with relative paths.
The style build recursively inlines imports contained by `src/v1`, rejects
cycles and path escapes, appends generated token CSS, and emits one compiled
artifact. Source checks validate import boundaries; distribution checks require
every custom-property reference to resolve in the assembled file.

Legacy and v1 styles never import one another. v1 does not reset global elements
or emit application selectors.

## Public inventory

`docs/v1/component-inventory.json` is the source of truth for public component
names, owner paths, task IDs, dependencies, conformance status, and exports. A
planned entry makes no support claim. Only conformant entries may be presented as
stable in generated documentation.

## Decisions and generated output

Cross-cutting decisions live in `docs/v1/adr/`. Generated files must identify
their source and regeneration command. CI reproduces and compares contract
artifacts rather than accepting manually edited output.
