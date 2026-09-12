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
connected client. Apply authentication, tool authorization, rate limits and
any required confirmation in your host/server policy.

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

Direct embedding uses an opaque-origin sandbox with scripts/forms enabled.
A CSP meta element is installed before app content. Connections and nested
frames are denied by default; resource metadata declares allowed resource,
connection, frame and base-URI domains. Validate those requests against your
host's trust policy before passing the resource to the frame. Metadata is not
authorization to grant arbitrary origins or powerful browser permissions.

For a separate sandbox service, pass `sandboxUrl`. Your proxy must implement
the SDK sandbox handshake, enforce CSP/permissions, and isolate app HTML on
an appropriate origin. The package passes policy metadata but does not supply
the proxy server. `buildContentSecurityPolicy` builds a header value for this
purpose. Review any `sandbox` override carefully; do not give untrusted HTML
same-origin access on the host's origin.

See [Getting started](MCP_APPS_GETTING_STARTED.md) for server registration and
the [official protocol](https://apps.extensions.modelcontextprotocol.io/api/)
for sandbox responsibilities. The companion does not certify arbitrary HTML
as safe or replace the host's authorization layer.
