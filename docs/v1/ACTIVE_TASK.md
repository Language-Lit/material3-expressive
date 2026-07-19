# Active v1 task

## T01 — Isolation and build harness

Status: complete
Approved: 2026-07-19
Completed: 2026-07-19

### Scope

- Create an isolated `src/v1` build and independent stylesheet.
- Add only the approved additive v1 package exports.
- Capture and continuously verify the frozen legacy contract.
- Establish documented and machine-enforced v1 module boundaries.
- Add a machine-readable public component inventory.
- Add framework-neutral Vite and Next.js consumer build fixtures.
- Pin browser support and record initial package-size budgets.

private downstream application remains an unchanged external consumer. Its domain models and
application APIs must not shape v1 core.

### Expected files

- Root contributor, package, TypeScript, build, test, and CI configuration.
- `src/v1/`, `tests/v1/`, `playground/v1/`, and generic consumer fixtures.
- `docs/v1/`, architecture decision records, and verification scripts.

Legacy implementation files and the private downstream application repository are out of scope.

### Acceptance checks

- Existing typecheck and tests remain green.
- v1 builds as an isolated entry with independent CSS.
- Existing package exports, public TypeScript surface, legacy CSS, and
  representative legacy renders match their committed baselines.
- The packed package exposes the approved v1 entries and builds in Vite and
  Next.js fixtures.
- Architecture boundaries and the component inventory validate.
- Browser support and initial bundle budgets are recorded and enforced in CI.
- One aggregate command runs the complete T01 gate.

### Completion evidence

`npm run verify:v1` passes all ten gates with 68 tests, frozen legacy
package/type/CSS/render contracts, packed Vite and Next.js builds, the frozen
legacy-consumer build, architecture and browser checks, and bundle budgets.

The published runtime dependency audit reports zero known vulnerabilities.
Development tooling has one accepted low-severity esbuild advisory affecting a
Windows development-server scenario; current Vite and tsup both constrain
esbuild below the advisory's patched breaking release. No development server is
used by CI or package consumers.
