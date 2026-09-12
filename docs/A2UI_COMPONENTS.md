# A2UI components and rendering rules

`@language-lit/material3-expressive-a2ui` implements the complete A2UI
v0.9.1 basic catalog. Each catalog component renders with a Material 3
Expressive component, and every color, type style, corner, and motion value
resolves to a design-system token, so surfaces follow your theme in light and
dark modes.

Start with the [setup guide](A2UI_GETTING_STARTED.md) to install the
packages, load both stylesheets, and render a surface.

## What renders as what

| A2UI component | Material 3 Expressive | Notes |
| --- | --- | --- |
| `Text` | [Text](components/Text.md) | `h1` to `h5` map to headline and title roles, `caption` is small and muted, `body` is the reading size. Markdown subset: bold, italic, code, links, headings, and lists. |
| `Image` | Image with variant sizing | `icon`, `avatar` (round), `smallFeature`, `mediumFeature`, `largeFeature`, and `header` (full width). `fit` maps to object-fit. |
| `Icon` | [Icon](components/Icon.md) | Catalog names render as embedded glyphs with no font required. `svgPath` renders inline. |
| `Video` | Native video player | Controls enabled. |
| `AudioPlayer` | Native audio player | Controls enabled. |
| `Row` | Flex row | `justify`, `align`, and child `weight`. |
| `Column` | Flex column | `justify`, `align`, and child `weight`. |
| `List` | List | Vertical or horizontal. |
| `Card` | Outlined [Card](components/Card.md) | Passive container. |
| `Tabs` | [Tabs](components/Tabs.md) | One tab per entry, keyboard operable. |
| `Modal` | [Dialog](components/Dialog.md) | The trigger opens the dialog and its own action still dispatches. |
| `Divider` | [Divider](components/Divider.md) | Horizontal or vertical. |
| `Button` | [Button](components/Button.md) | `primary` is filled, `default` is tonal, `borderless` is text. Disabled while `checks` fail. |
| `TextField` | [TextField](components/TextField.md) or [TextArea](components/TextArea.md) | `shortText`, `longText`, `obscured`, and `number` variants. |
| `CheckBox` | [Checkbox](components/Checkbox.md) | Labeled. |
| `ChoicePicker` | [Radio](components/Radio.md), [Checkbox](components/Checkbox.md), or filter [Chip](components/Chip.md) | `mutuallyExclusive` or `multipleChoice`, with an optional filter field. |
| `Slider` | [Slider](components/Slider.md) | Decimal precision follows the range. |
| `DateTimeInput` | `DatePicker`, `TimePicker`, or `DateTimePicker` | Uses the Material picker capability in 1.3.0-rc.1. The declared 1.2 peer line remains loadable through a native-input compatibility fallback. Explicitly zoned date-times display in local civil time and are written back as UTC instants. |

## Streaming and placeholders

An agent can name children before it sends them. A `Column` whose `children`
lists ids that have not arrived renders a placeholder for each one, then
replaces it as soon as the matching `updateComponents` message lands. The
demo's first scenario shows the shape of a card before its content exists.

Each component subscribes to its own model, so an update to one component
re-renders that component and nothing else.

## Data binding

Properties accept a literal, a `{ "path": "/some/value" }` binding, or a
function call such as `formatCurrency` or `formatDate`. Bindings read from
the surface data model that `updateDataModel` messages fill.

Inputs write back into the same model. A `TextField` bound to `/name` updates
`/name` as the user types, and any `Text` bound to the same path updates with
it. Send the model to the agent with `getClientDataModel()` when a surface was
created with `sendDataModel`.

Templates repeat a component for each item in a list:

```json
{
  "id": "flights",
  "component": "Column",
  "children": { "path": "/flights", "componentId": "flight-row" }
}
```

Inside `flight-row`, relative paths such as `{ "path": "airline" }` resolve
against each item. Adding an item to `/flights` with a later
`updateDataModel` adds a row.

## Validation and actions

