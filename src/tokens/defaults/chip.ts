import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 Chip values at the pinned T38 revision, adapted from dp
 * to CSS pixels. Names retain the four source families so equal current values
 * do not erase distinct upstream ownership.
 */
export const defaultChipTokens = {
  component: 'chip',
  task: 'T38',
  source: {
    id: 'androidx-material3-chip',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Chip.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-24',
  },
  tokens: {
    'minimum-interactive-target': {
      kind: 'dimension',
      value: { $ref: 'sys.density.minimumInteractiveTarget' },
    },
    'container-height': { kind: 'dimension', value: '32px' },
    'maximum-width': { kind: 'dimension', value: '1000px' },
    'container-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerSmall' },
    },
    'expressive-unselected-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerMedium' },
    },
    'expressive-selected-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerFull' },
    },
    'expressive-pressed-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerSmall' },
    },
    'icon-size': { kind: 'dimension', value: '18px' },
    'avatar-size': { kind: 'dimension', value: '24px' },
    'avatar-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerFull' },
    },
    'input-disabled-avatar-opacity': { kind: 'opacity', value: 0.38 },
    'content-padding': { kind: 'dimension', value: '8px' },
    'horizontal-spacing': { kind: 'dimension', value: '8px' },
    'compact-horizontal-spacing': { kind: 'dimension', value: '4px' },
    'input-padding-start': { kind: 'dimension', value: '4px' },
    'input-leading-padding-start': { kind: 'dimension', value: '8px' },
    'input-avatar-padding-start': { kind: 'dimension', value: '4px' },
    'input-padding-end': { kind: 'dimension', value: '4px' },
    'input-trailing-padding-end': { kind: 'dimension', value: '8px' },
    'focus-ring-width': { kind: 'dimension', value: '2px' },
    'focus-ring-offset': { kind: 'dimension', value: '2px' },
    'focus-ring-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondary' },
    },

    'assist-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'assist-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    'assist-disabled-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'assist-disabled-label-opacity': { kind: 'opacity', value: 0.38 },
    'assist-disabled-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'assist-disabled-icon-opacity': { kind: 'opacity', value: 0.38 },
    'assist-flat-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.outlineVariant' },
    },
    'assist-flat-disabled-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'assist-flat-disabled-outline-opacity': { kind: 'opacity', value: 0.12 },
    'assist-flat-outline-width': { kind: 'dimension', value: '1px' },
    'assist-elevated-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.surfaceContainerLow' },
    },
    'assist-elevated-disabled-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'assist-elevated-disabled-container-opacity': { kind: 'opacity', value: 0.12 },
    'assist-flat-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'assist-flat-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'assist-elevated-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'assist-elevated-hover-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level2.shadow' },
    },
    'assist-elevated-focus-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'assist-elevated-pressed-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'assist-elevated-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'assist-elevated-disabled-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },

    'filter-unselected-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'filter-unselected-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    'filter-expressive-unselected-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'filter-unselected-trailing-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'filter-flat-selected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondaryContainer' },
    },
    'filter-elevated-selected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondaryContainer' },
    },
    'filter-selected-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'filter-selected-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'filter-selected-trailing-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'filter-disabled-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'filter-disabled-label-opacity': { kind: 'opacity', value: 0.38 },
    'filter-disabled-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'filter-disabled-leading-icon-opacity': { kind: 'opacity', value: 0.38 },
    'filter-disabled-trailing-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'filter-disabled-trailing-icon-opacity': { kind: 'opacity', value: 0.38 },
    'filter-flat-disabled-selected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'filter-flat-disabled-selected-container-opacity': {
      kind: 'opacity',
      value: 0.12,
    },
    'filter-flat-unselected-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.outlineVariant' },
    },
    'filter-flat-disabled-unselected-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'filter-flat-disabled-unselected-outline-opacity': {
      kind: 'opacity',
      value: 0.12,
    },
    'filter-flat-unselected-outline-width': { kind: 'dimension', value: '1px' },
    'filter-flat-selected-outline-width': { kind: 'dimension', value: '0px' },
    'filter-elevated-unselected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.surfaceContainerLow' },
    },
    'filter-elevated-disabled-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'filter-elevated-disabled-container-opacity': { kind: 'opacity', value: 0.12 },
    'filter-flat-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'filter-flat-hover-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'filter-flat-focus-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'filter-flat-pressed-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'filter-flat-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'filter-elevated-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'filter-elevated-hover-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level2.shadow' },
    },
    'filter-elevated-focus-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'filter-elevated-pressed-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'filter-elevated-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'filter-flat-disabled-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'filter-elevated-disabled-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },

    'input-unselected-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'input-unselected-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'input-unselected-trailing-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'input-selected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondaryContainer' },
    },
    'input-selected-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'input-selected-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    'input-selected-trailing-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSecondaryContainer' },
    },
    'input-disabled-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'input-disabled-label-opacity': { kind: 'opacity', value: 0.38 },
    'input-disabled-leading-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'input-disabled-leading-icon-opacity': { kind: 'opacity', value: 0.38 },
    'input-disabled-trailing-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'input-disabled-trailing-icon-opacity': { kind: 'opacity', value: 0.38 },
    'input-disabled-selected-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'input-disabled-selected-container-opacity': { kind: 'opacity', value: 0.12 },
    'input-unselected-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.outlineVariant' },
    },
    'input-disabled-unselected-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'input-disabled-unselected-outline-opacity': { kind: 'opacity', value: 0.12 },
    'input-unselected-outline-width': { kind: 'dimension', value: '1px' },
    'input-selected-outline-width': { kind: 'dimension', value: '0px' },
    'input-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'input-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },

    'suggestion-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'suggestion-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    'suggestion-disabled-label-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'suggestion-disabled-label-opacity': { kind: 'opacity', value: 0.38 },
    'suggestion-disabled-icon-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'suggestion-disabled-icon-opacity': { kind: 'opacity', value: 0.38 },
    'suggestion-flat-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.outlineVariant' },
    },
    'suggestion-flat-disabled-outline-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'suggestion-flat-disabled-outline-opacity': { kind: 'opacity', value: 0.12 },
    'suggestion-flat-outline-width': { kind: 'dimension', value: '1px' },
    'suggestion-elevated-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.surfaceContainerLow' },
    },
    'suggestion-elevated-disabled-container-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'suggestion-flat-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
    'suggestion-flat-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'suggestion-elevated-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'suggestion-elevated-hover-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level2.shadow' },
    },
    'suggestion-elevated-focus-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'suggestion-elevated-pressed-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level1.shadow' },
    },
    'suggestion-elevated-dragged-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level4.shadow' },
    },
    'suggestion-elevated-disabled-shadow': {
      kind: 'shadow',
      value: { $ref: 'sys.elevation.level0.shadow' },
    },
  },
} as const satisfies ComponentTokenRegistration
