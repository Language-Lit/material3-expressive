# AG-UI components and tool renderers

Use the assembled chat for a familiar conversation layout, or compose the
individual components around your app. The components below come from
`@language-lit/material3-expressive-ag-ui@0.1.0`. Custom forecast, project,
and invitation cards in the demo are examples built with the core Material
components, not extra exports from the AG-UI package.

Start with the [setup guide](AG_UI_GETTING_STARTED.md) to install the packages,
load both stylesheets, and bind an agent.

## Conversation components

| Component | What it does |
| --- | --- |
| `AgentChat` | Combines the thread, run status, and composer. Accepts an `emptyState` and `composer` options. |
| `MessageThread` | Renders the timeline, including registered tool renderers. Follows new content while the reader is at the bottom. |
| `UserMessage` | Displays a user turn on a Material surface. Takes a `UserNode`. |
| `AssistantMessage` | Displays an assistant reply and a caret while it streams. Takes an `AssistantTextNode`. |
| `ReasoningDisclosure` | Lets the reader open reasoning text. Takes a `ReasoningNode`; `defaultExpanded` defaults to false. |
| `ToolCallCard` | Shows the tool name, progress, arguments, and result. Takes a `ToolCallNode`; details start collapsed. |
| `ActivityRow` | Displays a backend-defined activity type and its structured content. Takes an `ActivityNode`. |
| `InterruptPrompt` | Shows an approval question with Approve and Cancel actions. Takes an `InterruptNode` and optional action labels. |
| `RunStatus` | Announces a running step or failure. Accepts a `workingLabel`. |
| `Composer` | Supplies a labeled message field and send/stop control. Accepts `label`, `placeholder`, `disabled`, and action labels. |

`AgentProvider` binds an agent and supplies it to the components that need it.
`MessageThread` chooses the appropriate component for each timeline entry, so
you do not need to build or pass individual nodes for a standard chat.

## Render a tool as a component

Register a function under the exact tool name in `AgentProvider.toolRenderers`.
It receives `node`, the current tool call, and `agent`, the bound agent state
and actions. Names without a renderer use `ToolCallCard`.

```tsx
import { Surface, Text } from '@language-lit/material3-expressive'
import type { ToolRendererProps } from '@language-lit/material3-expressive-ag-ui'

export function WeatherResult({ node }: ToolRendererProps) {
  const city = typeof node.args?.city === 'string'
    ? node.args.city : 'Loading city'
  const temperature = typeof node.args?.temperature === 'number'
    ? `${node.args.temperature} °C` : 'Loading temperature'

  return (
    <Surface color="tertiary-container" shape="large" style={{ padding: 24 }}>
      <Text as="h3" variant="titleLarge">{city}</Text>
      <Text as="p" variant="headlineMedium">{temperature}</Text>
      <Text as="p" variant="bodySmall">
        {node.status === 'complete' ? 'Forecast received' : 'Receiving forecast'}
      </Text>
    </Surface>
  )
}
```

Register it on the provider from the setup guide:

```tsx
<AgentProvider
  agent={agent}
  toolRenderers={{ show_weather: WeatherResult }}
>
  <AgentChat />
</AgentProvider>
```

The renderer runs while arguments are arriving. `node.args` can be undefined
or incomplete, and `node.argsComplete` tells you whether the JSON document has
finished. Check values before rendering them or passing them to another
component. In the demo, forecast rows appear only once their required fields
are present.

## Read tool state

| Field | Meaning |
| --- | --- |
| `name`, `id` | The tool name and stable call ID. |
| `rawArgs` | Argument text exactly as received, including an unfinished JSON tail. |
| `args` | A best-effort parsed object, or undefined. |
| `argsComplete` | Whether the argument document is complete. |
| `status` | `streaming`, `awaiting-result`, `complete`, or `error`. |
| `result`, `error` | Result or error text from the tool response, when available. |

The run and a tool call have separate lifecycles. A tool can have complete
arguments while its result is still pending. Use `status === 'complete'` when
a control needs the finished tool result.

## Connect controls to shared state

The bound agent exposes `state` and `setState`. Incoming `STATE_SNAPSHOT` and
`STATE_DELTA` events update the same state your components read. The project
demo uses it for completed task IDs, so the checklist, schedule, and progress
indicator stay in agreement.

```tsx
import { Checkbox, LinearProgress } from '@language-lit/material3-expressive'
import { useAgentContext } from '@language-lit/material3-expressive-ag-ui'

export function ReviewTask() {
  const { state, setState, isRunning } = useAgentContext()
  const complete = state?.reviewComplete === true

  return (
    <div>
      <label>
        <Checkbox
          checked={complete}
          disabled={isRunning}
          onCheckedChange={(checked) =>
            setState({ ...state, reviewComplete: checked })
          }
        />
        Review with the team
      </label>
      <LinearProgress
        aria-label="Review progress"
        value={complete ? 1 : 0}
      />
    </div>
  )
}
```

`setState` changes the local agent state. It does not save a task to a server
or start a run. Call `run()` when your workflow should send the updated state
to the agent, or persist it through your application's own data layer.

## Pause for approval

An AG-UI run requests approval by finishing with an interrupt outcome.
`MessageThread` renders each pending interrupt with `InterruptPrompt`.
The default actions answer it and resume through the SDK.

For your own approval controls, use `resolveInterrupt` from
`useAgentContext()`:

```tsx
// Inside a component that reads useAgentContext().
await resolveInterrupt(interruptId, { status: 'resolved' })

// Or decline the action.
await resolveInterrupt(interruptId, { status: 'cancelled' })
```

The backend decides what an approval means and whether the action can proceed.
An enabled button in a browser is not authorization for a server operation.
The demo resumes its local script and updates the invitation preview without
sending a message.

## Reading and keyboard behavior

Keep `RunStatus` alongside the thread. The thread itself is not a live region;
announcing the whole transcript for every text fragment would make it hard to
read with a screen reader. If your layout needs a completion or approval
announcement, add a brief status message for that transition.

Use labeled controls inside passive [Cards](components/Card.md) or
[Surfaces](components/Surface.md). Do not put buttons or inputs inside an
interactive Card, which is itself a button. The demo's
[Tabs](components/Tabs.md), [Checkboxes](components/Checkbox.md), and
[segmented buttons](components/SegmentedButtonGroup.md) keep their normal
keyboard behavior inside tool renderers.

When an approval removes the focused control, restore focus to a useful place
in your layout. The demo returns it to the conversation. Keep motion optional
and preserve the user's ability to scroll back while a reply arrives.

## Version 0.1.0 text behavior

Assistant and user text is displayed as plain text, preserving line breaks.
It is not a Markdown renderer. Supply your own content renderer if your app
needs rich text, and handle untrusted content appropriately.

The [package source](https://github.com/Language-Lit/material3-expressive-ag-ui/tree/v0.1.0)
contains the complete exported TypeScript definitions and tests.
