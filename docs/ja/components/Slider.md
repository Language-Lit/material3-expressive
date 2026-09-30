# Slider

`Slider` selects one value; `RangeSlider` selects an ordered pair. Both use
native range inputs for accessible value semantics, focus, forms, labels, and
disabled state while the visible Material track, handle, ticks, and stop
indicators remain decorative.

```tsx
import {
  RangeSlider,
  Slider,
} from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

<label>
  Volume
  <Slider name="volume" defaultValue={0.4} />
</label>

<Slider
  aria-label="Reading speed"
  min={0.5}
  max={2}
  steps={5}
  defaultValue={1}
/>

<RangeSlider
  aria-label="Price range"
  startAriaLabel="Minimum price"
  endAriaLabel="Maximum price"
  min={0}
  max={100}
  defaultValue={[20, 80]}
  startInputProps={{ name: 'minimum' }}
  endInputProps={{ name: 'maximum' }}
/>
```

## Value contract {#value-contract}

- Use `value` plus `onValueChange` for controlled state, or `defaultValue`
  plus an optional callback for uncontrolled state.
- `min` and `max` default to `0` and `1`. Values are clamped to that interval.
- `steps` is the number of allowed values *between* the endpoints. `steps={4}`
  over `0…10` therefore permits `0, 2, 4, 6, 8, 10`. Pointer values snap to
  the nearest tick; an exact tie follows the pinned source and selects the
  lower tick. A native accessibility value action preserves the source
  semantics loop's distinct exact-tie result and selects the upper tick.
- `onValueChangeFinished` runs once after a completed tap, drag, handled key
  release, or accessibility value action. Use `onValueChange`—not the finish
  callback—to store the value.
- `RangeSlider` orders an out-of-order initial pair and prevents its two
  thumbs from crossing. A pointer selects the nearest thumb. When both thumbs
  overlap exactly, a pointer before them selects the start thumb and every
  other tie selects the end thumb, matching the source.

Native input attributes such as `id`, `name`, `form`, `required`, ARIA
relationships, and native change/focus handlers are forwarded by `Slider`.
Its ref points to the input; `className` and `style` describe the visual root.
For `RangeSlider`, ordinary DOM props and the forwarded ref describe the
`role="group"` root. `startInputProps`/`endInputProps` and
`startInputRef`/`endInputRef` address the two native inputs independently.

## Orientation, direction, and keyboard {#orientation-direction-and-keyboard}

`Slider` is horizontal by default. `orientation="vertical"` maps the source's
current `VerticalSlider` path; `topToBottom` defaults to `true`, so minimum is
at the top. Set it to `false` for bottom-to-top. `RangeSlider` stays horizontal
because the pinned source has no vertical range-slider API.

Horizontal value order follows logical direction: minimum is at inline start,
so RTL reverses the physical track and Left/Right key delta. Home selects
minimum and End selects maximum. Continuous sliders use the source's 1% arrow
increment; stepped sliders use one tick. Page Up/Down moves up to ten ticks.
The source deliberately does not reverse horizontal Page keys in RTL, and this
implementation retains that asymmetry. Vertical Up/Down and Page keys follow
`topToBottom`.

Pointer gestures preserve the source's slop behavior: a tap commits its
original press coordinate on release; a same-axis move becomes a drag; an
orthogonal touch move is left to page scrolling. Disabled inputs cannot focus
or change.

## Track, handles, and states {#track-handles-and-states}

The horizontal root fills its containing inline size and reserves a 48px
minimum target. A vertical root defaults to 200×48px and can be resized with
ordinary CSS. Inside that target:

- the track is 16px thick with 8px external and 2px thumb-facing corners;
- the default horizontal handle is 4×44px (44×4px vertically);
- focus, press, and drag halve the handle's main-axis thickness to 2px;
- the handle-to-track gap is 6px beyond the handle edge;
- inset focus adds 4px to the adjacent gap without moving either handle;
- ticks and endpoint stop indicators are 4px circles.

Set `centered` on a single slider to draw active progress between the geometric
center and its value. Range active progress runs between its two thumbs.
Discrete interior ticks and handles are inset inside the external corner
radii, as in AndroidX; endpoints remain at the full track bounds. Ordinary
single sliders draw a stop only at the far inactive endpoint. Centered and
range tracks draw both inactive outer stops when those segments exist.

`thumb`, `startThumb`, `endThumb`, `trackContent`, `renderTick`, and
`renderStopIndicator` are passive visual slots inside the track's
`aria-hidden` subtree. They cannot replace the native inputs or add another
interactive action. `showStopIndicator={false}` matches the source's null
stop-renderer path.

## Accessibility, forms, and SSR {#accessibility-forms-and-ssr}

Each semantic thumb is an `<input type="range" role="slider">`. Browser-owned
label association, numeric min/max/now state, form serialization, reset,
disabled behavior, and independent tab stops remain available. `Slider`
accepts wrapping labels, `label for`, `aria-label`, or `aria-labelledby`.
`RangeSlider` requires localized `startAriaLabel` and `endAriaLabel`; its
dynamic accessible bounds stop at the other thumb.

The decorative track is `aria-hidden`. Focus-visible draws a token-backed ring
around the corresponding handle, including in forced colors. Markup is
deterministic under SSR and hydration, and the component injects no runtime
styles.

## Tokens and source boundary {#tokens-and-source-boundary}

All visual values use `--m3e-comp-slider-*` custom properties scoped by
`Material3Provider`. The defaults preserve the source's crossed tick colors,
disabled handle precomposition over `surface`, and distinct disabled track
alphas.

The implementation is pinned to AndroidX Material 3 revision
`225f50d42bf0adeb2abf4b6109befb5ab6ce4efc`. Only the 15 generated
`SliderTokens` names literally read by `Slider.kt` become sourced resolution
paths; all 36 unread names remain recorded in the executable ledger instead of
inventing behavior. Compose modifiers, interaction sources, canvas scopes,
state holders, and deprecated compatibility overloads are adapted or excluded
as platform machinery, while their observable output is covered by the
component conformance record and ADR 0031.
