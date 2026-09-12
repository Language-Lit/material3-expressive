import { useEffect, useState } from 'react'
import { Button, Card, Chip, LinearProgress, Text } from '@language-lit/material3-expressive'

import { useDisplayMode, useMcpApp, useToolCall } from '@language-lit/material3-expressive-mcp-apps/app'
import type { Forecast } from './forecast'

/**
 * The MCP App itself: what the model's tool call opens inside the host. It is
 * ordinary Material 3 Expressive React; `McpAppProvider` supplies the theme,
 * the tool call and the host capabilities.
 */
export function ForecastApp() {
  const { app, isConnected, hostCapabilities, hostContext } = useMcpApp()
  const { input, result } = useToolCall<{ city: string }>()
  const { displayMode, availableDisplayModes, requestDisplayMode } = useDisplayMode()
  const [refreshed, setRefreshed] = useState<Forecast | undefined>(undefined)
  const [seed, setSeed] = useState(1)
  const [selected, setSelected] = useState(0)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { setRefreshed(undefined); setSelected(0); setSeed(1) }, [result])

  const forecast = refreshed ?? (result?.structuredContent as Forecast | undefined)
  const day = forecast?.days[selected]

  useEffect(() => {
    if (!app || !day || !hostCapabilities?.updateModelContext) return
    void app.updateModelContext({
      content: [{ type: 'text', text: `The user is looking at ${day.weekday} ${day.date}: ${day.condition}, ${day.high}°/${day.low}°.` }],
    })
  }, [app, day, hostCapabilities])

  if (!isConnected) return <LinearProgress aria-label="Connecting to the host" />
  if (result?.isError) return <div className="fc" role="alert"><Text as="p">The forecast tool failed. Reset the demo to try again.</Text></div>
  if (!forecast) {
    return (
      <div className="fc">
        <Text as="p" variant="bodyMedium">
          Waiting for the forecast{input?.city ? ` for ${input.city}` : ''}.
        </Text>
        <LinearProgress aria-label="Waiting for the tool result" />
      </div>
    )
  }

  const refresh = async () => {
    if (!app) return
    setBusy(true)
    try {
      const next = await app.callServerTool({ name: 'refresh_forecast', arguments: { city: forecast.city, seed } })
      setRefreshed(next.structuredContent as Forecast)
      setSeed((value) => value + 1)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setBusy(false)
    }
  }

  const share = () =>
    app?.sendMessage({
      role: 'user',
      content: [{ type: 'text', text: `Plan around ${day?.weekday} in ${forecast.city}: ${day?.condition}, high ${day?.high}°.` }],
    })

  return (
    <div className={`fc fc--${displayMode}`}>
      {error ? <Text as="p" role="alert">{error}</Text> : null}
      <Card variant="filled" as="section" className="fc__card" aria-label={`Forecast for ${forecast.city}`}>
        <div className="fc__head">
          <div>
            <Text as="h1" variant="titleLarge" className="fc__title">
              {forecast.city}
            </Text>
            <Text as="p" variant="bodySmall" className="fc__meta">
              Five days · {hostContext?.locale ?? 'en'} · {hostContext?.theme ?? 'light'} theme
            </Text>
          </div>
          {day ? (
            <Text as="p" variant="displaySmall" className="fc__temp">
              {day.high}°
            </Text>
          ) : null}
        </div>
        <div className="fc__days" role="group" aria-label="Days">
          {forecast.days.map((item, index) => (
            <Chip
              key={item.date}
              kind="filter"
              selected={index === selected}
              onSelectedChange={() => setSelected(index)}
            >
              {item.weekday} {item.high}°
            </Chip>
          ))}
        </div>
        {day ? (
          <Text as="p" variant="bodyLarge" className="fc__summary">
            {day.condition}, low {day.low}°, {day.precipitation}% chance of rain.
          </Text>
        ) : null}
        {busy ? <LinearProgress aria-label="Refreshing" /> : null}
        <div className="fc__actions">
          <Button variant="tonal" onClick={refresh} disabled={busy || !hostCapabilities?.serverTools}>
            Refresh
          </Button>
          {hostCapabilities?.message ? (
            <Button variant="text" onClick={() => void share()}>
              Add to chat
            </Button>
          ) : null}
          {availableDisplayModes.includes('fullscreen') && displayMode !== 'fullscreen' ? (
            <Button variant="text" onClick={() => void requestDisplayMode('fullscreen')}>
              Full screen
            </Button>
          ) : null}
          {displayMode !== 'inline' ? (
            <Button variant="text" onClick={() => void requestDisplayMode('inline')}>
              Back inline
            </Button>
          ) : null}
          {hostCapabilities?.openLinks ? (
            <Button
              variant="text"
              onClick={() => void app?.openLink({ url: 'https://modelcontextprotocol.io/extensions/apps' })}
            >
              About MCP Apps
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
