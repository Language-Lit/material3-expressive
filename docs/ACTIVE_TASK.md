# Active v1 task

## T27 — Stable v1 cutover and legacy removal

Status: complete
Approved: 2026-07-21
Completed: 2026-07-21

### Scope

Retire the legacy 0.3 implementation entirely and make v1 the package's only
surface, released as `1.0.0`. The owner approved deletion rather than the
deprecation path previously described in `SPEC.md` §13.7, because the only
consumer of the legacy surface has completed its migration. The legacy 0.3.x
line remains available from its already-published npm versions.

- Delete every legacy source, style, token, playground, fixture, contract
  baseline, and build path outside the v1 tree, including the Tailwind preset.
- Flatten the parallel namespace: `src/` becomes `src/`, `tests/` becomes
  `tests/`, `playground/` becomes `playground/`, and `docs/` becomes
  `docs/`. The `v1` path segment stops existing anywhere in the repository.
- Replace the package export map with root-only entries. `.`, `./theme`,
  `./tokens`, and `./styles.css` become the canonical surface and the `./v1*`
  subpaths are removed rather than aliased.
- Drop all runtime dependencies. The v1 tree imports nothing but `react` and
  `react-dom`, which remain peers. Remove `tailwindcss` as a peer entirely.
- Retire the legacy contract guard, the legacy render/consumer fixtures, and the
  legacy gates in the aggregate verification command; rename the surviving
  `check:v1:*` scripts to unprefixed names.
- Rewrite the specification, architecture, agent instructions, migration guide,
  release notes, and every component page against a single-surface package.
- Publish version `1.0.0`.

### Expected files

- Deleted: `src/{components,context,data,hooks,showcase,styles,types,utils}`,
  `src/index.ts`, `tailwind.preset.ts(.test.ts)`, the legacy `playground/`
  entry files, root `vite.config.ts`, `dist-playground/`,
  `scripts/legacy-contract.mjs`, `tests/contracts/`, and
  `tests/fixtures/legacy-consumer/`.
- Moved: the four `v1` namespaces to their flattened locations, and
  `docs/SPEC.md` to `docs/SPEC.md`.
- Rewritten: `package.json`, `tsup.config.ts`, `tsconfig.json`,
  `vitest.config.ts`, `.github/workflows/ci.yml`, `AGENTS.md`, `README.md`, and
  the `scripts/` gates that encode legacy or `v1`-prefixed paths.
- Added: ADR 0027 recording the cutover, the deletion of the compatibility
  path, and the root-only export decision.

### Acceptance checks

- No file, path, script name, export, or documentation sentence in the
  repository refers to a `v1` namespace or a legacy surface as a live concept.
- The package exports exactly `.`, `./theme`, `./tokens`, and `./styles.css`;
  importing a `/v1` subpath fails as an unexported path.
- `package.json` declares no runtime dependencies and no Tailwind peer, and
  the packed tarball contains no legacy build artifact.
- The specification's compatibility boundary, release sequence, and task table
  describe the completed cutover rather than a pending one.
- The aggregate verification command passes every surviving gate, including
  typecheck, tests, package build, production playground build, architecture,
  docs, browsers, CSS, tokens, bundle budgets, and packed Vite/Next consumer
  fixtures.

### Completion evidence

- 93 legacy source files, the Tailwind preset and its test, the legacy
  playground and its Vite config, `scripts/legacy-contract.mjs`, the three
  frozen contract baselines with their render snapshot, and the legacy consumer
  fixture were deleted. The four `v1` namespaces were flattened with `git mv`,
  so file history is preserved.
- 277 relative import specifiers across 193 test and playground files were
  recomputed against the new depths rather than string-substituted; three
  sibling-test imports that the first pass over-corrected were repaired and
  every relative specifier in `src/`, `tests/`, and `playground/` was verified
  to resolve.
- `npm install` removed 82 packages. `src/` imports nothing but `react` and
  `react-dom`, so all 14 runtime dependencies and the `tailwindcss` peer were
  removed outright rather than trimmed.
- The export map is the closed set `.`, `./theme`, `./tokens`, `./styles.css`.
  `check-architecture.mjs` and `check-release.mjs` both assert it as a closed
  set, so an unapproved addition fails CI.
- `npm run verify` passed all 12 aggregate gates: typecheck, 165 test files and
  942 tests, package build, production playground build, architecture,
  documentation, browsers, CSS, tokens, release contract, every bundle budget,
  and packed Vite/Next consumer fixtures.
- Bundle baselines were re-measured for the single-surface artifacts; the packed
  tarball fell from 433,861 to 306,055 bytes. `dist/styles.css` had under 1%
  headroom against its stale T22 ceiling, so the re-baseline restores the
  recorded 12% allowance. ADR 0027 is the decision record for that change.
- ADR 0027 records the cutover. ADR 0001 is marked superseded and keeps its
  original `src/v1/` paths as history; ADR 0026's Tailwind-peer half is marked
  superseded. Every other ADR retains its text with paths updated in place.
- `component-inventory.json` needed no data change: the cutover altered no
  component name, task ownership, dependency, status, or public export. Only its
  schema `$id` and the ownership path prefixes moved.
