# Getting started with A2UI

`@language-lit/material3-expressive-a2ui` renders Google A2UI surfaces with
Material 3 Expressive. A2UI is a protocol in which an agent describes a user
interface as a tree of catalog components with data bindings, streamed as
JSON messages. The companion maps every component of the A2UI basic catalog to
a Material 3 Expressive component, so agent-generated UI shares one theme
with the rest of your app.

This guide covers React 18 or 19, `@language-lit/material3-expressive` 1.2.x,
and A2UI protocol v0.9.1 through `@a2ui/web_core` 0.10.x. The companion is an
independent community implementation and is not affiliated with Google.

## Try it before connecting an agent

The [interactive demo](https://m3e.language-lit.com/a2ui/) runs entirely in
your browser. It streams scripted A2UI messages into the renderer one at a
time, so you can watch placeholders fill in, edit bound fields, pass
validation checks, and see the actions an agent would receive. No LLM is
called and no API key is needed.

## Install

In an existing React app, install the companion and its required peers:

```bash
npm install @language-lit/material3-expressive-a2ui @language-lit/material3-expressive @a2ui/web_core
```

`@a2ui/web_core` is Google's protocol runtime. It validates messages, owns the
surface and data models, and evaluates bindings and catalog functions. The
companion has no runtime dependencies of its own.

## Load the styles

Import both stylesheets once at the application root, in this order:

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-a2ui/styles.css'
```

Both packages use the same Material theme. An existing `Material3Provider`
can contain the rest of your app and the agent surfaces together. See the
[theme guide](THEMING.md) for custom colors and nested scopes.

## Render a surface

Own a message processor with `useA2ui`, hand it the messages your agent
sends, and render each surface with `A2uiSurface`:

```tsx
'use client'

import { Material3Provider } from '@language-lit/material3-expressive'
import { A2uiSurface, useA2ui } from '@language-lit/material3-expressive-a2ui'
import type { A2uiClientAction, A2uiMessage } from '@a2ui/web_core/v0_9'

export function AgentPanel({ send }: { send: (action: A2uiClientAction) => void }) {
  const { surfaces, processMessages } = useA2ui({
    onAction: (action) => send(action),
    onError: (error, surfaceId) => console.warn(surfaceId, error),
  })

  // Call this with each batch your transport delivers.
  const receive = (messages: A2uiMessage[]) => processMessages(messages)

  return (
    <Material3Provider>
      {surfaces.map((surface) => (
        <A2uiSurface key={surface.id} surface={surface} />
      ))}
    </Material3Provider>
  )
}
```

The companion does not provide transport. Your agent framework delivers A2UI
messages over A2A, HTTP, WebSocket, or any other channel. Parse each JSON
line and pass the objects to `processMessages`, one at a time or in a batch.
Surfaces appear as `createSurface` messages arrive and disappear on
`deleteSurface`.

`useA2ui` returns stable functions and a `surfaces` array that changes
whenever the surfaces do. Depend on the functions in effects, not on the
whole result object.

## Tell the agent what you can render

Send the client capabilities with your first request so the agent chooses
the basic catalog:

```ts
const { getClientCapabilities, getClientDataModel } = useA2ui()

const capabilities = getClientCapabilities()
// { 'v0.9.1': { supportedCatalogIds: ['https://a2ui.org/specification/v0_9/catalogs/basic/catalog.json'] } }

const dataModel = getClientDataModel()
// The data model of every surface created with sendDataModel, or undefined.
```

## Send actions back

A `Button` with an `action` dispatches a client action when pressed. The
action carries the surface, the source component, a timestamp, and the
resolved `context` the agent asked for. Send it to your agent:

```json
{
  "name": "reserve",
  "surfaceId": "table",
  "sourceComponentId": "reserve-button",
  "timestamp": "2026-09-11T10:00:00.000Z",
  "context": { "name": "Ada", "guests": 2 }
}
```

Buttons with `checks` stay disabled until every check passes, so an action
arrives only with valid data. The demo shows each action it would send.

## Errors you will see

`onError` receives two kinds of report. A message that fails validation is a
processor error and means the agent sent something the protocol does not
allow. An `EXPRESSION_ERROR` from a surface means a catalog function such as
`formatCurrency` or `required` ran while a value it needs was still missing.
That is routine while a surface is streaming in or a required field is still
empty, and it resolves as soon as the data arrives. Treat the second kind as a
diagnostic. Without an `onError`, processor errors are thrown from
`processMessages`.

## Next steps

- [Components and rendering rules](A2UI_COMPONENTS.md): what each catalog
  component renders as, binding and validation, templates, theming, and how
  to extend the catalog or use it under Google's own React surface.
- [A2UI specification](https://a2ui.org): the protocol, the basic catalog,
  and the message format.
