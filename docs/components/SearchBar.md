# SearchBar

`SearchBar` is Material's search entry point: a field that expands into
suggestions or results. `SearchAppBar` is the companion app-bar variant to use
when search is a product's primary, global function.

```tsx
import { Icon, IconButton, ListItem, SearchAppBar, SearchBar } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

// A search bar that expands into results, full-screen on phones and docked
// on anything larger.
<SearchBar placeholder="Search your messages" onSearch={runSearch}>
  {results.map((result) => (
    <ListItem key={result.id} headline={result.title} onClick={() => open(result)} />
  ))}
</SearchBar>

// The baseline treatment: a divider between the field and the results.
<SearchBar placeholder="Search" appearance="divided" layout="docked">
  {suggestions}
</SearchBar>

// The search app bar, pinned so it stays put as the page scrolls.
<SearchAppBar
  scrollBehavior="pinned"
  navigationIcon={<IconButton aria-label="Open navigation"><Icon source="menu" /></IconButton>}
  actions={<IconButton aria-label="Account"><Icon source="account_circle" /></IconButton>}
>
  <SearchBar placeholder="Search mail" onSearch={runSearch}>
    {results}
  </SearchBar>
</SearchAppBar>
```

## Contract

`placeholder` is the hinted search text and, per Material's accessibility
guidance, the field's accessible name unless `aria-label` overrides it.

`query`/`defaultQuery`/`onQueryChange` control the text; `expanded`/
`defaultExpanded`/`onExpandedChange` control whether results are showing.
`onSearch` fires when the query is submitted with Enter — the web's own form of
the source's search IME action — and deliberately leaves the results showing,
because the specification asks for the input text to stay visible after a
query.

`appearance` selects the Material style and defaults to `"contained"`, the
Expressive treatment the design site recommends: the field keeps its filled
container in every state, and results sit in their own surface. `"divided"` is
the baseline treatment, where a divider separates the field from the results.

`layout` selects where results appear and defaults to `"adaptive"`, which is the
guidance itself — full-screen in a compact window, docked in anything wider,
switching live at the 600px breakpoint. Pass `"docked"` or `"fullScreen"` to
pin the choice.

`leadingIcon`, `trailingIcon`, and `avatar` are the specification's slots. The
guidance allows at most two trailing icons; the avatar renders at its
specified 30px, full-corner.

`children` are the suggestions or results. The container is empty by default and
adds no semantics of its own — compose it from `ListItem`, add category labels,
put filter chips in it, or separate groups with a gap. That is the
specification's own instruction ("use the list component to add content"), so it
stays composition rather than API.

`SearchAppBar` wraps one search bar, with `navigationIcon` and `actions` slots
and a `scrollBehavior` of `"none"` (default), `"pinned"`, or `"enterAlways"` —
the two behaviors the guidance lists: remain fixed at the top, or scroll away
with content and reappear on the way back up. `scrollContainer` names the
scrollable element when the page does not scroll at the document level.

`className` is merged after the library class, every other native attribute
reaches the field, and `ref` forwards to the `<input>`. `SearchAppBar`'s `ref`
forwards to its `<header>`.

## Behavior

Search expands on pointer activation, on typing a character, or on the down
key — never on plain focus, so tabbing past a search bar cannot take over the
screen. Deleting text never expands a collapsed bar. The down key while
expanded moves focus into the results.

Both expanded surfaces carry their own copy of the field, exactly as the
Material source does, and the in-page bar is made inert while one is open, so
there is only ever one field to focus. The query survives the handover because
it is hoisted, and so does the caret.

The full-screen surface is a real modal `<dialog>`: the platform supplies the
top layer, the focus trap, the inert background, and focus restoration on
close. The docked surface is a portalled panel positioned over the collapsed
bar, dismissed by Escape or a click outside it. In the contained treatment the
page behind the drop-down is dimmed with the sourced scrim.

## Accessibility

The field is a `combobox` with `aria-expanded`, `aria-autocomplete="list"`, and
`aria-controls` pointing at the results while they exist. That is the web's own
way of announcing what the Material source announces with a "Suggestions
available" state description, and it needs no live region.

