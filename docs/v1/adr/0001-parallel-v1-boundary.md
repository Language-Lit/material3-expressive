# ADR 0001: Parallel v1 boundary

Status: accepted
Date: 2026-07-19

## Context

The published package has an existing legacy API used by pinned consumers. v1 is
a ground-up, general-purpose Material 3 Expressive implementation and must be
developed without changing those consumers or inheriting application-specific
contracts.

## Decision

All new runtime code lives under `src/v1/`. Before the separately approved stable
cutover, consumers access it only through additive `./v1` and
`./v1/styles.css` exports. Legacy runtime, type, export-map, and CSS contracts are
captured by executable baselines.

v1 cannot import legacy implementation files. Reusable ideas must be
reimplemented against the v1 specification and sources of truth rather than
coupled across the boundary.

## Consequences

- Legacy consumers remain unaffected until they deliberately update.
- Temporary duplication is acceptable when it preserves the boundary.
- Package and CI configuration must build and verify two independent surfaces.
- Next.js and Vite may exist as development-only consumer fixtures; neither is a
  runtime dependency or public API dependency of the React library.
- Redirecting the stable package root is a later, explicitly approved task.
