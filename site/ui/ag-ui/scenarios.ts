import type { Locale } from '../../i18n/locales'
import { agUiMessages } from '../../i18n/messages/agUi'

export const scenarioIds = ['streaming', 'tool', 'weather', 'project', 'approval', 'failure'] as const
export type ScenarioId = (typeof scenarioIds)[number]
export type Scenario = { id: ScenarioId; title: string; description: string; prompt: string }

export function scenariosFor(locale: Locale): Scenario[] {
  const copy = agUiMessages[locale].scenarios
  return scenarioIds.map((id) => ({ id, ...copy[id] }))
}
