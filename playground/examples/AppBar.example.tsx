import { useRef } from 'react'
import {
  AppBar,
  Icon,
  IconButton,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

const paragraphs = [
  'Scroll this panel: the bar above it collapses to a small bar and holds there until the content returns to the top.',
  'The collapsed row fades its title in through the sourced easing while the expanded title fades out and its row shrinks away.',
  'The container fills toward the on-scroll color continuously — the same lerp the Compose implementation computes from its collapse fraction.',
  'Scrolling back up restores the expanded title only at the very top, matching exit-until-collapsed semantics.',
]

export function AppBarExample() {
  const collapseScrollRef = useRef<HTMLDivElement | null>(null)
  const pinnedScrollRef = useRef<HTMLDivElement | null>(null)

  return (
    <Surface
      as="section"
      aria-labelledby="app-bar-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="app-bar-example"
    >
      <Text as="h2" id="app-bar-example-title" variant="titleLarge" emphasis="emphasized">
        App bars
      </Text>
      <Text as="p" variant="bodyMedium">
        One component covers the six top-bar variants. The first panel pins a
        small bar that fills with color on scroll; the second collapses a large
        flexible bar to a small one.
      </Text>

      <div className="app-bar-example__panel" ref={pinnedScrollRef}>
        <AppBar
          title="Inbox"
          subtitle="All accounts"
          scrollBehavior="pinned"
          scrollContainer={pinnedScrollRef}
          navigationIcon={
            <IconButton aria-label="Open navigation">
              <Icon source="menu" />
            </IconButton>
          }
          actions={
            <IconButton aria-label="Search">
              <Icon source="search" />
            </IconButton>
          }
        />
        <div className="app-bar-example__content">
          {paragraphs.map((paragraph) => (
            <Text as="p" key={paragraph} variant="bodyMedium">
              {paragraph}
            </Text>
          ))}
        </div>
      </div>

      <div className="app-bar-example__panel" ref={collapseScrollRef}>
        <AppBar
          size="large"
          flexible
          title="Lessons"
          subtitle="Unit 4 · Listening"
          scrollBehavior="exitUntilCollapsed"
          scrollContainer={collapseScrollRef}
          navigationIcon={
            <IconButton aria-label="Back">
              <Icon source="arrow_back" />
            </IconButton>
          }
        />
        <div className="app-bar-example__content">
          {paragraphs.map((paragraph) => (
            <Text as="p" key={`collapse-${paragraph}`} variant="bodyMedium">
              {paragraph}
            </Text>
          ))}
        </div>
      </div>
    </Surface>
  )
}
