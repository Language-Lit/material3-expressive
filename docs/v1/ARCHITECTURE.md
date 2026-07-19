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

## Styling

Component CSS is authored beside the component. `src/v1/styles/styles.css`
assembles the complete supported stylesheet in a fixed cascade-layer order.
Tokens and public selectors use the `m3e` namespace. Components use literal,
searchable class names and stable `data-*` states.

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
