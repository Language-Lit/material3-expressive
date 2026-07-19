import { Surface } from '@language-lit/material3-expressive/v1'

export function SurfaceExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="surface-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="surface-example"
    >
      <h2 id="surface-example-title">Surface</h2>
      <p>Color, content color, shape, and elevation stay theme-backed.</p>
      <Surface
        color="primary-container"
        shape="large"
        shadowElevation={1}
        className="surface-example__nested"
      >
        Nested semantic content
      </Surface>
    </Surface>
  )
}
