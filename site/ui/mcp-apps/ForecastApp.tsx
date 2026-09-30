import { useEffect, useState } from 'react'
import { Button, Card, Chip, LinearProgress, Text } from '@language-lit/material3-expressive'

import { useDisplayMode, useMcpApp, useToolCall } from '@language-lit/material3-expressive-mcp-apps/app'
import type { Forecast } from './forecast'
import { mcpAppsMessages } from '../../i18n/messages/mcpApps'

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
  const locale = hostContext?.locale?.startsWith('ja') ? 'ja' : 'en'
  const t = mcpAppsMessages[locale].sandbox
  const formatWeekday = (date: string) => new Intl.DateTimeFormat(locale === 'ja' ? 'ja-JP' : 'en-US', { weekday: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`))
  const conditionText = (value: Forecast['days'][number]['condition']) => mcpAppsMessages[locale].sandbox.conditions[value]
  const themeName = hostContext?.theme ?? (locale === 'ja' ? 'ライト' : 'light')

  useEffect(() => { setRefreshed(undefined); setSelected(0); setSeed(1) }, [result])

  const forecast = refreshed ?? (result?.structuredContent as Forecast | undefined)
  const day = forecast?.days[selected]

  useEffect(() => {
    if (!app || !day || !hostCapabilities?.updateModelContext) return
    void app.updateModelContext({
      content: [{ type: 'text', text: mcpAppsMessages[locale].sandbox.modelContext(formatWeekday(day.date), day.date, conditionText(day.condition), day.high, day.low) }],
    })
  }, [app, day, hostCapabilities, locale])

  if (!isConnected) return <LinearProgress aria-label={t.connecting} />
  if (result?.isError) return <div className="fc" role="alert"><Text as="p">{t.toolFailed}</Text></div>
  if (!forecast) {
    return (
      <div className="fc">
        <Text as="p" variant="bodyMedium">
          {t.waitForecast}{input?.city ? ` ${locale === 'ja' ? '（' : 'for '}${input.city}${locale === 'ja' ? '）' : ''}` : ''}{locale === 'ja' ? '。' : '.'}
        </Text>
        <LinearProgress aria-label={t.waitingTool} />
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
      content: [{ type: 'text', text: day ? mcpAppsMessages[locale].sandbox.shareContext(formatWeekday(day.date), forecast.city, conditionText(day.condition), day.high) : '' }],
    })

  return (
    <div className={`fc fc--${displayMode}`}>
      {error ? <Text as="p" role="alert">{error}</Text> : null}
      <Card variant="filled" as="section" className="fc__card" aria-label={t.ariaForecast(forecast.city)}>
        <div className="fc__head">
          <div>
            <Text as="h1" variant="titleLarge" className="fc__title">
              {forecast.city}
            </Text>
            <Text as="p" variant="bodySmall" className="fc__meta">
              {t.fiveDays} · {hostContext?.locale ?? (locale === 'ja' ? 'ja-JP' : 'en')} · {locale === 'ja' ? themeName === 'dark' ? 'ダーク' : 'ライト' : themeName} {t.theme}
            </Text>
          </div>
          {day ? (
            <Text as="p" variant="displaySmall" className="fc__temp">
              {day.high}°
            </Text>
          ) : null}
        </div>
        <div className="fc__days" role="group" aria-label={t.days}>
          {forecast.days.map((item, index) => (
            <Chip
              key={item.date}
              kind="filter"
              selected={index === selected}
              onSelectedChange={() => setSelected(index)}
            >
              {formatWeekday(item.date)} {item.high}°
            </Chip>
          ))}
        </div>
        {day ? (
          <Text as="p" variant="bodyLarge" className="fc__summary">
            {locale === 'ja'
              ? `${conditionText(day.condition)}、最低${day.low}°、降水確率${day.precipitation}%。`
              : `${conditionText(day.condition)}, ${t.low} ${day.low}°, ${day.precipitation}% ${t.rain}.`}
          </Text>
        ) : null}
        {busy ? <LinearProgress aria-label={t.refreshing} /> : null}
        <div className="fc__actions">
          <Button variant="tonal" onClick={refresh} disabled={busy || !hostCapabilities?.serverTools}>
            {t.refresh}
          </Button>
          {hostCapabilities?.message ? (
            <Button variant="text" onClick={() => void share()}>
              {t.addChat}
            </Button>
          ) : null}
          {availableDisplayModes.includes('fullscreen') && displayMode !== 'fullscreen' ? (
            <Button variant="text" onClick={() => void requestDisplayMode('fullscreen')}>
              {t.fullscreen}
            </Button>
          ) : null}
          {displayMode !== 'inline' ? (
            <Button variant="text" onClick={() => void requestDisplayMode('inline')}>
              {t.backInline}
            </Button>
          ) : null}
          {hostCapabilities?.openLinks ? (
            <Button
              variant="text"
              onClick={() => void app?.openLink({ url: 'https://modelcontextprotocol.io/extensions/apps' })}
            >
              {t.about}
            </Button>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
