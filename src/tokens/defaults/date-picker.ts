import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 date-picker values at the pinned T66 revision. The
 * component uses the generated modal family for both popup presentations;
 * `DateInputModalTokens` is frozen by the source ledger but has no read path in
 * the current implementation. Web-only popup margins and focus outlines are
 * explicit adaptations required by the viewport and keyboard contracts.
 */
export const defaultDatePickerTokens = {
  component: 'date-picker',
  task: 'T66',
  source: {
    id: 'androidx-material3-date-picker',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/e8cac06846dd0164454bd44b77ed1c4e95ec7591/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/DatePickerModalTokens.kt',
    revision: 'e8cac06846dd0164454bd44b77ed1c4e95ec7591',
    accessed: '2026-09-12',
  },
  tokens: {
    'container-color': { kind: 'color', value: { $ref: 'sys.color.surfaceContainerHigh' } },
    'container-shape': { kind: 'shape', value: { $ref: 'sys.shape.corners.cornerExtraLarge' } },
    'container-shadow': { kind: 'shadow', value: { $ref: 'sys.elevation.level3.shadow' } },
    'container-width': { kind: 'dimension', value: '360px' },
    'container-max-height': { kind: 'dimension', value: '568px' },
    'container-viewport-margin': { kind: 'dimension', value: '8px' },
    'container-padding': { kind: 'dimension', value: '0px' },
    'header-min-height': { kind: 'dimension', value: '120px' },
    'range-header-min-height': { kind: 'dimension', value: '128px' },
    'header-horizontal-padding': { kind: 'dimension', value: '24px' },
    'header-block-padding': { kind: 'dimension', value: '12px' },
    'header-headline-color': { kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' } },
    'header-supporting-color': { kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' } },
    'calendar-horizontal-padding': { kind: 'dimension', value: '12px' },
    'calendar-compact-horizontal-padding': { kind: 'dimension', value: '12px' },
    'navigation-height': { kind: 'dimension', value: '56px' },
    'minimum-interactive-target': { kind: 'dimension', value: { $ref: 'sys.density.minimumInteractiveTarget' } },
    'compact-interactive-target': { kind: 'dimension', value: '40px' },
    'date-container-height': { kind: 'dimension', value: '40px' },
    'date-container-width': { kind: 'dimension', value: '40px' },
    'date-container-shape': { kind: 'shape', value: { $ref: 'sys.shape.corners.cornerFull' } },
    'date-label-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'date-selected-container-color': { kind: 'color', value: { $ref: 'sys.color.primary' } },
    'date-selected-label-color': { kind: 'color', value: { $ref: 'sys.color.onPrimary' } },
    'date-disabled-opacity': { kind: 'opacity', value: 0.38 },
    'date-today-outline-color': { kind: 'color', value: { $ref: 'sys.color.primary' } },
    'date-today-outline-width': { kind: 'dimension', value: '1px' },
    'date-today-label-color': { kind: 'color', value: { $ref: 'sys.color.primary' } },
    'date-in-range-container-color': { kind: 'color', value: { $ref: 'sys.color.secondaryContainer' } },
    'date-in-range-label-color': { kind: 'color', value: { $ref: 'sys.color.onSecondaryContainer' } },
    'range-month-list-max-height': { kind: 'dimension', value: '288px' },
    'range-month-subhead-min-height': { kind: 'dimension', value: '52px' },
    'range-month-subhead-horizontal-padding': { kind: 'dimension', value: '24px' },
    'range-month-subhead-color': { kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' } },
    'weekday-label-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'year-container-height': { kind: 'dimension', value: '36px' },
    'year-container-width': { kind: 'dimension', value: '72px' },
    'year-label-color': { kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' } },
    'year-selected-container-color': { kind: 'color', value: { $ref: 'sys.color.primary' } },
    'year-selected-label-color': { kind: 'color', value: { $ref: 'sys.color.onPrimary' } },
    'input-spacing': { kind: 'dimension', value: '8px' },
    'form-control-size': { kind: 'dimension', value: '1px' },
    'focus-ring-width': { kind: 'dimension', value: '3px' },
    'focus-ring-offset': { kind: 'dimension', value: '2px' },
    'focus-ring-color': { kind: 'color', value: { $ref: 'sys.color.secondary' } },
    'state-layer-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
  },
} as const satisfies ComponentTokenRegistration
