# Active v1 task

## T25 — Documentation and prerelease

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Complete the public v1 documentation and prepare a validated `1.0.0-next.*`
package candidate without publishing, tagging, or redirecting stable package
root exports.

- Document installation without Tailwind, theme creation and nesting, SSR and
  system color mode, supported components, accessibility, tokens, and public
  examples.
- Publish a generic legacy-to-v1 migration guide, deliberate web deviations,
  versioned release notes, and breaking changes using only public package
  contracts.
- Derive or validate support claims against
  `docs/v1/component-inventory.json`; only conformant components may be
  presented as supported.
- Prepare prerelease package metadata and validate the packed candidate while
  keeping legacy root/subpath behavior frozen and v1 available only through its
  additive exports.
- Preserve ADR 0025: private consumer identities, repositories, revisions,
  imports, domains, compatibility gaps, and migration plans remain outside this
  repository.

### Expected files

- Public entry documentation such as `README.md` and focused guides under
  `docs/v1/`.
- Existing public component pages and conformance/inventory documentation where
  truthful support claims or navigation require updates.
- Documentation/release validation scripts and package scripts where needed.
- `package.json` and `package-lock.json` for the prepared prerelease version;
  generated package artifacts must not be hand-edited or committed.
- No legacy or v1 component runtime changes are expected.

### Acceptance checks

- A new consumer can install v1, import its complete stylesheet, configure
  default/custom/nested themes, and use SSR/system mode from public docs alone.
- Every conformant inventory component has a discoverable public page covering
  anatomy, variants/states, accessibility, tokens, and an example; documented
  support claims match the machine-readable inventory.
- The generic migration guide maps public legacy entry points, CSS/tokens, and
  concepts to v1 without including any private-consumer information.
- Web deviations, release notes, breaking changes, and prerelease limitations
  are explicit, including the unchanged legacy root and non-publication status.
- Focused documentation/release checks and `npm run verify:v1` pass against the
  prepared package candidate. Publishing, tagging, and stable-root cutover are
  out of scope.
