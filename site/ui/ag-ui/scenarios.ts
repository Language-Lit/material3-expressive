export const scenarios = [
  {
    id: 'streaming',
    title: 'Streaming and reasoning',
    description: 'Watch a reply arrive a few words at a time. Open the reasoning to see the scripted notes behind it.',
    prompt: 'What makes Material 3 Expressive feel different?',
  },
  {
    id: 'tool',
    title: 'Tool call and result',
    description: 'Open the tool card while it runs. Its JSON arguments arrive in pieces, followed by a sample result.',
    prompt: 'Find a component for a short confirmation message.',
  },
  {
    id: 'weather',
    title: 'Weather card',
    description: 'A forecast arrives in the conversation. Change the units and choose a day to see how the card responds.',
    prompt: 'Show me the weather in Kyoto.',
  },
  {
    id: 'project',
    title: 'Project plan',
    description: 'The agent creates a project checklist. Check off tasks, watch the progress update, and switch to the schedule.',
    prompt: 'Help our team prepare for the design review on Friday.',
  },
  {
    id: 'approval',
    title: 'Human approval',
    description: 'Review the invitation before you approve it. Your decision updates the preview and resumes the conversation.',
    prompt: 'Invite Alex to the design review.',
  },
  {
    id: 'failure',
    title: 'Failed run',
    description: 'See how a failed run appears in the conversation. This error is intentional and can be replayed.',
    prompt: 'Look up the latest train departures.',
  },
] as const

export type Scenario = (typeof scenarios)[number]
export type ScenarioId = Scenario['id']
