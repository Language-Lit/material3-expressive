import { useState } from 'react'
import { Icon, SegmentedButtonGroup, Surface, Text } from '@language-lit/material3-expressive/v1'

const viewSegments = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
]

const alignSegments = [
  { value: 'left', label: 'Left', icon: <Icon source="format_align_left" /> },
  { value: 'center', label: 'Center', icon: <Icon source="format_align_center" /> },
  { value: 'right', label: 'Right', icon: <Icon source="format_align_right" /> },
]

const filterSegments = [
  { value: 'walk', label: 'Walk' },
  { value: 'bike', label: 'Bike' },
  { value: 'transit', label: 'Transit' },
  { value: 'drive', label: 'Drive' },
]

export function SegmentedButtonGroupExample() {
  const [view, setView] = useState('day')
  const [align, setAlign] = useState('left')
  const [filters, setFilters] = useState<readonly string[]>(['walk'])

  return (
    <Surface
      as="section"
      aria-labelledby="segmented-button-group-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="segmented-button-group-example"
    >
      <Text
        as="h2"
        id="segmented-button-group-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Segmented button groups
      </Text>
      <Text as="p" variant="bodyMedium">
        Single- and multi-choice groups built on native radio and checkbox
        inputs, with grouped corner shaping and an icon-to-checkmark
        crossfade.
      </Text>

      <div className="segmented-button-group-example__row">
        <SegmentedButtonGroup
          segments={viewSegments}
          aria-label="View"
          value={view}
          onValueChange={setView}
        />
        <SegmentedButtonGroup
          segments={alignSegments}
          aria-label="Alignment"
          value={align}
          onValueChange={setAlign}
        />
      </div>

      <div className="segmented-button-group-example__row">
        <SegmentedButtonGroup
          multiple
          segments={filterSegments}
          aria-label="Travel modes"
          value={filters}
          onValueChange={setFilters}
        />
      </div>

      <div className="segmented-button-group-example__row">
        <SegmentedButtonGroup
          segments={viewSegments}
          aria-label="Unavailable view"
          defaultValue="week"
          disabled
        />
        <SegmentedButtonGroup
          segments={[
            { value: 'day', label: 'Day' },
            { value: 'week', label: 'Week', disabled: true },
            { value: 'month', label: 'Month' },
          ]}
          aria-label="Partly unavailable view"
          defaultValue="day"
        />
      </div>
    </Surface>
  )
}
