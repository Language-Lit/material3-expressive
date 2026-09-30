import { useState } from 'react'
import { Icon, SegmentedButtonGroup, Surface, Tabs, Text } from '@language-lit/material3-expressive'
import type { ToolRendererProps } from '@language-lit/material3-expressive-ag-ui'
import { isRecord } from './values'
import { useLocale } from '../../i18n/useLocale'
import { agUiMessages } from '../../i18n/messages/agUi'

interface ForecastDay {
  day: string
  high: number
  low: number
  rain: number
  condition: string
}

function isForecastDay(value: unknown): value is ForecastDay {
  return isRecord(value) && typeof value.day === 'string' &&
    typeof value.high === 'number' && Number.isFinite(value.high) &&
    typeof value.low === 'number' && Number.isFinite(value.low) &&
    typeof value.rain === 'number' && typeof value.condition === 'string'
}

export function WeatherCard({ node }: ToolRendererProps) {
  const t = agUiMessages[useLocale()].weatherCard
  const [unit, setUnit] = useState('celsius')
  const city = typeof node.args?.city === 'string' ? node.args.city : t.loadingCity
  const temperature = typeof node.args?.temperature === 'number' ? node.args.temperature : undefined
  const condition = typeof node.args?.condition === 'string' ? node.args.condition : t.reading
  const days = Array.isArray(node.args?.days) ? node.args.days.filter(isForecastDay) : []
  const degrees = (value: number) => `${unit === 'celsius' ? Math.round(value) : Math.round(value * 9 / 5 + 32)}°`
  const unitLabel = unit === 'celsius' ? 'C' : 'F'

  return (
    <Surface as="article" color="surface-container-low" shape="extra-large" className="agui-weather" aria-label={t.aria}>
      <div className="agui-widget__head">
        <div className="agui-widget__title">
          <Text as="p" variant="labelMedium">{t.sampleLabel}</Text>
          <Text as="h4" variant="headlineSmall">{city}</Text>
        </div>
        <SegmentedButtonGroup aria-label={t.unit} value={unit} onValueChange={setUnit}
          segments={[{ value: 'celsius', label: '°C' }, { value: 'fahrenheit', label: '°F' }]} />
      </div>
      <Surface color="tertiary-container" shape="large" className="agui-weather__current">
        <div className="agui-weather__reading">
          <div>
            <Icon source="light_mode" size={40} />
            <Text as="p" variant="titleMedium">{condition}</Text>
            <Text as="p" variant="bodySmall">{t.localAfternoon}</Text>
          </div>
          <Text as="p" variant="displayLarge" aria-label={temperature === undefined ? t.tempLoading : `${degrees(temperature)} ${unitLabel}`}>
            {temperature === undefined ? '…' : degrees(temperature)}<span className="agui-weather__unit">{unitLabel}</span>
          </Text>
        </div>
      </Surface>
      {/* Mount the day selector once its items are complete, so its initial
          indicator measurement uses the final number of tabs. */}
      {node.argsComplete && days.length > 0 && <Tabs aria-label={t.forecastDay} variant="secondary" items={days.map((day) => ({
        value: day.day,
        label: day.day,
        panel: <div className="agui-weather__day">
          <Text as="p" variant="bodyMedium">{day.condition}</Text>
          <dl className="agui-weather__metrics">
            <div><dt>{t.high}</dt><dd>{degrees(day.high)} {unitLabel}</dd></div>
            <div><dt>{t.low}</dt><dd>{degrees(day.low)} {unitLabel}</dd></div>
            <div><dt>{t.rain}</dt><dd>{day.rain}%</dd></div>
          </dl>
        </div>,
      }))} />}
      <Text as="p" variant="bodySmall">
        {node.status === 'complete' ? t.fiction : t.receiving}
      </Text>
    </Surface>
  )
}
