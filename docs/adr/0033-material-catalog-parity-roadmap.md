# ADR 0033: Primitive-first Material catalog parity roadmap

Status: accepted
Date: 2026-07-24
Task: T41

## Context

The library's inventory and generated support matrix correctly describe what is
conformant today, but the specification previously named only a few deferred
1.x families. That was insufficient as a long-range completion boundary:
official component pages also contain composite widgets and composition
specimens, such as expanding lists, that are not captured by counting exported
primitives.

Adding every specimen as a React export would create unnecessary abstractions.
Leaving specimens out of the roadmap would make “all components” impossible to
review. The project therefore needs separate truths for shipped conformance,
future catalog coverage, and non-exported recipes.

The rendered Material 3 Components index was accessed on 2026-07-24. It showed
36 top-level families; its `all-buttons` route was an aggregate rather than an
additional family.

## Decision

1. The [Material catalog parity
   roadmap](../MATERIAL_CATALOG_ROADMAP.md) is the canonical future-coverage
   ledger. Every family on the source-dated official index receives exactly one
   row and a current roadmap disposition.
2. `docs/component-inventory.json` remains the only machine-readable source of
   public component conformance. A roadmap row cannot make a support claim or
   appear as stable documentation.
3. Roadmap delivery is classified as primitive, composite, mixed, or tested
   recipe. A Material specimen becomes a public API only when it owns reusable
   behavior or semantics that composition cannot supply cleanly.
4. The remaining primitive tranche is completed before new composite runtime
   implementation. Composite implementation is followed by partial-family and
   recipe closure, then a full catalog refresh.
5. Every future family task freezes first-party sources and accounts for every
   documented/API/tested variant, state, token, behavior, and composition as a
   public API, tested recipe, native-web adaptation, or concrete exclusion.
6. Catalog-level exclusions require owner approval and an ADR. Deferral is
   represented as Planned or Partial, never as Excluded.
7. Project completion now distinguishes supported-matrix completion from full
   catalog parity. The latter requires no Planned or Partial catalog rows and no
   unclassified family-ledger entries.

## Consequences

- The long-range scope is finite, source-dated, reviewable, and linked from the
  normative specification, architecture, and documentation index.
- Expanding lists and similar official compositions cannot be forgotten merely
  because their underlying primitive exists.
- Recipes receive verification without inflating the public export map.
- Newly added or removed Material families require an explicit roadmap refresh
  rather than silently changing the meaning of “complete.”
- T41 changes documentation and governance only. It adds no support claim,
  inventory row, token, runtime code, export path, dependency, or release.
