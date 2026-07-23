import { useState } from 'react'
import {
  Chip,
  Icon,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

export function ChipExample() {
  const [selectedTopics, setSelectedTopics] = useState<readonly string[]>(['Grammar'])
  const [personSelected, setPersonSelected] = useState(true)
  const [lastAction, setLastAction] = useState('none')

  const toggleTopic = (topic: string, selected: boolean) => {
    setSelectedTopics((current) =>
      selected ? [...current, topic] : current.filter((entry) => entry !== topic),
    )
  }

  return (
    <Surface
      as="section"
      aria-labelledby="chip-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="chip-example"
    >
      <Text as="h2" id="chip-example-title" variant="titleLarge" emphasis="emphasized">
        Material chips
      </Text>
      <Text as="p" variant="bodyMedium">
        Assist and suggestion actions plus selectable filter and input chips,
        including flat, elevated, and Expressive shape treatments.
      </Text>

      <Text as="h3" variant="titleMedium" emphasis="emphasized">
        Assist and suggestion
      </Text>
      <div className="chip-example__row">
        <Chip
          kind="assist"
          leadingIcon={<Icon source="add" />}
          onClick={() => setLastAction('Add to calendar')}
        >
          Add to calendar
        </Chip>
        <Chip
          kind="assist"
          variant="elevated"
          leadingIcon={<Icon source="favorite" />}
          trailingIcon={<Icon source="arrow_forward" />}
          onClick={() => setLastAction('Translate')}
        >
          Translate
        </Chip>
        <Chip
          kind="suggestion"
          leadingIcon={<Icon source="info" />}
          onClick={() => setLastAction('Try a dialogue')}
        >
          Try a dialogue
        </Chip>
        <Chip
          kind="suggestion"
          variant="elevated"
          onClick={() => setLastAction('Review vocabulary')}
        >
          Review vocabulary
        </Chip>
      </div>

      <Text as="h3" variant="titleMedium" emphasis="emphasized">
        Filter selection
      </Text>
      <div className="chip-example__row">
        {['Grammar', 'Listening', 'Reading'].map((topic, index) => {
          const selected = selectedTopics.includes(topic)
          return (
            <Chip
              key={topic}
              kind="filter"
              variant={index === 1 ? 'elevated' : 'flat'}
              shape={index === 2 ? 'expressive' : 'standard'}
              selected={selected}
              onSelectedChange={(nextSelected) => toggleTopic(topic, nextSelected)}
              leadingIcon={selected ? <Icon source="check" /> : null}
              trailingIcon={topic === 'Reading' ? <Icon source="description" /> : null}
            >
              {topic}
            </Chip>
          )
        })}
        <Chip kind="filter" defaultSelected shape="expressive">
          Uncontrolled
        </Chip>
      </div>

      <Text as="h3" variant="titleMedium" emphasis="emphasized">
        Input chips
      </Text>
      <div className="chip-example__row">
        <Chip
          kind="input"
          selected={personSelected}
          onSelectedChange={setPersonSelected}
          avatar={<span className="chip-example__avatar">A</span>}
          leadingIcon={<Icon source="person" />}
          trailingIcon={<Icon source="close" />}
        >
          Aiko
        </Chip>
        <Chip
          kind="input"
          shape="expressive"
          defaultSelected
          leadingIcon={<Icon source="bookmark" />}
          trailingIcon={<Icon source="close" />}
        >
          Japanese
        </Chip>
      </div>

      <Text as="h3" variant="titleMedium" emphasis="emphasized">
        Constrained and large text
      </Text>
      <div className="chip-example__row">
        <Chip
          kind="filter"
          className="chip-example__constrained"
          trailingIcon={<Icon source="close" />}
        >
          A deliberately long filter label that must leave its trailing icon visible
        </Chip>
        <span className="chip-example__large-type">
          <Chip kind="suggestion" leadingIcon={<Icon source="info" />}>
            Large label
          </Chip>
        </span>
      </div>

      <Text as="h3" variant="titleMedium" emphasis="emphasized">
        Disabled states
      </Text>
      <div className="chip-example__row">
        <Chip kind="assist" disabled leadingIcon={<Icon source="add" />}>
          Assist
        </Chip>
        <Chip kind="assist" variant="elevated" disabled>
          Elevated assist
        </Chip>
        <Chip kind="filter" disabled defaultSelected>
          Selected filter
        </Chip>
        <Chip kind="filter" variant="elevated" disabled>
          Elevated filter
        </Chip>
        <Chip kind="input" disabled avatar={<span className="chip-example__avatar">M</span>}>
          Input
        </Chip>
        <Chip kind="suggestion" variant="elevated" disabled>
          Suggestion
        </Chip>
      </div>

      <Text as="span" role="status" variant="bodySmall" aria-live="polite">
        Last action: {lastAction}. Selected filters: {selectedTopics.join(', ') || 'none'}.
      </Text>
    </Surface>
  )
}
