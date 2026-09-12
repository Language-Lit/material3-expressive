# Getting started with MCP Apps

The MCP Apps companion connects Material 3 Expressive to the official MCP Apps
SDK. It provides a host frame for embedding apps and an app provider for building
their contents with Material components. This guide targets published version 0.2.1.

## Install

Install the companion and its peers:

```sh
npm install @language-lit/material3-expressive-mcp-apps@0.2.1
npm install @language-lit/material3-expressive @modelcontextprotocol/client@^2.0.0 @modelcontextprotocol/ext-apps@^2.0.0 react react-dom
```

Both the host document and the app document need the stylesheets, in this order:

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-mcp-apps/styles.css'
```

The companion supports Material 1.2.x and the 1.3 prerelease line, ext-apps
^2.0.0, split client ^2.0.0, and React/React DOM 18 or 19 peers. This
demonstration tests Material 1.3.0-rc.1,
ext-apps/client/server 2.0.0 and React 19. It is not a certification of external
host interoperability. The core Material package gains no MCP dependency.

## Build the app

Use the `./app` entry inside the iframe. It connects to the parent host,
follows host light/dark mode, and exposes the latest tool call.

```tsx
import { McpAppProvider, useToolCall, useMcpApp } from
  '@language-lit/material3-expressive-mcp-apps/app'
import { Button, Text } from '@language-lit/material3-expressive'

function ToolContent() {
  const { result } = useToolCall()
  const { app, isConnected, hostCapabilities } = useMcpApp()
  return <>
    <Text as="p" variant="bodyMedium">
      {result ? 'Result received' : 'Waiting for a tool result'}
    </Text>
    <Button disabled={!isConnected || !hostCapabilities?.message}
      onClick={() => void app?.sendMessage({
        role: 'user', content: [{ type: 'text', text: 'Use this result.' }],
      })}>Add to chat</Button>
  </>
}

export function App() {
  return <McpAppProvider appInfo={{ name: 'my-tool-app', version: '1.0.0' }}>
    <ToolContent />
  </McpAppProvider>
}
```

Handle rejected requests in your UI and check the relevant host capability
before offering an action. `useToolCall<TArgs>()` exposes complete input,
partial input, result and cancellation. The host frame's props currently
deliver complete inputs, results and cancellation; advanced hosts can send
partial inputs through the SDK bridge exposed by `onBridge`.

Bundle the app's JavaScript and CSS into one HTML document. The companion
playground and site build scripts show this with esbuild. A host cannot load a
Vite development-only entry from a production resource.

## Register a resource and tool

On an MCP server, install the split server SDK and Zod as well. Use the
official extension helpers to connect a tool to its HTML resource:

```ts
import { McpServer } from '@modelcontextprotocol/server'
import { RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps'
import { registerAppResource, registerAppTool } from '@modelcontextprotocol/ext-apps/server'
import { z } from 'zod'

export function createServer(html: string) {
  const server = new McpServer({ name: 'my-tools', version: '1.0.0' })
  const uri = 'ui://my-tools/result.html'
  registerAppResource(server, 'result-app', uri, {}, async () => ({
    contents: [{ uri, mimeType: RESOURCE_MIME_TYPE, text: html }],
  }))
  registerAppTool(server, 'show_result', {
    inputSchema: z.object({ query: z.string() }),
    _meta: { ui: { resourceUri: uri } },
  }, async ({ query }) => ({
    content: [{ type: 'text', text: query }],
    structuredContent: { query },
  }))
  return server
}
```

Connect the server to your application's chosen MCP transport. The library
does not choose a backend, configure authentication, or run an agent. The
static demonstration connects client and server over an in-memory transport.

## Host the app

Create a client with `mcpAppsClientCapabilities` and await its connection.
Read the tool's `_meta.ui.resourceUri`, then render `McpAppFrame` with the
resource, tool result, a separate-origin `sandboxUrl`, and an
`onAuthorizeToolCall` policy. See [Hosting and theming MCP Apps](MCP_APPS_HOSTING.md)
for a typed example, capabilities and sandbox policy.

The app side does not require a Material host: it speaks MCP Apps through the
official SDK. Likewise, the host frame can embed apps built with another UI
framework. Host implementations may support different optional capabilities.
See the [official MCP Apps documentation](https://apps.extensions.modelcontextprotocol.io/api/)
for the stable protocol, SDK APIs and host responsibilities.
