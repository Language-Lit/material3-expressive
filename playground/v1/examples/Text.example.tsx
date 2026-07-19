import { Surface, Text } from '@language-lit/material3-expressive/v1'

export function TextExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="text-example-title"
      color="surface-container"
      shape="extra-large"
      className="text-example"
    >
      <Text
        as="h2"
        id="text-example-title"
        variant="displaySmall"
        emphasis="emphasized"
      >
        Expressive typography
      </Text>
      <Text as="p" variant="bodyLarge">
        Semantic elements and visual roles stay independent.
      </Text>
      <Surface color="inverse-surface" shape="medium" className="text-example__inverse">
        <Text variant="labelLarge" emphasis="emphasized">
          Content color is inherited
        </Text>
      </Surface>
    </Surface>
  )
}
