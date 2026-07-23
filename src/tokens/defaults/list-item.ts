import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 Expressive List Item values at the pinned T40 revision.
 * Generated roles are registered only when ListItem.kt/ListItemDefaults.kt
 * observe them; the minimum target and focus ring are named web treatments.
 * Dragged roles deliberately retain their separate ReorderListTokens ownership.
 */
export const defaultListItemTokens = {
  component: 'list-item',
  task: 'T40',
  source: {
    id: 'androidx-material3-list-item',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItem.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    'minimum-interactive-target': {
      kind: 'dimension',
      value: { $ref: 'sys.density.minimumInteractiveTarget' },
    },
    'one-line-container-height': { kind: 'dimension', value: '56px' },
    'two-line-container-height': { kind: 'dimension', value: '72px' },
    'three-line-container-height': { kind: 'dimension', value: '88px' },
    'content-padding-inline': { kind: 'dimension', value: '16px' },
    'content-padding-block': { kind: 'dimension', value: '10px' },
    'precision-pointer-content-padding-block': { kind: 'dimension', value: '12px' },
    'internal-spacing': { kind: 'dimension', value: '12px' },
    'segmented-gap': { kind: 'dimension', value: '2px' },

    'container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerExtraSmall' },
    },
    'segmented-outer-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerLarge' },
    },
    'selected-container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerLarge' },
    },
    'pressed-container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerLarge' },
    },
    'focused-container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerLarge' },
    },
    'hovered-container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerMedium' },
    },
    'reorder-dragged-container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerLarge' },
    },

    'container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.surface' },
    },
    'segmented-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.surface' },
    },
    'content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'leading-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'trailing-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'overline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'supporting-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },

    'disabled-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-content-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-leading-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-leading-content-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-trailing-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-trailing-content-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-overline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-overline-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-supporting-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-supporting-content-opacity': { kind: 'opacity', value: 0.38 },

    'selected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondaryContainer' },
    },
    'selected-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'selected-leading-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'selected-trailing-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'selected-overline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'selected-supporting-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },

    'reorder-dragged-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.tertiaryContainer' },
    },
    'reorder-dragged-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onTertiaryContainer' },
    },
    'reorder-dragged-leading-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onTertiaryContainer' },
    },
    'reorder-dragged-trailing-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onTertiaryContainer' },
    },
    'reorder-dragged-overline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onTertiaryContainer' },
    },
    'reorder-dragged-supporting-content-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onTertiaryContainer' },
    },

    'container-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'reorder-dragged-container-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'focus-ring-width': { kind: 'dimension', value: '2px' },
    'focus-ring-offset': { kind: 'dimension', value: '2px' },
    'focus-ring-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondary' },
    },
  },
} as const satisfies ComponentTokenRegistration
