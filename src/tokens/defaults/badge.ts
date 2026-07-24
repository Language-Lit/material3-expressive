import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 `BadgeTokens` at the pinned T43 revision, plus the four
 * geometry constants `Badge.kt` keeps as internal `Dp` values rather than
 * generated roles.
 *
 * The generated file declares eight roles and the pinned `Badge.kt` reads six:
 * `Color` (through `BadgeDefaults.containerColor`), `Size`, `LargeSize`,
 * `Shape`, `LargeShape`, and `LargeLabelTextFont`. The two unread roles are
 * recorded rather than registered by name:
 *
 * - `LargeColor` is `Error`, the same value as `Color`, and the implementation
 *   sizes one container by content instead of selecting a second color.
 * - `LargeLabelTextColor` is `OnError`, which is what `contentColorFor(Error)`
 *   already resolves. The read path reaches the same value, so `label-color`
 *   registers `onError` on the strength of the code rather than the role — the
 *   rule T42 established when `Tabs` had encoded an unread role whose value
 *   contradicted the code.
 *
 * `LargeLabelTextFont` is `LabelSmall`, consumed straight from the
 * `--m3e-sys-typescale-baseline-label-small-*` foundation variables in
 * `Badge.css`, matching every prior task's unread-typography-role precedent.
 *
 * Both shapes are `CornerFull`. The design specification's "3dp corner radius"
 * for the small badge and "8dp corner radius" for the large one are the same
 * statement: a fully rounded 6dp dot has a 3dp radius, and a fully rounded
 * 16dp-tall pill has an 8dp one. One `shape` role therefore covers both.
 *
 * The offsets and the label padding are internal `Dp` values in `Badge.kt`
 * (`BadgeOffset`, `BadgeWithContentHorizontalOffset`,
 * `BadgeWithContentVerticalOffset`, `BadgeWithContentHorizontalPadding`) with
 * no generated role at all. They are registered because `BadgeAnchor` needs
 * them at paint time and because the design specification publishes them as
 * measurements — "6x6dp" for a small badge and "14x12dp" for a large one,
 * measured from the anchor's top trailing corner.
 */
export const defaultBadgeTokens = {
  component: 'badge',
  task: 'T43',
  source: {
    id: 'androidx-material3-badge',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/BadgeTokens.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    color: { kind: 'color', value: { $ref: 'sys.color.error' } },
    'label-color': { kind: 'color', value: { $ref: 'sys.color.onError' } },
    shape: { kind: 'shape', value: { $ref: 'sys.shape.corners.cornerFull' } },
    size: { kind: 'dimension', value: '6px' },
    'large-size': { kind: 'dimension', value: '16px' },
    'large-horizontal-padding': { kind: 'dimension', value: '4px' },
    offset: { kind: 'dimension', value: '6px' },
    'large-horizontal-offset': { kind: 'dimension', value: '12px' },
    'large-vertical-offset': { kind: 'dimension', value: '14px' },
  },
} as const satisfies ComponentTokenRegistration
