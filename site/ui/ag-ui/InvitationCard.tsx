import { Card, Icon, Surface, Text } from '@language-lit/material3-expressive'
import type { ToolRendererProps } from '@language-lit/material3-expressive-ag-ui'

export function InvitationCard({ node, agent }: ToolRendererProps) {
  const title = typeof node.args?.title === 'string' ? node.args.title : 'Preparing invitation'
  const attendees = Array.isArray(node.args?.attendees)
    ? node.args.attendees.filter((value: unknown): value is string => typeof value === 'string') : []
  const decision = agent.state?.invitationDecision
  const detail = (key: string, fallback: string) => typeof node.args?.[key] === 'string' ? node.args[key] : fallback
  return (
    <Card variant="outlined" className="agui-invitation" aria-label="Sample invitation preview">
      <Surface color="secondary-container" shape="large" className="agui-invitation__date">
        <Icon source="calendar_month" size={28} />
        <Text as="p" variant="labelLarge">{detail('day', 'Loading date')}</Text>
        <Text as="p" variant="headlineSmall">{detail('time', '…')}</Text>
        <Text as="p" variant="bodySmall">{detail('timezone', '')}</Text>
      </Surface>
      <div className="agui-invitation__details">
        <Text as="p" variant="labelMedium">Invitation preview</Text>
        <Text as="h4" variant="titleLarge">{title}</Text>
        <Text as="p" variant="bodyMedium">{detail('duration', 'Loading details')} · {detail('location', '')}</Text>
        <div className="agui-invitation__people" aria-label="Attendees">
          {attendees.map((person) => <span className="agui-invitation__person" key={person}>{person}</span>)}
        </div>
        <Text as="p" variant="bodySmall">
          {decision === 'approved' ? 'Approved in this demo. Nothing was sent.'
            : decision === 'cancelled' ? 'Cancelled. Nothing was sent.'
              : 'Review the details, then approve or cancel below.'}
        </Text>
      </div>
    </Card>
  )
}
