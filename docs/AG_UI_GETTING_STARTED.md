# Getting started with AG-UI

`@language-lit/material3-expressive-ag-ui` renders agent conversations with
Material 3 Expressive. AG-UI carries the messages, tool calls, and run events
between your agent and the interface. The library supplies the React UI.

This guide covers version **0.1.0**, with React 18 or 19 and
`@language-lit/material3-expressive` 1.2.x. The website demonstrates it with
AG-UI client and core 0.0.59. The package declares both AG-UI peers as >=0.0.50.

## Try it before connecting an agent

The [interactive demo](https://m3e.language-lit.com/ag-ui/) runs entirely in
your browser. Replies, forecasts, and project plans are scripted. You can
change forecast units, complete project tasks, or approve an invitation without
an API key. No invitation is sent and no LLM is called.

## Install

In an existing React app, install the companion and its required peers:

```bash
npm install @language-lit/material3-expressive-ag-ui @language-lit/material3-expressive @ag-ui/client @ag-ui/core
```

You do not need CopilotKit for the native AG-UI setup. If your app already uses
CopilotKit 1.71.x, follow the [adapter guide](AG_UI_COPILOTKIT.md).

## Load the styles

Import both stylesheets once at the application root, in this order:

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-ag-ui/styles.css'
```

Both packages use the same Material theme. An existing `Material3Provider`
can contain the rest of your app and the agent interface together. See the
[theme guide](THEMING.md) for custom colors and nested scopes.

## Connect an agent

Create an `HttpAgent` for your AG-UI endpoint, bind it with `AgentProvider`,
and render `AgentChat`. Keep the agent instance stable across renders.

```tsx
'use client'

import { useMemo } from 'react'
import { HttpAgent } from '@ag-ui/client'
import { Material3Provider } from '@language-lit/material3-expressive'
import {
  AgentChat,
  AgentProvider,
} from '@language-lit/material3-expressive-ag-ui'

export function AgentPanel() {
  const agent = useMemo(() => new HttpAgent({ url: '/api/agent' }), [])

  return (
    <Material3Provider>
      <AgentProvider agent={agent}>
        <AgentChat
          emptyState={<p>What would you like to work on?</p>}
          composer={{ label: 'Message your agent' }}
        />
      </AgentProvider>
    </Material3Provider>
  )
}
```

`/api/agent` is an example URL. Your application must provide an AG-UI endpoint
there, or replace it with the address of your agent. The library does not supply
a backend, model, or authentication service. Keep model credentials on your
server. The public demo uses a local `AbstractAgent` instead of `HttpAgent`.

For a full-height chat panel, give its parent a definite height, such as
`height: 40rem`. `AgentChat` fills that height and scrolls its thread.

## Choose a layout

`AgentChat` combines `MessageThread`, `RunStatus`, and `Composer`. You can
arrange those components yourself if your interface needs a different layout:

```tsx
import {
  Composer,
  MessageThread,
  RunStatus,
} from '@language-lit/material3-expressive-ag-ui'

// Render inside the AgentProvider from the previous example.
export function Conversation() {
  return (
    <section aria-label="Agent conversation">
      <MessageThread emptyState={<p>Start a conversation.</p>} />
      <RunStatus />
      <Composer label="Message your agent" />
    </section>
  )
}
```

Bind each agent once. Children of `AgentProvider` should use
`useAgentContext()` to read its state or send messages. Use `useAgent(agent)`
directly only when you are managing the binding without `AgentProvider`.

## Next steps

- [Components and tool renderers](AG_UI_COMPONENTS.md): render a tool as a card,
  share state with controls, and handle approvals.
- [CopilotKit adapter](AG_UI_COPILOTKIT.md): use the Material UI with a
  CopilotKit 1.71.x v1 application.
- [Version 0.1.0 release](https://github.com/Language-Lit/material3-expressive-ag-ui/releases/tag/v0.1.0):
  the published release this guide describes.
