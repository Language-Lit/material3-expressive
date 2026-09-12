import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 time-picker values at the pinned T66 revision. The
 * generated `TimePickerTokens` and `TimeInputTokens` files both contribute to
 * this one web family. Geometry that `TimePicker.kt` names directly is kept in
 * the same registration so the CSS has no unsourced literals.
 *
 * The source's outer 24-hour ring contains 00–11 and its inner ring contains
 * 12–23: `selectorPos` selects `InnerCircleRadius` when `state.isPm`. That is
 * preserved even though some other Material platforms reverse the rings.
 */
export const defaultTimePickerTokens = {
  component: 'time-picker',
  task: 'T66',
  source: {
    id: 'androidx-material3-time-picker',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/8a0ee86845b2fb7c56fc5786971ecb687ad85527/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TimePicker.kt',
    revision: '8a0ee86845b2fb7c56fc5786971ecb687ad85527',
    accessed: '2026-09-12',
  },
  tokens: {
    'minimum-interactive-target': {
      kind: 'dimension', value: { $ref: 'sys.density.minimumInteractiveTarget' },
    },
    'container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHigh' },
    },
    'container-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerExtraLarge' },
    },
    'container-shadow': {
      kind: 'shadow', value: { $ref: 'sys.elevation.level3.shadow' },
    },
    'headline-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'clock-dial-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHighest' },
    },
    'clock-dial-size': { kind: 'dimension', value: '256px' },
    'vertical-panel-width': { kind: 'dimension', value: '280px' },
    'clock-dial-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerFull' },
    },
    'clock-label-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'clock-selected-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onPrimary' },
    },
    'selector-color': { kind: 'color', value: { $ref: 'sys.color.primary' } },
    'selector-handle-size': { kind: 'dimension', value: '48px' },
    'selector-center-size': { kind: 'dimension', value: '8px' },
    'selector-track-width': { kind: 'dimension', value: '2px' },
    'outer-radius': { kind: 'dimension', value: '101px' },
    'inner-radius': { kind: 'dimension', value: '69px' },
    'inner-ring-threshold': { kind: 'dimension', value: '74px' },
    'minor-option-size': { kind: 'dimension', value: '1px' },
    'time-selector-width': { kind: 'dimension', value: '96px' },
    'time-selector-24h-width': { kind: 'dimension', value: '114px' },
    'time-selector-height': { kind: 'dimension', value: '80px' },
    'time-selector-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerSmall' },
    },
    'time-selector-selected-color': {
      kind: 'color', value: { $ref: 'sys.color.primaryContainer' },
    },
    'time-selector-selected-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onPrimaryContainer' },
    },
    'time-selector-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHighest' },
    },
    'time-selector-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurface' },
    },
    'separator-width': { kind: 'dimension', value: '24px' },
    'separator-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'period-horizontal-width': { kind: 'dimension', value: '216px' },
    'period-horizontal-height': { kind: 'dimension', value: '38px' },
    'period-vertical-width': { kind: 'dimension', value: '52px' },
    'period-vertical-height': { kind: 'dimension', value: '80px' },
    'input-period-width': { kind: 'dimension', value: '52px' },
    'input-period-height': { kind: 'dimension', value: '72px' },
    'period-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerSmall' },
    },
    'period-outline-color': { kind: 'color', value: { $ref: 'sys.color.outline' } },
    'period-outline-width': { kind: 'dimension', value: '1px' },
    'period-selected-color': {
      kind: 'color', value: { $ref: 'sys.color.tertiaryContainer' },
    },
    'period-selected-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onTertiaryContainer' },
    },
    'period-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'time-field-width': { kind: 'dimension', value: '96px' },
    'time-field-height': { kind: 'dimension', value: '72px' },
    'time-field-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerSmall' },
    },
    'time-field-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHighest' },
    },
    'time-field-focus-color': {
      kind: 'color', value: { $ref: 'sys.color.primaryContainer' },
    },
    'time-field-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurface' },
    },
    'time-field-focus-label-color': {
      kind: 'color', value: { $ref: 'sys.color.onPrimaryContainer' },
    },
    'time-field-supporting-color': {
      kind: 'color', value: { $ref: 'sys.color.onSurfaceVariant' },
    },
    'time-field-focus-outline-color': {
      kind: 'color', value: { $ref: 'sys.color.primary' },
    },
    'time-field-focus-outline-width': { kind: 'dimension', value: '2px' },
    'focus-ring-color': { kind: 'color', value: { $ref: 'sys.color.secondary' } },
    'focus-ring-width': { kind: 'dimension', value: '2px' },
    'focus-ring-offset': { kind: 'dimension', value: '2px' },
    'clock-display-gap': { kind: 'dimension', value: '36px' },
    'clock-face-bottom-gap': { kind: 'dimension', value: '24px' },
    'period-gap': { kind: 'dimension', value: '12px' },
    'support-label-offset': { kind: 'dimension', value: '7px' },
    'input-bottom-padding': { kind: 'dimension', value: '24px' },
    'panel-padding': { kind: 'dimension', value: '24px' },
    'dialog-viewport-margin': { kind: 'dimension', value: '8px' },
    'panel-gap': { kind: 'dimension', value: '16px' },
    'error-color': { kind: 'color', value: { $ref: 'sys.color.error' } },
    'disabled-opacity': { kind: 'opacity', value: 0.38 },
  },
} as const satisfies ComponentTokenRegistration
