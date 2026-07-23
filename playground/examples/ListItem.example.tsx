import { useState } from 'react'
import {
  ListItem,
  SegmentedListItem,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

export function ListItemExample() {
  const [level, setLevel] = useState('intermediate')
  const [downloads, setDownloads] = useState<readonly string[]>(['Listening'])
  const lessons = ['Grammar', 'Listening', 'Reading']

  const toggleDownload = (lesson: string, checked: boolean) => {
    setDownloads((current) =>
      checked
        ? [...current, lesson]
        : current.filter((entry) => entry !== lesson),
    )
  }

  return (
    <Surface
      as="section"
      aria-labelledby="list-item-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="list-item-example"
    >
      <Text
        as="h2"
        id="list-item-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        List items
      </Text>
      <Text as="p" variant="bodyMedium">
        Native action, radio, and checkbox rows with sourced line and segmented
        geometry.
      </Text>

      <div className="list-item-example__list">
        {lessons.map((lesson, index) => (
          <ListItem
            key={lesson}
            interaction="multiple"
            name="downloads"
            value={lesson.toLowerCase()}
            headline={lesson}
            overline={index === 2 ? 'Recommended' : undefined}
            supportingText={
              index === 2
                ? 'Read the story\nand answer the questions'
                : `${8 + index * 4} exercises`
            }
            leadingContent={
              <span className="list-item-example__avatar">{lesson[0]}</span>
            }
            trailingContent={`${12 + index * 3} min`}
            checked={downloads.includes(lesson)}
            onCheckedChange={(checked) => toggleDownload(lesson, checked)}
          />
        ))}
      </div>

      <Text as="h3" variant="titleMedium" emphasis="emphasized">
        Segmented level
      </Text>
      <div className="list-item-example__list">
        {['beginner', 'intermediate', 'advanced'].map((option, index, options) => (
          <SegmentedListItem
            key={option}
            interaction="single"
            index={index}
            count={options.length}
            name="level"
            value={option}
            headline={option[0].toUpperCase() + option.slice(1)}
            selected={level === option}
            onSelectedChange={() => setLevel(option)}
          />
        ))}
      </div>
    </Surface>
  )
}
