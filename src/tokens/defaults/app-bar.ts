import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 app-bar tokens at the pinned T46 revision, the reference
 * snapshot T44 adopted. Six generated files describe the top-bar family:
 * shared `AppBarTokens` plus one file per size tier (`AppBarSmallTokens`,
 * `AppBarMediumTokens`, `AppBarMediumFlexibleTokens`, `AppBarLargeTokens`,
 * `AppBarLargeFlexibleTokens`).
 *
 * `AppBarTokens` declares fourteen roles. The pinned top-bar composables read
 * six — the `topAppBarColors()` set registered here. One more,
 * `ContainerElevation`, is read only by `FlexibleBottomAppBar`, which the
 * current design index files under Toolbars (catalog row 35), so it travels
 * with that deferral rather than being registered for a family that never
 * resolves it. The remaining seven are unread and recorded in the ledger:
 * `ContainerShape` (`CornerNone` — the bar is an edge-to-edge band),
 * `OnScrollContainerElevation` (top bars change color, not elevation, on
 * scroll), `IconSize`/`AvatarSize`/`IconButtonSpace` (the icon slots are this
 * library's `IconButton`, which owns its own geometry), and
 * `LeadingSpace`/`TrailingSpace` — declared at 4dp but shadowed by the
 * implementation's own hand-tuned `TopAppBarHorizontalPadding = 4.dp`, which
 * the code reads instead. The same value flows either way; the anomaly is that
 * the generated role has no read path, so `horizontal-padding` here registers
 * the constant the source actually reads.
 *
 * Every tier-file role is read: heights and title/subtitle fonts per tier,
 * with `LargeContainerHeight` selecting the taller flexible container when a
 * subtitle is present. The fonts are not registered as component tokens —
 * this library's typography reaches components as
 * `--m3e-sys-typescale-baseline-*` custom properties consumed directly in CSS
 * (title-large small/collapsed, headline-small medium, headline-medium medium
 * flexible and large, display-small large flexible, with label-medium /
 * label-large / title-medium subtitles).
 *
 * `title-inset` is the source's `TopAppBarTitleInset` (16dp − 4dp): the extra
 * start inset that keeps a title 16px from the edge when there is no
 * navigation icon. `medium-title-bottom-padding` / `large-title-bottom-padding`
 * are the hand-tuned bottom paddings of the two-row expanded title.
 */
export const defaultAppBarTokens = {
  component: 'app-bar',
  task: 'T46',
  source: {
    id: 'androidx-material3-app-bar',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/AppBarTokens.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    'container-color': { kind: 'color', value: { $ref: 'sys.color.surface' } },
    'on-scroll-container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainer' },
    },
    'leading-icon-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'title-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'trailing-icon-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'subtitle-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'container-height': { kind: 'dimension', value: '64px' },
    'medium-container-height': { kind: 'dimension', value: '112px' },
    'medium-flexible-container-height': { kind: 'dimension', value: '112px' },
    'medium-flexible-subtitle-container-height': { kind: 'dimension', value: '136px' },
    'large-container-height': { kind: 'dimension', value: '152px' },
    'large-flexible-container-height': { kind: 'dimension', value: '120px' },
    'large-flexible-subtitle-container-height': { kind: 'dimension', value: '152px' },
    'horizontal-padding': { kind: 'dimension', value: '4px' },
    'title-inset': { kind: 'dimension', value: '12px' },
    'medium-title-bottom-padding': { kind: 'dimension', value: '24px' },
    'large-title-bottom-padding': { kind: 'dimension', value: '28px' },
  },
} as const satisfies ComponentTokenRegistration
