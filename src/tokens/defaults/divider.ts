import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 `DividerTokens` at the pinned T42 revision. The generated
 * file declares exactly two roles and the pinned `Divider.kt` reads both, so
 * this registration has no unread remainder.
 *
 * `thickness` is the source's `DividerDefaults.Thickness`; `color` is
 * `DividerDefaults.color`, which resolves `DividerTokens.Color`
 * (`OutlineVariant`). Both are exposed only as component tokens: the source
 * takes them as per-call `thickness`/`color` parameters, and this library's
 * equivalent of an arbitrary per-instance value is a scoped custom-property
 * override rather than a prop that would have to emit an inline style.
 *
 * `DividerTokens` carries generator version `v0_117` (shared with
 * `RadioButtonTokens` and `ScrimTokens`), while the same revision's
 * `ListTokens`/`ReorderListTokens` — the files T40 pinned, which is why the
 * two ledgers share this revision — are already `29.0.0`. The directory spans
 * 19 generator versions in total; the divider was left behind by the token
 * refreshes and has no expressive shape, elevation, state, or motion role of
 * its own.
 */
export const defaultDividerTokens = {
  component: 'divider',
  task: 'T42',
  source: {
    id: 'androidx-material3-divider',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DividerTokens.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    color: { kind: 'color', value: { $ref: 'sys.color.outlineVariant' } },
    thickness: { kind: 'dimension', value: '1px' },
  },
} as const satisfies ComponentTokenRegistration
