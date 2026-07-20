# Repository instructions

## Required context

Before changing v1, read:

1. `docs/V1_SPEC.md`
2. `docs/v1/ACTIVE_TASK.md`
3. `docs/v1/ARCHITECTURE.md`
4. The ADRs relevant to the change in `docs/v1/adr/`

The specification is normative. Only the task recorded in `ACTIVE_TASK.md` may
be implemented. State a new task's scope, expected files, and acceptance checks
and obtain owner approval before changing its status to active.

## Safety boundary

- Private downstream applications are outside this repository. Never record
  their internals here or read/edit their repositories as part of library work.
- Legacy source outside `src/v1/` is frozen unless the owner separately approves
  a legacy fix.
- Before the stable cutover, the package root and existing subpaths remain
  legacy. v1 is exposed only through additive v1 exports.
- Code under `src/v1/` must not import legacy source.

## v1 conventions

- Follow the dependency layers and component layout in
  `docs/v1/ARCHITECTURE.md`.
- Add or update `docs/v1/component-inventory.json` with every public component
  change.
- Public components use named exports and exported props types.
- Do not deep-import another component's private files.
- Keep component behavior, types, styles, tests, conformance record, and example
  in their predictable mirrored locations.
- Prefer explicit, small modules. Share behavior only after it is repeated or is
  required as a platform-wide primitive.
- Record cross-component or public-API decisions in an ADR.
- Do not hand-edit generated artifacts. Regenerate them with the documented
  script.

## Verification

Use the narrowest relevant command while iterating. Before completing a task,
run the aggregate v1 verification command documented in `package.json` and all
task-specific acceptance checks in `docs/v1/ACTIVE_TASK.md`.
