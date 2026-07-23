import type { ComponentTokenRegistration } from '../schema'

/**
 * AndroidX Material 3 Slider values at the pinned T39 revision, adapted from
 * dp to CSS pixels. Only generated roles literally observed by Slider.kt are
 * registered; direct implementation geometry and required web focus treatment
 * are called out separately.
 */
export const defaultSliderTokens = {
  component: 'slider',
  task: 'T39',
  source: {
    id: 'androidx-material3-slider',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/225f50d42bf0adeb2abf4b6109befb5ab6ce4efc/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Slider.kt',
    revision: '225f50d42bf0adeb2abf4b6109befb5ab6ce4efc',
    accessed: '2026-07-23',
  },
  tokens: {
    'minimum-interactive-target': {
      kind: 'dimension',
      value: { $ref: 'sys.density.minimumInteractiveTarget' },
    },
    // Slider.kt sizes the complete track from InactiveTrackHeight. The
    // generated ActiveTrackHeight name is not read.
    'track-height': { kind: 'dimension', value: '16px' },
    'track-corner-size': { kind: 'dimension', value: '8px' },
    'track-inside-corner-size': { kind: 'dimension', value: '2px' },
    'handle-width': { kind: 'dimension', value: '4px' },
    'handle-height': { kind: 'dimension', value: '44px' },
    'handle-shape': {
      kind: 'shape',
      value: { $ref: 'sys.shape.corners.cornerFull' },
    },
    // ThumbContent halves the handle's main-axis size for every collected
    // interaction. It does not read the generated per-interaction widths.
    'interacted-handle-width': { kind: 'dimension', value: '2px' },
    // Both sides use ActiveHandleLeadingSpace; ActiveHandleTrailingSpace is
    // generated but unread.
    'handle-track-gap': { kind: 'dimension', value: '6px' },
    'stop-indicator-size': { kind: 'dimension', value: '4px' },
    'tick-size': { kind: 'dimension', value: '4px' },
    'inset-focus-ring-padding': { kind: 'dimension', value: '4px' },
    'focus-ring-width': { kind: 'dimension', value: '2px' },
    'focus-ring-offset': { kind: 'dimension', value: '2px' },
    'focus-ring-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondary' },
    },
    'handle-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    'active-track-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    // defaultSliderColors deliberately crosses the track colors for ticks.
    'active-tick-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondaryContainer' },
    },
    'inactive-track-color': {
      kind: 'color',
      value: { $ref: 'sys.color.secondaryContainer' },
    },
    'inactive-tick-color': {
      kind: 'color',
      value: { $ref: 'sys.color.primary' },
    },
    'disabled-handle-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-handle-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-active-track-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-active-track-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-inactive-track-color': {
      kind: 'color',
      value: { $ref: 'sys.color.onSurface' },
    },
    'disabled-inactive-track-opacity': { kind: 'opacity', value: 0.12 },
  },
} as const satisfies ComponentTokenRegistration