`checks` attach a condition and a message to an input or a button. A field
with failing checks shows its message after the user has touched it. A button
with failing checks is disabled, so its action can only dispatch with valid
data. The condition uses the catalog's functions, including `required`,
`email`, `regex`, `and`, `or`, and `not`.

A `Button` dispatches its `action.event` when pressed. Every `{ "path" }` in
the event `context` resolves before the action reaches your `onAction`
callback. The action object is what you send to the agent:

| Field | Meaning |
| --- | --- |
| `name` | The event name from the button. |
| `surfaceId` | The surface the button belongs to. |
| `sourceComponentId` | The button's component id. |
| `timestamp` | When the user pressed it, as an ISO 8601 string. |
| `context` | The resolved context object. |

## Theming and attribution

Surfaces inherit the theme of the nearest `Material3Provider`. Light, dark,
and system color modes, custom source colors, and nested theme scopes all
apply without configuration.

The `theme` field of `createSurface` can carry `agentDisplayName`,
`iconUrl`, and `primaryColor`. `A2uiSurface` shows the name and icon above
the surface content when either is present. Pass `attribution={false}` to
hide it. `primaryColor` is exposed as the `--m3e-a2ui-agent-color` custom
property on the surface element and used for the attribution. It does not
re-theme the surface, because a color the agent picked is not a Material
theme.

To restyle one instance, set the design system's public component aliases
on an ancestor you own. Do not target `.m3e-` class names, which are private.

## Extend the catalog

Add a component of your own, or replace one, with
`createMaterial3Component` and `createMaterial3Catalog`. An implementation is
a presentational component that receives resolved props and a `buildChild`
function:

```tsx
import { Text } from '@language-lit/material3-expressive'
import { TextApi } from '@a2ui/web_core/v0_9/basic_catalog'
import {
  createMaterial3Catalog,
  createMaterial3Component,
  useA2ui,
} from '@language-lit/material3-expressive-a2ui'

const ShoutingText = createMaterial3Component(TextApi, ({ props }) => (
  <Text as="p" variant="bodyLarge">{String(props.text).toUpperCase()}</Text>
))

const catalog = createMaterial3Catalog({
  components: [ShoutingText],
  locale: 'pt-BR',
})

// Inside a component:
const a2ui = useA2ui({ catalogs: [catalog] })
```

Later entries with the same name win, so a single override replaces the
default implementation. `locale` binds `formatCurrency`, `formatDate`, and
the other formatting functions to a locale. Pass `id` to publish the catalog
under your own catalog id, or `functions` to replace the function set.

## Use the catalog under Google's React surface

`material3Catalog` is a `@a2ui/web_core` catalog whose implementations use
the render-only shape that Google's `@a2ui/react` surface consumes. A host
that already renders with that surface can register the Material catalog and
keep its own surface, transport, and fallback policy. Only the stylesheet
from this package is needed in that case.

```tsx
import { A2uiSurface } from '@a2ui/react/v0_9'
import { MessageProcessor } from '@a2ui/web_core/v0_9'
import { material3Catalog } from '@language-lit/material3-expressive-a2ui'

const processor = new MessageProcessor([material3Catalog], onAction)
// processor.processMessages(messages)
// <A2uiSurface surface={processor.model.surfacesMap.get(surfaceId)!} />
```

The companion's test suite renders its catalog under `@a2ui/react` 0.11.0.
That package is not a dependency of the companion and itself requires
React 19.

## Limits

- The basic catalog only, by default. Other catalogs need implementations
  registered through `createMaterial3Catalog`.
- Icon names outside the catalog list fall back to a Material Symbols
  ligature, which renders only if your app loads that font.
- The Markdown subset has no tables, images, raw HTML, or nested lists. Links
  open for `http`, `https`, `mailto`, and `tel` only.
- `DateTimeInput` uses the Material picker exports in 1.3.0-rc.1 and falls back
  to the platform input when installed with the compatible 1.2 peer line.
- Transport, authentication, persistence, and agent orchestration are the
  application's responsibility.

The [package source](https://github.com/Language-Lit/material3-expressive-a2ui/tree/main)
contains the complete exported TypeScript definitions and tests.
