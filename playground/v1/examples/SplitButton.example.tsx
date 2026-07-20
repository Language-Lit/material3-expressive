import { useState } from 'react'
import { Icon, Surface, SplitButton, Text } from '@language-lit/material3-expressive/v1'

export function SplitButtonExample() {
  const [open, setOpen] = useState(false)

  return (
    <Surface
      as="section"
      aria-labelledby="split-button-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="split-button-example"
    >
      <Text as="h2" id="split-button-example-title" variant="titleLarge" emphasis="emphasized">
        Split button
      </Text>
      <Text as="p" variant="bodyMedium">
        A primary action paired with an icon-only toggle, visually joined
        as one pill. The trailing button morphs to a full circle while
        selected.
      </Text>

      <div className="split-button-example__row">
        <SplitButton
          variant="filled"
          trailingIcon={<Icon source={open ? 'expand_less' : 'expand_more'} />}
          trailingLabel="More save options"
          selected={open}
          onSelectedChange={setOpen}
        >
          Save
        </SplitButton>
        <SplitButton
          variant="tonal"
          size="large"
          leadingIcon={<Icon source="send" />}
          trailingIcon={<Icon source="expand_more" />}
          trailingLabel="More send options"
        >
          Send
        </SplitButton>
        <SplitButton
          variant="outlined"
          trailingIcon={<Icon source="expand_more" />}
          trailingLabel="More options"
          disabled
        >
          Unavailable
        </SplitButton>
      </div>
    </Surface>
  )
}
