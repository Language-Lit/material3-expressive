import { LinearProgress, Surface, Text } from '@language-lit/material3-expressive/v1'

export function LinearProgressExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="linear-progress-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="linear-progress-example"
    >
      <Text as="h2" id="linear-progress-example-title" variant="titleLarge" emphasis="emphasized">
        Linear progress
      </Text>
      <Text as="p" variant="bodyMedium">
        Determinate at a few fractions and self-animating indeterminate. See
        WavyProgress for the Material 3 Expressive traveling-wave treatment.
      </Text>

      <Text as="p" variant="labelLarge">Determinate</Text>
      <LinearProgress aria-label="Download progress, low" value={0.05} />
      <LinearProgress aria-label="Download progress, mid" value={0.45} />
      <LinearProgress aria-label="Download progress, high" value={0.98} />

      <Text as="p" variant="labelLarge">Indeterminate</Text>
      <LinearProgress aria-label="Loading" />
    </Surface>
  )
}
