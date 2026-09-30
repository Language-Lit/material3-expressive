'use client'

import { useEffect, useRef, useState } from 'react'
import { Button, Surface, Text } from '@language-lit/material3-expressive'
import { useLocale } from '../../i18n/useLocale'
import { agUiMessages } from '../../i18n/messages/agUi'
import { AgentProvider, MessageThread, RunStatus, useAgentContext } from '@language-lit/material3-expressive-ag-ui'
import { DemoAgent } from './demo-agent'
import { scenariosFor, type Scenario, type ScenarioId } from './scenarios'
import { WeatherCard } from './WeatherCard'
import { ProjectPlan } from './ProjectPlan'
import { InvitationCard } from './InvitationCard'

const toolRenderers = { show_weather: WeatherCard, show_project: ProjectPlan, preview_invitation: InvitationCard }

function Playback({ scenario, reset }: { scenario: Scenario; reset: () => void }) {
  const locale = useLocale()
  const t = agUiMessages[locale]
  const { agent, send, stop, isRunning, interrupts, phase, timeline } = useAgentContext()
  const [started, setStarted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [stopped, setStopped] = useState(false)
  const [failure, setFailure] = useState('')
  const transcriptRef = useRef<HTMLDivElement>(null)
  const wasInterrupted = useRef(false)
  const pending = useRef(false)

  useEffect(() => () => agent.abortRun(), [agent])

  useEffect(() => {
    // MessageThread owns scrolling. Make that scroll container reachable by
    // keyboard in browsers that do not add it to the tab order automatically.
    const thread = transcriptRef.current?.firstElementChild
    if (thread instanceof HTMLElement) thread.tabIndex = 0
  }, [])

  // An approval removes its own buttons. Return focus only when the reader
  // was using those buttons, so completing a run never steals focus elsewhere.
  useEffect(() => {
    if (wasInterrupted.current && !interrupts.length && document.activeElement === document.body) {
      transcriptRef.current?.focus()
    }
    wasInterrupted.current = interrupts.length > 0
  }, [interrupts.length])

  async function play() {
    if (pending.current) return
    pending.current = true
    transcriptRef.current?.focus()
    setStarted(true)
    setFinished(false)
    setStopped(false)
    setFailure('')
    try {
      await send(scenario.prompt)
    } catch (error) {
      if (!(error instanceof Error && error.name === 'AbortError')) {
        setFailure(t.failureStatus)
      }
    } finally {
      pending.current = false
      setFinished(true)
    }
  }

  const restingStatus = failure || (interrupts.length ? t.waitingApproval
    : stopped ? t.stoppedStatus
      : finished && !isRunning && phase !== 'error' ? t.completeStatus : '')

  return (
    <Surface color="surface" shape="extra-large" className="agui-demo__stage" data-scenario={scenario.id}>
      <div className="agui-demo__stage-heading">
        <Text as="h3" variant="titleLarge" id="scenario-title">{scenario.title}</Text>
        <Text as="p" variant="bodyMedium" id="scenario-description">{scenario.description}</Text>
      </div>
      <div ref={transcriptRef} tabIndex={-1} role="region" aria-label={t.demoRegion} className="agui-demo__transcript">
        <MessageThread emptyState={
          <div className="agui-demo__empty">
            <Text as="p" variant="titleMedium">{scenario.prompt}</Text>
            <Text as="p" variant="bodyMedium">{t.playEmpty}</Text>
          </div>
        } />
      </div>
      <div className="agui-demo__footer">
        <RunStatus workingLabel={t.playing} />
        <p className="agui-demo__status" role="status">{!isRunning && phase !== 'error' ? restingStatus : ''}</p>
        <div className="agui-demo__actions">
          <Button onClick={() => void play()} disabled={started} aria-describedby="scenario-description">
            {t.playScenario}
          </Button>
          {isRunning ? (
            <Button variant="outlined" onClick={() => { setStopped(true); stop(); transcriptRef.current?.focus() }}>{t.stop}</Button>
          ) : (
            <Button variant="outlined" disabled={!started && !timeline.length} onClick={reset}>{t.resetDemo}</Button>
          )}
        </div>
      </div>
    </Surface>
  )
}

function DemoSession({ scenario, locale }: { scenario: Scenario; locale: ReturnType<typeof useLocale> }) {
  const [session, setSession] = useState(() => ({ agent: new DemoAgent(scenario.id, locale), revision: 0 }))
  const sessionRef = useRef<HTMLDivElement>(null)
  function reset() {
    setSession(({ revision }) => ({ agent: new DemoAgent(scenario.id, locale), revision: revision + 1 }))
    requestAnimationFrame(() => sessionRef.current?.querySelector<HTMLButtonElement>('button')?.focus())
  }
  return (
    <div ref={sessionRef} className="agui-demo__session">
      <AgentProvider key={session.revision} agent={session.agent} toolRenderers={toolRenderers}>
        <Playback scenario={scenario} reset={reset} />
      </AgentProvider>
    </div>
  )
}

export function AgUiDemo() {
  const locale = useLocale()
  const t = agUiMessages[locale]
  const scenarios = scenariosFor(locale)
  const [scenarioId, setScenarioId] = useState<ScenarioId>(scenarios[0].id)
  const scenario = scenarios.find((item) => item.id === scenarioId) ?? scenarios[0]
  return (
    <div className="agui-demo">
      <div className="agui-demo__choices" role="group" aria-label={t.scenariosLabel}>
        <Text as="p" variant="labelLarge">{t.chooseScenario}</Text>
        {scenarios.map((item, index) => (
          <Button key={item.id} variant={item.id === scenario.id ? 'tonal' : 'text'}
            aria-pressed={item.id === scenario.id} onClick={() => setScenarioId(item.id)}>
            {index + 1}. {item.title}
          </Button>
        ))}
        <Text as="p" variant="bodySmall" className="agui-demo__note">
          {t.note}
        </Text>
      </div>
      <DemoSession key={`${locale}-${scenario.id}`} scenario={scenario} locale={locale} />
    </div>
  )
}
