import { Card, Icon, Surface, Text } from '@language-lit/material3-expressive'
import type { ToolRendererProps } from '@language-lit/material3-expressive-ag-ui'
import { useLocale } from '../../i18n/useLocale'
import { agUiMessages } from '../../i18n/messages/agUi'

export function InvitationCard({ node, agent }: ToolRendererProps) {
  const t = agUiMessages[useLocale()].invitationCard
  const title = typeof node.args?.title === 'string' ? node.args.title : t.preparing
  const attendees = Array.isArray(node.args?.attendees)
    ? node.args.attendees.filter((value: unknown): value is string => typeof value === 'string') : []
  const decision = agent.state?.invitationDecision
  const detail = (key: string, fallback: string) => typeof node.args?.[key] === 'string' ? node.args[key] : fallback
  return (
    <Card variant="outlined" className="agui-invitation" aria-label={t.aria}>
      <Surface color="secondary-container" shape="large" className="agui-invitation__date">
        <Icon source="calendar_month" size={28} />
        <Text as="p" variant="labelLarge">{detail('day', t.loadingDate)}</Text>
        <Text as="p" variant="headlineSmall">{detail('time', '…')}</Text>
        <Text as="p" variant="bodySmall">{detail('timezone', '')}</Text>
      </Surface>
      <div className="agui-invitation__details">
        <Text as="p" variant="labelMedium">{t.preview}</Text>
        <Text as="h4" variant="titleLarge">{title}</Text>
        <Text as="p" variant="bodyMedium">{detail('duration', t.loadingDetails)} · {detail('location', '')}</Text>
        <div className="agui-invitation__people" aria-label={t.attendees}>
          {attendees.map((person) => <span className="agui-invitation__person" key={person}>{person}</span>)}
        </div>
        <Text as="p" variant="bodySmall">
          {decision === 'approved' ? t.approved
            : decision === 'cancelled' ? t.cancelled
              : t.review}
        </Text>
      </div>
    </Card>
  )
}
