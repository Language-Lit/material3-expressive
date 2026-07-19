import { useRef } from 'react'
import { Icon, IconButton, Surface, Text, Tooltip } from '@language-lit/material3-expressive/v1'

export function TooltipExample() {
  const plainAnchorRef = useRef<HTMLButtonElement>(null)
  const richAnchorRef = useRef<HTMLButtonElement>(null)

  return (
    <Surface
      as="section"
      aria-labelledby="tooltip-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="tooltip-example"
    >
      <Text as="h2" id="tooltip-example-title" variant="titleLarge" emphasis="emphasized">
        Tooltip
      </Text>
      <Text as="p" variant="bodyMedium">
        Shows on hover or keyboard focus of its anchor and hides on leave or
        blur, with no wiring beyond an `anchorRef`.
      </Text>

      <div className="tooltip-example__row">
        <IconButton ref={plainAnchorRef} aria-label="Favorite" variant="standard">
          <Icon source="star" />
        </IconButton>
        <Tooltip anchorRef={plainAnchorRef} content="Add to favorites" />

        <IconButton ref={richAnchorRef} aria-label="Storage info" variant="standard">
          <Icon source="info" />
        </IconButton>
        <Tooltip
          anchorRef={richAnchorRef}
          variant="rich"
          subhead="Storage"
          content="12 of 15 GB used. Free up space by removing unused files."
          placement="bottom"
        />
      </div>
    </Surface>
  )
}
