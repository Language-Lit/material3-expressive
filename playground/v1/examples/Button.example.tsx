import {
  Button,
  Icon,
  Surface,
  Text,
  type ButtonSize,
  type ButtonVariant,
} from '@language-lit/material3-expressive/v1'

const variants: readonly ButtonVariant[] = [
  'filled',
  'tonal',
  'elevated',
  'outlined',
  'text',
]

const sizes: readonly ButtonSize[] = [
  'extra-small',
  'small',
  'medium',
  'large',
  'extra-large',
]

export function ButtonExample() {
  return (
    <Surface
      as="section"
      aria-labelledby="button-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="button-example"
    >
      <Text as="h2" id="button-example-title" variant="titleLarge" emphasis="emphasized">
        Expressive buttons
      </Text>
      <Text as="p" variant="bodyMedium">
        Native form behavior with five emphasis variants and five size-aware shape morphs.
      </Text>
      <div className="button-example__row" aria-label="Button variants">
        {variants.map((variant) => (
          <Button key={variant} variant={variant} leadingIcon={<Icon source="add" />}>
            {variant}
          </Button>
        ))}
      </div>
      <div className="button-example__sizes" aria-label="Expressive button sizes">
        {sizes.map((size) => (
          <Button
            key={size}
            variant="tonal"
            size={size}
            shape={size === 'medium' ? 'square' : 'round'}
            trailingIcon={<Icon source="arrow_forward" mirrored />}
          >
            {size}
          </Button>
        ))}
      </div>
      <Button variant="outlined" width="full" shape="square">
        Full-width native button
      </Button>
      <Button disabled>Disabled</Button>
    </Surface>
  )
}
