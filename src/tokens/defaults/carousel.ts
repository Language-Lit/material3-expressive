import type { ComponentTokenRegistration } from '../schema'

/**
 * Carousel is the first family in this library with **no generated token file
 * upstream**. Listing
 * `compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/`
 * at the pinned revision returns no `CarouselTokens.kt`, at that revision or at
 * `androidx-main` HEAD. Every other family has had a generated file to partition
 * into read and unread roles; this one has nothing to partition.
 *
 * Its registry therefore draws on the two first-party sources that do describe
 * it, and ADR 0040 records the exception:
 *
 * - **`CarouselDefaults` and the private constants beside it**, for the numbers
 *   the pinned implementation actually reads: `MinSmallItemSize` (40dp),
 *   `MaxSmallItemSize` (56dp), `AnchorSize` (10dp), and
 *   `MediumLargeItemDiffThreshold` (0.85). These four are the whole numeric
 *   contract of the layout engine, and registering them is what lets a theme
 *   change the arrangement rather than only its paint.
 * - **The design specification's own measurement tables**, for the values only
 *   the design owns: the 28dp item corner every layout shares, the 16dp
 *   leading/trailing and 8dp block padding of multi-browse and both hero
 *   layouts, the 8dp gap between items, the full-screen layout's 0dp padding
 *   with a 16dp gap, and the Surface container colour its colour table names.
 *
 * Two consequences worth stating plainly. The measurement tables give
 * uncontained and multi-aspect a *leading* padding only — items are meant to
 * bleed past the trailing edge — so `uncontained-trailing-padding` is 0 rather
 * than absent, which keeps one variable answering the question for every layout.
 * And `item-shape` is registered as a reference to `cornerExtraLarge` rather
 * than a literal `28px`, because that system role already carries exactly this
 * value and a theme that reshapes its corners should reshape carousel items too.
 *
 * The specs page lists enabled, hover, focus, pressed, and disabled states for a
 * carousel item without giving any of them a value of its own, so the state
 * layer reads the shared `--m3e-sys-state-*` opacities directly, as every other
 * component in this library does, and only the layer's colour is registered.
 */
export const defaultCarouselTokens = {
  component: 'carousel',
  task: 'T48',
  source: {
    id: 'androidx-material3-carousel',
    url: 'https://android.googlesource.com/platform/frameworks/support/+/a90df2fc27e026b9ad2ed569f203a260c1041fab/compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/carousel/Carousel.kt',
    revision: 'a90df2fc27e026b9ad2ed569f203a260c1041fab',
    accessed: '2026-07-25',
  },
  tokens: {
    'container-color': { kind: 'color', value: { $ref: 'sys.color.surface' } },
    'item-shape': {
      kind: 'shape', value: { $ref: 'sys.shape.corners.cornerExtraLarge' },
    },
    'item-container-color': {
      kind: 'color', value: { $ref: 'sys.color.surfaceContainerHigh' },
    },
    'item-content-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'min-small-item-size': { kind: 'dimension', value: '40px' },
    'max-small-item-size': { kind: 'dimension', value: '56px' },
    'anchor-size': { kind: 'dimension', value: '10px' },
    'medium-large-item-diff-threshold': { kind: 'opacity', value: 0.85 },
    'item-spacing': { kind: 'dimension', value: '8px' },
    'leading-padding': { kind: 'dimension', value: '16px' },
    'trailing-padding': { kind: 'dimension', value: '16px' },
    'block-padding': { kind: 'dimension', value: '8px' },
    'uncontained-trailing-padding': { kind: 'dimension', value: '0px' },
    'full-screen-item-spacing': { kind: 'dimension', value: '16px' },
    'full-screen-padding': { kind: 'dimension', value: '0px' },
    'focus-ring-width': { kind: 'dimension', value: '3px' },
    'focus-ring-offset': { kind: 'dimension', value: '2px' },
    'focus-ring-color': { kind: 'color', value: { $ref: 'sys.color.secondary' } },
    'state-layer-color': { kind: 'color', value: { $ref: 'sys.color.onSurface' } },
    'disabled-content-opacity': { kind: 'opacity', value: 0.38 },
    'disabled-container-opacity': { kind: 'opacity', value: 0.12 },
  },
} as const satisfies ComponentTokenRegistration
