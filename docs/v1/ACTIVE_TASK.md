# Active v1 task

## T03 — Theme runtime

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Define the public Material 3 theme model as a validated, serializable view of
  the v1 reference, system, and component tokens.
- Provide immutable default-theme creation and extension without mutating a base
  theme or the token defaults.
- Implement `Material3Provider` with light, dark, and system color modes,
  element-scoped tokens, nested scopes, and a complete default theme.
- Keep server markup deterministic and subscribe to the browser color preference
  through React's SSR external-store contract.
- Separate theme and resolved-mode contexts so mode consumers do not subscribe
  to the complete theme object.
- Provide an optional nonce-bearing initialization script without mutating the
  document root.

Seed-color generation, framework adapters, application persistence, private downstream application
integration, public components beyond the provider, and legacy implementation
changes are out of scope.

### Expected files

- `src/v1/theme/`, including the canonical `Material3Provider/` ownership path.
- Theme/provider tests under `tests/v1/theme/`.
- v1 public exports, generated token CSS support, and Vite/Next consumer fixture
  coverage required by the provider.
- Theme architecture documentation, an ADR, inventory status, and any explicit
  bundle-budget updates justified by the new public runtime.

### Acceptance checks

- Theme parsing, creation, and extension reject incomplete or malformed data and
  return independent deeply frozen themes.
- Provider tokens are scoped to its own rendered element; nested providers do
  not mutate or overwrite an ancestor or `document.documentElement`.
- Server output is deterministic, hydration begins from the same configured
  fallback, and system mode responds to `prefers-color-scheme` changes.
- Light, dark, and system styling works from the static v1 stylesheet, including
  custom and nested themes, without a required runtime stylesheet injection.
- Theme and resolved-mode consumers use distinct contexts; omitting `theme`
  applies the complete default.
- The optional initialization script is absent by default and carries the
  supplied nonce when enabled.
- Public declarations remain React-generic and framework-neutral; no Next.js,
  Vite, private downstream application, or legacy types leak into the v1 API.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures, CSS
  checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
