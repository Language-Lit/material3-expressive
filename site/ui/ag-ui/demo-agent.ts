import { AbstractAgent } from '@ag-ui/client'
import { EventType, type BaseEvent, type RunAgentInput } from '@ag-ui/core'
import { Observable } from 'rxjs'
import type { Locale } from '../../i18n/locales'
import { agUiMessages } from '../../i18n/messages/agUi'
import type { ScenarioId } from './scenarios'

// Site-authored sample events. The SDK assembles the transcript and the
// published companion renders it. Nothing here opens a network connection.
function eventsFor(scenario: ScenarioId, input: RunAgentInput, locale: Locale): BaseEvent[] {
  const t = agUiMessages[locale].agent
  const events: BaseEvent[] = []
  const emit = (type: EventType, fields: Record<string, unknown> = {}) => {
    events.push({ type, ...fields })
  }
  const run = { threadId: input.threadId, runId: input.runId }
  const id = (name: string) => `${input.runId}-${name}`
  const text = (name: string, content: string, reasoning = false) => {
    const messageId = id(name)
    emit(reasoning ? EventType.REASONING_MESSAGE_START : EventType.TEXT_MESSAGE_START,
      { messageId, role: reasoning ? 'reasoning' : 'assistant' })
    for (const delta of content.match(/[\s\S]{1,24}/g) ?? []) {
      emit(reasoning ? EventType.REASONING_MESSAGE_CONTENT : EventType.TEXT_MESSAGE_CONTENT,
        { messageId, delta })
    }
    emit(reasoning ? EventType.REASONING_MESSAGE_END : EventType.TEXT_MESSAGE_END, { messageId })
  }
  const tool = (name: string, fragments: string[], result: string) => {
    const toolCallId = id('tool')
    emit(EventType.TOOL_CALL_START, { toolCallId, toolCallName: name, parentMessageId: id('answer') })
    for (const delta of fragments) emit(EventType.TOOL_CALL_ARGS, { toolCallId, delta })
    emit(EventType.TOOL_CALL_END, { toolCallId })
    emit(EventType.TOOL_CALL_RESULT, { messageId: id('result'), toolCallId, role: 'tool', content: result })
  }

  emit(EventType.RUN_STARTED, run)
  if (input.resume?.length) {
    const approved = input.resume.some((entry) => entry.status === 'resolved')
    emit(EventType.STATE_SNAPSHOT, { snapshot: { ...input.state, invitationDecision: approved ? 'approved' : 'cancelled' } })
    text('decision', approved
      ? t.approved
      : t.cancelled)
  } else {
    switch (scenario) {
      case 'streaming':
        text('notes', t.reasoning, true)
        text('answer', t.expressive)
        break
      case 'tool':
        emit(EventType.STEP_STARTED, { stepName: t.searching })
        emit(EventType.ACTIVITY_SNAPSHOT, {
          messageId: id('activity'), activityType: 'search', content: { source: t.sampleNotes },
        })
        text('answer', t.searchAnswer)
        // The arguments stream in pieces, split inside the query as the English demo always was.
        const split = t.confirmation.includes(' ') ? t.confirmation.indexOf(' ') : Math.ceil(t.confirmation.length / 2)
        const [queryHead, queryTail] = [t.confirmation.slice(0, split), t.confirmation.slice(split)]
        tool('search_components', ['{"query":', `"${queryHead}`, `${queryTail}",`, '"limit":', '1}'],
          JSON.stringify({ component: 'Snackbar', description: t.snackbar }))
        emit(EventType.STEP_FINISHED, { stepName: t.searching })
        text('summary', t.searchSummary)
        break
      case 'weather':
        text('answer', t.kyotoForecast)
        tool('show_weather', [
          '{"city":', '"Kyoto",', '"temperature":24,', `"condition":"${t.clearSkies}",`,
          '"days":[',
          `{"day":"${t.today}","high":26,"low":18,"rain":10,"condition":"${t.todayCondition}"},`,
          `{"day":"${t.tomorrow}","high":23,"low":17,"rain":60,"condition":"${t.tomorrowCondition}"},`,
          `{"day":"${t.friday}","high":25,"low":19,"rain":20,"condition":"${t.fridayCondition}"}`,
          ']}',
        ], t.forecastDisplayed)
        break
      case 'project':
        emit(EventType.STEP_STARTED, { stepName: t.preparingPlan })
        emit(EventType.STATE_SNAPSHOT, { snapshot: { completedTasks: ['brief'] } })
        text('answer', t.projectAnswer)
        tool('show_project', [
          `{"title":"${t.projectTitle}",`, '"tasks":[',
          `{"id":"brief","title":"${t.agreeBrief}","owner":"Alex","day":"${t.wednesday}"},`,
          `{"id":"prototype","title":"${t.buildPrototype}","owner":"Sam","day":"${t.thursday}"},`,
          `{"id":"review","title":"${t.reviewTeam}","owner":"You","day":"${t.friday}"}`,
          ']}',
        ], t.projectReady)
        emit(EventType.STEP_FINISHED, { stepName: t.preparingPlan })
        break
      case 'approval':
        text('answer', t.invitationAnswer)
        tool('preview_invitation', [
          `{"title":"${t.designReview}",`, `"day":"${t.friday}","time":"14:00",`,
          `"timezone":"${t.japanTime}","duration":"${t.duration}","location":"${t.online}",`,
          '"attendees":["You", "Alex", "Sam"]}',
        ], t.invitationReady)
        emit(EventType.RUN_FINISHED, {
          ...run,
          outcome: { type: 'interrupt', interrupts: [{
            id: id('approval'), reason: 'approval_required',
            message: t.approvalQuestion,
          }] },
        })
        return events
      case 'failure':
        text('answer', t.departureAnswer)
        emit(EventType.RUN_ERROR, { message: t.departureError, code: 'DEMO_UNAVAILABLE' })
        return events
    }
  }
  emit(EventType.RUN_FINISHED, run)
  return events
}

export class DemoAgent extends AbstractAgent {
  private cancelPlayback?: () => void
  private abortRequested = false

  constructor(private readonly scenario: ScenarioId, private readonly locale: Locale) {
    super({ agentId: `demo-${scenario}` })
  }

  override abortRun() {
    if (this.isRunning) this.abortRequested = true
    this.cancelPlayback?.()
  }

  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable((subscriber) => {
      if (this.abortRequested) {
        this.abortRequested = false
        subscriber.error(new DOMException('Demo stopped', 'AbortError'))
        return
      }
      const events = eventsFor(this.scenario, input, this.locale)
      let index = 0
      const timer = setInterval(() => {
        const event = events[index++]
        if (event) subscriber.next(event)
        if (index === events.length) subscriber.complete()
      }, 150)
      const cancel = () => subscriber.error(new DOMException('Demo stopped', 'AbortError'))
      this.cancelPlayback = cancel
      return () => {
        clearInterval(timer)
        this.abortRequested = false
        if (this.cancelPlayback === cancel) this.cancelPlayback = undefined
      }
    })
  }
}