Escape collapses. A dismissal driven from inside the surface returns focus to
the field; a click outside leaves focus wherever the click put it. Leading and
trailing icon buttons are yours to label, per the guidance.

`SearchAppBar` is a `banner` landmark. An `enterAlways` bar reveals itself when
focus lands inside it, so tabbing to a search field never operates an
off-screen control.

Under `prefers-reduced-motion` the transitions are removed; in forced-colors
mode every surface keeps a `CanvasText` boundary and the divider stays visible.

## Tokens and source boundary

Thirty tokens: the ten generated roles the Material source reads, the avatar
and focus-ring roles it declares but never resolves, and the measurement
constants it reads directly.

| Token | Default |
| --- | --- |
| `--m3e-comp-search-bar-container-color` | `sys.color.surfaceContainerHigh` |
| `--m3e-comp-search-bar-scrolled-container-color` | `sys.color.surfaceContainerHighest` |
| `--m3e-comp-search-bar-container-height` | `56px` |
| `--m3e-comp-search-bar-container-shape` | `sys.shape.corners.cornerFull` |
| `--m3e-comp-search-bar-input-text-color` | `sys.color.onSurface` |
| `--m3e-comp-search-bar-leading-icon-color` | `sys.color.onSurface` |
| `--m3e-comp-search-bar-supporting-text-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-search-bar-trailing-icon-color` | `sys.color.onSurfaceVariant` |
| `--m3e-comp-search-bar-avatar-shape` | `sys.shape.corners.cornerFull` |
| `--m3e-comp-search-bar-avatar-size` | `30px` |
| `--m3e-comp-search-bar-focus-ring-width` | `2px` |
| `--m3e-comp-search-bar-focus-ring-offset` | `-2px` |
| `--m3e-comp-search-bar-focus-ring-color` | `sys.color.secondary` |
| `--m3e-comp-search-bar-min-width` | `360px` |
| `--m3e-comp-search-bar-max-width` | `720px` |
| `--m3e-comp-search-bar-input-horizontal-padding` | `12px` |
| `--m3e-comp-search-bar-icon-horizontal-padding` | `4px` |
| `--m3e-comp-search-bar-vertical-padding` | `8px` |
| `--m3e-comp-search-bar-app-bar-horizontal-padding` | `4px` |
| `--m3e-comp-search-bar-app-bar-vertical-padding` | `4px` |
| `--m3e-comp-search-bar-app-bar-search-padding` | `8px` |
| `--m3e-comp-search-bar-view-divider-color` | `sys.color.outline` |
| `--m3e-comp-search-bar-view-docked-container-shape` | `sys.shape.corners.cornerExtraLarge` |
| `--m3e-comp-search-bar-view-full-screen-container-shape` | `sys.shape.corners.cornerNone` |
| `--m3e-comp-search-bar-view-full-screen-contained-container-color` | `sys.color.surfaceContainerLow` |
| `--m3e-comp-search-bar-view-docked-dropdown-shape` | `12px` |
| `--m3e-comp-search-bar-view-docked-dropdown-gap` | `2px` |
| `--m3e-comp-search-bar-view-docked-min-height` | `240px` |
| `--m3e-comp-search-bar-view-scrim-color` | `sys.color.scrim` |
| `--m3e-comp-search-bar-view-scrim-opacity` | `0.32` |

Input text is the baseline body-large role, consumed directly from the
typescale. `SearchAppBar` registers no color of its own: the Material source
reads the app bar's token family for its container, on-scroll, navigation, and
action colors, so it consumes `--m3e-comp-app-bar-*`. Disabled colors likewise
come from `--m3e-comp-text-field-disabled-*`, because the source resolves them
from the filled text field's roles.

A search bar ships flat: the generated `ContainerElevation` is level 3, but both
of the source's own elevation defaults are level 0, so the token has no read
path and none is registered. Predictive back is excluded — it is an Android
system gesture, and the browser owns its own back affordance — along with
window insets, soft-keyboard interception, and the binary-compatibility shims.
The full list is in the conformance record.
