'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Select, Surface, Text } from '@language-lit/material3-expressive'
import { McpAppFrame, useMcpAppResource } from '@language-lit/material3-expressive-mcp-apps'
import type { CallToolResult, Tool } from '@modelcontextprotocol/client'
import { connectDemoServer, FORECAST_URI } from './server'
import { useLocale } from '../../i18n/useLocale'
import { mcpAppsMessages } from '../../i18n/messages/mcpApps'

const modes = ['inline', 'fullscreen', 'pip'] as const
type Connection = Awaited<ReturnType<typeof connectDemoServer>>
const productionSandbox = 'https://material3-expressive.vercel.app/mcp-apps/sandbox.html'

export function McpAppsDemo() {
  const locale = useLocale()
  const t = mcpAppsMessages[locale]
  const [connection, setConnection] = useState<Connection | null>(null)
  const [tool, setTool] = useState<Tool>()
  const [city, setCity] = useState('Lisbon')
  const [input, setInput] = useState<Record<string, unknown>>()
  const [result, setResult] = useState<CallToolResult>()
  const [generation, setGeneration] = useState(0)
  const [status, setStatus] = useState('connecting')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [events, setEvents] = useState<string[]>([])
  const [sandboxUrl, setSandboxUrl] = useState('')
  const revision = useRef(0)
  const runButton = useRef<HTMLButtonElement>(null)
  const record = useCallback((value: string) => setEvents((previous) => [value, ...previous].slice(0, 30)), [])
  const { resource, error: resourceError } = useMcpAppResource(connection?.client ?? null, FORECAST_URI)

  useEffect(() => {
    const proxyOrigin = ['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? `${window.location.protocol}//${window.location.hostname === 'localhost' ? '127.0.0.1' : 'localhost'}:${window.location.port}`
      : new URL(productionSandbox).origin
    setSandboxUrl(`${proxyOrigin}/mcp-apps/sandbox.html?hostOrigin=${encodeURIComponent(window.location.origin)}`)
  }, [])

  useEffect(() => {
    let disposed = false
    let active: Connection | undefined
    const controller = new AbortController()
    async function connect() {
      try {
        const response = await fetch('/mcp-apps/forecast.html', { signal: controller.signal })
        if (!response.ok) throw new Error(t.loadError)
        const next = await connectDemoServer(await response.text())
        active = next
        if (disposed) { await Promise.all([next.client.close(), next.server.close()]); return }
        const listed = await next.client.listTools()
        if (disposed) return
        setTool(listed.tools.find((item) => item.name === 'get_forecast'))
        setConnection(next)
      } catch (cause) {
        if (!disposed) setError(cause instanceof Error ? cause.message : String(cause))
      }
    }
    void connect()
    return () => {
      disposed = true
      controller.abort()
      revision.current++
      void active?.client.close()
      void active?.server.close()
    }
  }, [t.loadError])

  const run = async () => {
    if (!connection) return
    const current = ++revision.current
    setBusy(true)
    setError('')
    setInput({ city })
    setResult(undefined)
    record(t.eventHostCall(city))
    try {
      const next = await connection.client.callTool({ name: 'get_forecast', arguments: { city } })
      if (revision.current !== current) return
      setResult(next as CallToolResult)
      record(t.eventDelivered)
    } catch (cause) {
      if (revision.current === current) setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      if (revision.current === current) setBusy(false)
    }
  }

  const reset = () => {
    revision.current++
    setInput(undefined)
    setResult(undefined)
    setEvents([])
    setError('')
    setBusy(false)
    setStatus('connecting')
    setGeneration((value) => value + 1)
    runButton.current?.focus()
  }

  return (
    <div className="mcp-demo">
      <div className="mcp-demo__controls">
        <Select label={t.city} options={['Lisbon', 'São Paulo', 'Tokyo', 'Reykjavík'].map((value) => ({ value, label: value }))} value={city} onValueChange={setCity} />
        <Button ref={runButton} variant="filled" onClick={() => void run()} disabled={!connection || !resource || busy}>{t.getForecast}</Button>
        <Button variant="outlined" onClick={reset} disabled={!resource}>{t.resetDemo}</Button>
        <Button variant="text" disabled={!resource || busy} onClick={() => { setResult({ isError: true, content: [{ type: 'text', text: t.scriptedFailure }] }); record(t.eventFailure); }}>{t.showFailedTool}</Button>
      </div>
      <Text as="p" variant="bodySmall" role="status" className="mcp-demo__status">{t.statusLabel}: {t.appStatus[status as keyof typeof t.appStatus] ?? status}.</Text>
      {error || resourceError ? <Text as="p" role="alert">{error || resourceError?.message}</Text> : null}
      <div className="mcp-demo__layout">
        <div className="mcp-demo__stage">
          {connection && resource && tool && sandboxUrl ? (
            <McpAppFrame key={generation} client={connection.client} resource={resource} toolInfo={{ id: generation, tool }} toolInput={input} toolResult={result} title={t.sandbox.ariaForecast(city)} locale={locale === 'ja' ? 'ja-JP' : 'en-US'} availableDisplayModes={modes} minHeight={360} maxHeight={620} sandboxUrl={sandboxUrl}
              onAuthorizeToolCall={(params) => {
                const args = params.arguments
                const allowed = params.name === 'refresh_forecast' && typeof args?.city === 'string' && Number.isInteger(args?.seed)
                record(allowed ? t.eventAuthorized(params.name) : t.eventDenied(params.name))
                return allowed
              }}
              onStatusChange={setStatus}
              onInitialized={() => record(t.eventInitialized)}
              onDisplayModeChange={(mode) => record(t.eventDisplayMode(mode))}
              onMessage={(params) => { record(t.eventChat(params.content.map((item) => 'text' in item ? item.text : item.type).join(' '))) }}
              onUpdateModelContext={(params) => { record(t.eventContext(params.content?.map((item) => 'text' in item ? item.text : item.type).join(' ') ?? '')) }}
              onOpenLink={(url) => { record(t.eventLink(url)); return false }}
              onError={(cause) => setError(cause.message)}
            />
          ) : <Text as="p">{t.loadingApp}</Text>}
        </div>
        <Surface as="aside" color="surface-container-low" shape="large" className="mcp-demo__events" aria-label={t.protocolEvents}>
          <Text as="h3" variant="titleMedium">{t.receivedByHost}</Text>
          <Text as="p" variant="bodySmall">{t.eventsHelp}</Text>
          <ol>{events.map((event, index) => <li key={index}><Text as="span" variant="bodySmall">{event}</Text></li>)}</ol>
        </Surface>
      </div>
    </div>
  )
}
