import { AbstractAgent } from '@ag-ui/client'
import { EventType, type BaseEvent, type RunAgentInput } from '@ag-ui/core'
import { Observable } from 'rxjs'
import type { ScenarioId } from './scenarios'

// Site-authored sample events. The SDK assembles the transcript and the
// published companion renders it. Nothing here opens a network connection.
function eventsFor(scenario: ScenarioId, input: RunAgentInput): BaseEvent[] {
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
      ? 'Approved. In a connected app, the agent could now send the invitation. This demo has not sent anything.'
      : 'Cancelled. The invitation will not be sent.')
  } else {
    switch (scenario) {
      case 'streaming':
        text('notes', 'I will explain the visual changes first, then how they help someone use an interface. These are scripted reasoning notes.', true)
        text('answer', 'Material 3 Expressive uses color, shape, and motion to help people find their way. A prominent button makes the next action easy to spot. A changing shape gives a press a visible response. You can try those same components throughout this site.')
        break
      case 'tool':
        emit(EventType.STEP_STARTED, { stepName: 'Searching sample documentation' })
        emit(EventType.ACTIVITY_SNAPSHOT, {
          messageId: id('activity'), activityType: 'search', content: { source: 'Sample component notes' },
        })
        text('answer', 'I will look for a component that confirms an action without interrupting the page.')
        tool('search_components', ['{"query":', '"confirmation', ' message",', '"limit":', '1}'],
          JSON.stringify({ component: 'Snackbar', description: 'Brief feedback about an operation.' }))
        emit(EventType.STEP_FINISHED, { stepName: 'Searching sample documentation' })
        text('summary', 'A Snackbar is a good fit for a short confirmation, such as “Changes saved”.')
        break
      case 'weather':
        text('answer', 'Here is a sample forecast for Kyoto.')
        tool('show_weather', [
          '{"city":', '"Kyoto",', '"temperature":24,', '"condition":"Clear skies",',
          '"days":[',
          '{"day":"Today","high":26,"low":18,"rain":10,"condition":"A clear afternoon. A good day for a walk along the river."},',
          '{"day":"Tomorrow","high":23,"low":17,"rain":60,"condition":"Rain in the afternoon. Take an umbrella if you are heading out."},',
          '{"day":"Friday","high":25,"low":19,"rain":20,"condition":"Clouds clearing by lunchtime."}',
          ']}',
        ], 'Sample forecast displayed.')
        break
      case 'project':
        emit(EventType.STEP_STARTED, { stepName: 'Preparing a project plan' })
        emit(EventType.STATE_SNAPSHOT, { snapshot: { completedTasks: ['brief'] } })
        text('answer', 'Here is a plan for the design review. The brief is already done. You can update the remaining tasks here.')
        tool('show_project', [
          '{"title":"Website refresh",', '"tasks":[',
          '{"id":"brief","title":"Agree on the brief","owner":"Alex","day":"Wednesday"},',
          '{"id":"prototype","title":"Build the prototype","owner":"Sam","day":"Thursday"},',
          '{"id":"review","title":"Review with the team","owner":"You","day":"Friday"}',
          ']}',
        ], 'Project plan ready.')
        emit(EventType.STEP_FINISHED, { stepName: 'Preparing a project plan' })
        break
      case 'approval':
        text('answer', 'The invitation is ready. Please confirm before I send it.')
        tool('preview_invitation', [
          '{"title":"Design review",', '"day":"Friday","time":"14:00",',
          '"timezone":"Japan time","duration":"30 minutes","location":"Online",',
          '"attendees":["You", "Alex", "Sam"]}',
        ], 'Invitation ready for review.')
        emit(EventType.RUN_FINISHED, {
          ...run,
          outcome: { type: 'interrupt', interrupts: [{
            id: id('approval'), reason: 'approval_required',
            message: 'Send Alex an invitation to the design review? This is a scripted example; no message will be sent.',
          }] },
        })
        return events
      case 'failure':
        text('answer', 'Checking the sample departures service.')
        emit(EventType.RUN_ERROR, { message: 'The sample departures service is unavailable. This is an intentional demo error.', code: 'DEMO_UNAVAILABLE' })
        return events
    }
  }
  emit(EventType.RUN_FINISHED, run)
  return events
}

export class DemoAgent extends AbstractAgent {
  private cancelPlayback?: () => void
  private abortRequested = false

  constructor(private readonly scenario: ScenarioId) {
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
      const events = eventsFor(this.scenario, input)
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
