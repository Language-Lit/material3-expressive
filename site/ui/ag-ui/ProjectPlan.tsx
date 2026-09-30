import { Card, Checkbox, Icon, LinearProgress, Surface, Tabs, Text } from '@language-lit/material3-expressive'
import type { ToolRendererProps } from '@language-lit/material3-expressive-ag-ui'
import { isRecord } from './values'
import { useLocale } from '../../i18n/useLocale'
import { agUiMessages } from '../../i18n/messages/agUi'

interface Task {
  id: string
  title: string
  owner: string
  day: string
}

function isTask(value: unknown): value is Task {
  return isRecord(value) && typeof value.id === 'string' && typeof value.title === 'string' &&
    typeof value.owner === 'string' && typeof value.day === 'string'
}

export function ProjectPlan({ node, agent }: ToolRendererProps) {
  const t = agUiMessages[useLocale()].projectCard
  const displayOwner = (owner: string) => owner === 'You' ? t.you : owner
  const title = typeof node.args?.title === 'string' ? node.args.title : t.preparing
  const tasks = Array.isArray(node.args?.tasks) ? node.args.tasks.filter(isTask) : []
  const completed: string[] = Array.isArray(agent.state?.completedTasks)
    ? agent.state.completedTasks.filter((value: unknown): value is string => typeof value === 'string') : []
  const done = tasks.filter((task) => completed.includes(task.id)).length
  const ready = node.status === 'complete'

  function toggle(id: string, checked: boolean) {
    agent.setState({
      ...agent.state,
      completedTasks: checked ? [...new Set([...completed, id])] : completed.filter((value) => value !== id),
    })
  }

  return (
    <Surface as="article" color="surface-container-low" shape="extra-large" className="agui-project" aria-label={t.aria}>
      <div className="agui-widget__head">
        <div className="agui-widget__title">
          <Text as="p" variant="labelMedium">{t.label}</Text>
          <Text as="h4" variant="headlineSmall">{title}</Text>
        </div>
        <Icon source="check_circle" size={32} />
      </div>
      <Surface color="primary-container" shape="large" className="agui-project__progress">
        <Text as="p" variant="titleLarge">{ready ? t.complete(done, tasks.length) : t.building}</Text>
        <LinearProgress aria-label={t.progress} value={tasks.length ? done / tasks.length : 0} />
        <Text as="p" variant="bodyMedium">{done === tasks.length && ready ? t.ready : t.plan}</Text>
      </Surface>
      <Tabs aria-label={t.projectView} variant="secondary" items={[
        { value: 'checklist', label: t.checklist, panel: (
          <div className="agui-project__tasks">
            {tasks.map((task) => (
              <label key={task.id} className="agui-project__task" data-complete={completed.includes(task.id) || undefined}>
                <Checkbox checked={completed.includes(task.id)} disabled={!ready}
                  onCheckedChange={(checked) => toggle(task.id, checked)} aria-label={task.title} />
                <span className="agui-project__task-copy">
                  <Text as="span" variant="titleSmall">{task.title}</Text>
                  <Text as="span" variant="bodySmall">{displayOwner(task.owner)} · {task.day}</Text>
                </span>
              </label>
            ))}
          </div>
        ) },
        { value: 'schedule', label: t.schedule, panel: (
          <ol className="agui-project__schedule">
            {tasks.map((task) => (
              <li key={task.id}>
                <Card variant="outlined" className="agui-project__milestone">
                  <Text as="p" variant="labelMedium">{task.day} · {displayOwner(task.owner)}</Text>
                  <Text as="p" variant="titleSmall">{task.title}</Text>
                  <Text as="p" variant="bodySmall">{completed.includes(task.id) ? t.completeLabel : t.todo}</Text>
                </Card>
              </li>
            ))}
          </ol>
        ) },
      ]} />
      <Text as="p" variant="bodySmall" role="status">
        {ready ? t.statusComplete(done, tasks.length) : t.receiving}
      </Text>
    </Surface>
  )
}
