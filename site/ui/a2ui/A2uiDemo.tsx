'use client'

import { useEffect, useRef, useState } from 'react'
import type { A2uiClientAction } from '@a2ui/web_core/v0_9'
import { Button, Surface, Text } from '@language-lit/material3-expressive'
import { A2uiSurface, useA2ui } from '@language-lit/material3-expressive-a2ui'
import { messageCount, scenarios, type Scenario } from './scenarios'

const STEP_MS = 420

type Phase = 'idle' | 'playing' | 'done' | 'stopped' | 'failed'

interface ActionEntry {
  readonly key: number
  readonly name: string
  readonly source: string
  readonly context: string
}

function Playback({ scenario, reset }: { scenario: Scenario; reset: () => void }) {
  const [phase, setPhase] = useState<Phase>('idle')
  const [stepsDone, setStepsDone] = useState(0)
  const [actions, setActions] = useState<ActionEntry[]>([])
  const timer = useRef<number>(0)
  const surfacesRef = useRef<HTMLDivElement>(null)
  const total = messageCount(scenario)

  const { surfaces, processMessages } = useA2ui({
    onAction: (action: A2uiClientAction) => {
      setActions((entries) => [
        {
          key: Date.now() + entries.length,
          name: action.name,
          source: action.sourceComponentId,
          context: JSON.stringify(action.context, null, 2),
        },
        ...entries,
      ])
    },
    // A surface report (with an id) is a diagnostic such as a function
    // evaluated before its data arrived. A processor error means a message
    // was rejected, which would be a defect in the scripted stream.
    onError: (error, surfaceId) => {
      if (surfaceId) return
      console.error(error)
      window.clearTimeout(timer.current)
      setPhase('failed')
    },
  })

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function play() {
    if (phase !== 'idle') return
    setPhase('playing')
    surfacesRef.current?.focus()
    let index = 0
    const run = () => {
      const step = scenario.steps[index]
      if (!step) {
        setPhase('done')
        return
      }
      processMessages(step.messages)
      index += 1
      setStepsDone(index)
      timer.current = window.setTimeout(run, step.wait ?? STEP_MS)
    }
    run()
  }

  function stop() {
    window.clearTimeout(timer.current)
    setPhase('stopped')
    surfacesRef.current?.focus()
  }

  const sent = scenario.steps.slice(0, stepsDone).reduce((count, step) => count + step.messages.length, 0)
  const stream = scenario.steps
    .slice(0, stepsDone)
    .flatMap((step) => step.messages)
    .map((message) => JSON.stringify(message))
    .join('\n')

  const status =
    phase === 'playing' ? `Streaming message ${sent} of ${total}.`
      : phase === 'done' ? 'Stream complete. Use the surface, then reset to replay.'
        : phase === 'stopped' ? 'Demo stopped. Reset to start again.'
          : phase === 'failed' ? 'The demo could not finish. Reset it and try again.'
            : ''

  return (
    <Surface color="surface" shape="extra-large" className="a2ui-demo__stage" data-scenario={scenario.id}>
      <div className="a2ui-demo__stage-heading">
        <Text as="h3" variant="titleLarge" id="a2ui-scenario-title">{scenario.title}</Text>
        <Text as="p" variant="bodyMedium" id="a2ui-scenario-description">{scenario.description}</Text>
      </div>
      <div ref={surfacesRef} tabIndex={-1} role="region" aria-label="Agent surfaces" className="a2ui-demo__surfaces">
        {surfaces.length === 0 ? (
          <div className="a2ui-demo__empty">
            <Text as="p" variant="titleMedium">{scenario.prompt}</Text>
            <Text as="p" variant="bodyMedium">
              {phase === 'idle' ? 'Play the scenario to stream the surface.' : 'The stream has not created a surface yet.'}
            </Text>
          </div>
        ) : (
          surfaces.map((surface) => <A2uiSurface key={surface.id} surface={surface} />)
        )}
      </div>
      <div className="a2ui-demo__footer">
        <p className="a2ui-demo__status" role="status">{status}</p>
        <div className="a2ui-demo__controls">
          <Button onClick={play} disabled={phase !== 'idle'} aria-describedby="a2ui-scenario-description">
            Play scenario
          </Button>
          {phase === 'playing' ? (
            <Button variant="outlined" onClick={stop}>Stop</Button>
          ) : (
            <Button variant="outlined" disabled={phase === 'idle'} onClick={reset}>Reset demo</Button>
          )}
        </div>
        <section className="a2ui-demo__log" aria-labelledby="a2ui-actions-title">
          <Text as="h4" variant="titleSmall" id="a2ui-actions-title">Actions the agent would receive</Text>
          {actions.length === 0 ? (
            <Text as="p" variant="bodySmall" className="a2ui-demo__hint">
              None yet. Press a button inside a surface to send one.
            </Text>
          ) : (
            <ul className="a2ui-demo__actions">
              {actions.map((entry) => (
                <li key={entry.key}>
                  <Text as="p" variant="labelLarge">
                    <code>{entry.name}</code> from <code>{entry.source}</code>
                  </Text>
                  <pre className="a2ui-demo__code"><code>{entry.context}</code></pre>
                </li>
              ))}
            </ul>
          )}
        </section>
        <details className="a2ui-demo__stream">
          <summary>Show the A2UI messages streamed so far ({sent})</summary>
          <pre className="a2ui-demo__code"><code>{stream || 'Nothing streamed yet.'}</code></pre>
        </details>
      </div>
    </Surface>
  )
}

function DemoSession({ scenario }: { scenario: Scenario }) {
  const [revision, setRevision] = useState(0)
  const sessionRef = useRef<HTMLDivElement>(null)
  function reset() {
    setRevision((value) => value + 1)
    requestAnimationFrame(() => sessionRef.current?.querySelector<HTMLButtonElement>('button')?.focus())
  }
  return (
    <div ref={sessionRef} className="a2ui-demo__session">
      <Playback key={revision} scenario={scenario} reset={reset} />
    </div>
  )
}

export function A2uiDemo() {
  const [scenario, setScenario] = useState<Scenario>(scenarios[0])
  return (
    <div className="a2ui-demo">
      <div className="a2ui-demo__choices" role="group" aria-label="Demo scenarios">
        <Text as="p" variant="labelLarge">Choose a scenario</Text>
        {scenarios.map((item, index) => (
          <Button key={item.id} variant={item.id === scenario.id ? 'tonal' : 'text'}
            aria-pressed={item.id === scenario.id} onClick={() => setScenario(item)}>
            {index + 1}. {item.title}
          </Button>
        ))}
        <Text as="p" variant="bodySmall" className="a2ui-demo__note">
          Every message is scripted. You can stop playback at any time.
        </Text>
      </div>
      <DemoSession key={scenario.id} scenario={scenario} />
    </div>
  )
}
