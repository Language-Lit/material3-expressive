# Active v1 task

## P01 — Public repository private-consumer privacy scrub

Status: active
Approved: 2026-07-20

### Scope

Remove sensitive information about private downstream applications from the
public repository while preserving the public package identity
`@language-lit/material3-expressive`.

- Generalize compatibility and isolation rules so they describe any private
  downstream consumer without naming an application.
- Remove exact private dependency revisions, application import inventories,
  internal domain/recipe examples, and application-specific migration tasks.
- Keep public package API names, legacy contract fixtures, and the independent
  v1 product roadmap intact.
- Rewrite only the commits in `origin/main..main`, which have not been pushed,
  so sensitive content is absent from publishable history rather than merely
  deleted by a later commit.

### Expected files

- `docs/V1_SPEC.md`, `AGENTS.md`, and `docs/v1/ARCHITECTURE.md`.
- Public component documentation, conformance records, ADRs, or tests that name
  the private application despite needing only a generic boundary statement.
- A public-boundary ADR if needed; no component or legacy runtime source changes
  are expected.
- The unpushed Git history from `origin/main` through the current v1 work.

### Acceptance checks

- The public package scope remains unchanged, while the current tree contains
  no private application name, repository path, exact consumer revision,
  application import inventory, or internal migration plan.
- Every commit reachable from `main` but not `origin/main` passes the same
  sensitive-pattern audit; `origin/main` itself is not rewritten.
- The final tree preserves the v1 implementation and generic legacy-compatibility
  boundary, has no unintended runtime diff from the pre-scrub tree, and passes
  the focused documentation checks plus `npm run verify:v1`.
