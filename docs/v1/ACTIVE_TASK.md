# Active v1 task

## T02 — Token schema and default data

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Define canonical typed schemas for color, typography, shape, motion,
  elevation, state, density, and component-token registrations.
- Trace default data to current first-party Material sources with URLs and access
  dates.
- Provide complete light and dark system color roles with contrast validation.
- Keep default token data immutable and serializable with runtime validation.
- Generate deterministic namespaced `--m3e-ref-*`, `--m3e-sys-*`, and registered
  `--m3e-comp-*` CSS custom properties.
- Establish the component-token registration contract without guessing component
  values that belong to later component tasks.

React components, providers, framework APIs, private downstream application concepts, and legacy
implementation changes are out of scope.

### Expected files

- `src/v1/tokens/`, `src/v1/types/`, and `src/v1/styles/`.
- Token-focused tests under `tests/v1/tokens/`.
- Deterministic token generation and validation scripts.
- Token provenance documentation and a cross-cutting architecture decision
  record.
- Package configuration and recorded bundle budgets where the new public token
  surface requires them.

### Acceptance checks

- Token schemas cover every approved theme domain and reject incomplete,
  malformed, non-serializable, or unresolved data.
- The default data passes validation, is deeply immutable, and can be serialized
  deterministically.
- Light and dark color schemes contain the required Material roles and satisfy
  documented role-pair contrast requirements.
- Generated CSS is reproducible, fully namespaced, and contains no unresolved
  custom-property references.
- Component-token registrations are typed, validated, deterministic, and empty
  by default until component tasks provide sourced values.
- Public type declarations remain framework-neutral and do not expose a
  validation-library implementation.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
