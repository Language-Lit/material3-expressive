# Hosting and theming MCP Apps

`McpAppFrame` embeds a UI resource from a connected MCP server. It owns the
iframe and SDK bridge, derives host context from the surrounding Material
provider, and delivers the tool call after the app initializes.

## Connect and render

Advertise the extension when constructing your MCP client:

```ts
import { Client } from '@modelcontextprotocol/client'
import { mcpAppsClientCapabilities } from '@language-lit/material3-expressive-mcp-apps'

const client = new Client({ name: 'my-host', version: '1.0.0' }, {
  capabilities: mcpAppsClientCapabilities,
})
// Await client.connect(yourTransport) before rendering the frame.
```

The resource hook handles loading and errors, including UI metadata published
in `resources/list` rather than the read result:

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import { McpAppFrame, useMcpAppResource } from '@language-lit/material3-expressive-mcp-apps'
import type { Client, CallToolResult } from '@modelcontextprotocol/client'

export function ToolPanel({ client, uri, result }: {
  client: Client; uri: string; result: CallToolResult
}) {
  const { resource, loading, error } = useMcpAppResource(client, uri)
  if (error) return <p role="alert">{error.message}</p>
  if (loading || !resource) return <p>Loading app…</p>
  return <Material3Provider>
    <McpAppFrame client={client} resource={resource} title="Tool result"
      sandboxUrl={sandboxUrl}
      onAuthorizeToolCall={async ({ name, arguments: args }) =>
        name === 'refresh_result' && await mayRefresh(args)}
      toolResult={result} maxHeight={600}
      availableDisplayModes={['inline', 'fullscreen', 'pip']} />
  </Material3Provider>
}
```

Pass `toolInfo={{ id, tool }}` and `toolInput={arguments}` when available.
`toolCancelled={{ reason }}` delivers cancellation. Values are sent after
initialization and again when their references change. Use fresh objects for
new notifications. Pass `null` as client only when no server access is needed.

## Enable host actions deliberately

| Prop | Host behavior |
| --- | --- |
| `onMessage` | Receives a request to add a user turn; return false to refuse |
| `onUpdateModelContext` | Receives context intended for the model |
| `onDownloadFile` | Handles download requests; return false to refuse |
| `onOpenLink` | Handles URLs; return false to refuse |
| `onLog` | Receives app logs |
| `onBridge` | Exposes the SDK bridge for advanced protocol operations |
| `onStatusChange`, `onError` | Report lifecycle and failures |
| `onTeardownRequest` | App asked to close; host decides when to unmount |

Message, context-update and download capabilities are advertised only when
their callbacks exist. Without a custom link handler, HTTP(S) links open in
a new tab with `noopener`; other schemes are refused. The demo records link
requests locally. The SDK proxies server tools and resources through your
connected client. App-originated tool calls are denied unless
`onAuthorizeToolCall` returns true. Authenticate and authorize the same call
again on the MCP server; the browser callback is not a backend security boundary.

## Theme and style projection

The frame reads live Material CSS tokens from its surrounding provider and
projects them into MCP style variables for colors, typography, radii and
shadows. `styleVariables` overrides this projection. `fonts` accepts font-face
CSS; `collectFontFaceCss` reads accessible same-origin stylesheets. Cross-origin
font requests from an opaque iframe need suitable CORS and CSP permissions.
The preview uses local fallback fonts and needs no font fetch inside the app.

Material has no success/warning roles, so protocol success/warning map to
tertiary/secondary. Monospace uses a system stack; regular borders use 1px;
semibold maps to Material medium. These are adaptation choices, not additional
Material tokens.

`McpAppProvider` follows host light/dark mode, exposes host variables on its
root, applies supplied fonts, and pads safe areas. A host's custom palette is
not reconstructed from those protocol variables into a complete Material
theme. Pass a shared `theme` explicitly when you control both sides and need
identical custom colors. `colorMode` can override the host. The provider's
document-theme and host-style effects can be disabled through their props.

## Layout and lifecycle

Inline height follows app size notifications, bounded by `minHeight` and
`maxHeight`. Fullscreen and pip reposition the surface around the same iframe,
preserving app state. Control the mode with `displayMode` and
`onDisplayModeChange`, or use `defaultDisplayMode`. Apps request a mode through
`useDisplayMode`; only host-offered modes are granted.

Fullscreen is CSS layout, not a modal dialog or the browser Fullscreen API.
The frame has exit controls. Escape in host controls returns inline; keyboard
events inside an iframe do not bubble to its parent, so an app should implement
its own keyboard exit if required. There is no modal focus-trap claim.

Unmounting closes the bridge. Changing the resource or handshake capability
presence reconnects it. Callback identity changes do not reconnect. A custom
transport is read at connection creation, not switched during an active session.

## Resource trust and sandbox policy

Browser embedding requires `sandboxUrl`, an HTTP(S) proxy on a different origin
from the host. The proxy performs the SDK sandbox handshake, serves the app in
an inner iframe, and enforces resource CSP and permissions. Validate resource
policy requests against host policy before granting them.

The companion repository includes a separately built service under
`deploy/sandbox`. Its launch URL carries a signed, short-lived ticket issued by
an authenticated host backend. Configure the service with its exact public
origin, exact allowed host origins, and a server-side secret of at least 32
random bytes. Never put that secret in browser code. The service uses in-memory,
one-use views, so deploy one instance or enable sticky routing.

See [Getting started](MCP_APPS_GETTING_STARTED.md) for server registration and
the [official protocol](https://apps.extensions.modelcontextprotocol.io/api/)
for sandbox responsibilities. The companion does not certify arbitrary HTML
as safe or replace the host's authorization layer.
