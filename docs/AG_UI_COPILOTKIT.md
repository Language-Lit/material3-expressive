# AG-UI with CopilotKit

The Material adapter supports **CopilotKit 1.71.x v1 only**. It was tested with
1.71.0. CopilotKit's v2 slot API is not supported by
`@language-lit/material3-expressive-ag-ui`.

Use this adapter when CopilotKit already owns your conversation. For a native
AG-UI agent, use the [getting started guide](AG_UI_GETTING_STARTED.md).

## Install the optional peers

Install the packages from the [native setup](AG_UI_GETTING_STARTED.md#install),
then add the supported CopilotKit peers:

```bash
npm install @copilotkit/react-core@~1.71.0 @copilotkit/react-ui@~1.71.0
```

Keep both Material stylesheets imported at your application root:

```tsx
import '@language-lit/material3-expressive/styles.css'
import '@language-lit/material3-expressive-ag-ui/styles.css'
```

## Apply the preset

Inside your existing `CopilotKit` and `Material3Provider` providers, spread
`copilotKitComponents` onto the chat:

```tsx
'use client'

import { CopilotChat } from '@copilotkit/react-ui'
import { copilotKitComponents } from
  '@language-lit/material3-expressive-ag-ui/copilotkit'

export function MaterialChat() {
  return <CopilotChat {...copilotKitComponents} />
}
```

The same preset works with `CopilotPopup` and `CopilotSidebar`. It includes
Material message views, input controls, and the header, launcher, and dialog
used by those containers. When adding a `className`, retain the preset's class:

```tsx
<CopilotChat
  {...copilotKitComponents}
  className={`${copilotKitComponents.className} support-chat`}
/>
```

CopilotKit styles may still be needed for its other features, including
suggestions and attachments. The adapter's controls use the Material styles.

## Keep CopilotKit in charge of the conversation

Do not wrap the adapter in this package's `AgentProvider`. CopilotKit owns the
agent connection, messages, tool actions, and interrupts. Configure those
through your existing CopilotKit setup.

Register tool and approval renderers through CopilotKit as usual. The adapter
retains their UI and response callbacks. The native
`AgentProvider.toolRenderers` registry belongs to the native AG-UI setup and
does not configure the adapter.

CopilotKit can supply an empty generative-UI wrapper for an unregistered tool,
so that tool may have no visible fallback. Register a catch-all with
CopilotKit's `useDefaultTool` if every call should be visible. The
[adapter example](https://github.com/Language-Lit/material3-expressive-ag-ui/blob/main/playground/CopilotDemo.tsx)
shows that integration with `ToolCallCard`.

## Exported slots

The preset includes `AssistantMessage`, `UserMessage`, `Messages`, `Input`,
`RenderMessage`, `Window`, `Button`, and `Header`. You can also import them
individually from the `/copilotkit` entry. Each has an exported props type.

The entry also exports the legacy `RenderTextMessage`,
`RenderActionExecutionMessage`, `RenderAgentStateMessage`, and
`RenderResultMessage` slots. Their props are the AG-UI-shaped CopilotKit
1.71.x message props, not older GraphQL message instances.

Text remains plain text. The adapter does not add Markdown rendering. Check the
[release notes](https://github.com/Language-Lit/material3-expressive-ag-ui/releases)
before upgrading either side of the integration.
