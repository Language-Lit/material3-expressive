import { Fragment } from 'react'
import {
  Divider,
  ListItem,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

export function DividerExample() {
  const lessons = ['Grammar', 'Listening', 'Reading']

  return (
    <Surface
      as="section"
      aria-labelledby="divider-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="divider-example"
    >
      <Text
        as="h2"
        id="divider-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Dividers
      </Text>
      <Text as="p" variant="bodyMedium">
        A one-pixel outline-variant rule on either axis, rendered as a native
        separator.
      </Text>

      <div className="divider-example__stack">
        <Text as="p" variant="bodyMedium">
          Full-width rule between sections.
        </Text>
        <Divider />
        <Text as="p" variant="bodyMedium">
          The same rule, inset from the leading edge by composition rather than
          by a prop.
        </Text>
        <Divider className="divider-example__inset" />
      </div>

      <ul className="divider-example__list">
        {lessons.map((lesson, index) => (
          <Fragment key={lesson}>
            <ListItem as="li" headline={lesson} />
            {index < lessons.length - 1 && <Divider as="li" />}
          </Fragment>
        ))}
      </ul>

      <div className="divider-example__row">
        <Text as="span" variant="labelLarge">
          Draft
        </Text>
        <Divider orientation="vertical" />
        <Text as="span" variant="labelLarge">
          12 lessons
        </Text>
        <Divider orientation="vertical" />
        <Text as="span" variant="labelLarge">
          Edited 2m ago
        </Text>
      </div>
    </Surface>
  )
}
