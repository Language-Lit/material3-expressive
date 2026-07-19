import { useState } from 'react'
import {
  Button,
  Card,
  Surface,
  Text,
  type CardVariant,
} from '@language-lit/material3-expressive/v1'

const variants: readonly CardVariant[] = ['filled', 'elevated', 'outlined']

export function CardExample() {
  const [openedCard, setOpenedCard] = useState('none')

  return (
    <Surface
      as="section"
      aria-labelledby="card-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="card-example"
    >
      <Text as="h2" id="card-example-title" variant="titleLarge" emphasis="emphasized">
        Material cards
      </Text>
      <Text as="p" variant="bodyMedium">
        Passive rich containers and native whole-card actions share sourced variants.
      </Text>
      <div className="card-example__grid">
        {variants.map((variant) => (
          <Card key={variant} variant={variant} className="card-example__item">
            <Text as="h3" variant="titleMedium" emphasis="emphasized">
              {variant} information
            </Text>
            <Text as="p" variant="bodyMedium">
              Rich passive content may contain its own structure and actions.
            </Text>
            <Button variant="text" size="extra-small">
              Card action
            </Button>
          </Card>
        ))}
      </div>
      <div className="card-example__grid">
        {variants.map((variant) => (
          <Card
            key={variant}
            interactive
            variant={variant}
            className="card-example__item"
            onClick={() => setOpenedCard(variant)}
          >
            <Text as="span" variant="titleMedium" emphasis="emphasized">
              Open {variant} card
            </Text>
            <Text as="small" variant="bodySmall">
              Native button behavior
            </Text>
          </Card>
        ))}
        <Card interactive disabled className="card-example__item">
          Unavailable card
        </Card>
      </div>
      <Text as="output" variant="bodySmall" aria-live="polite">
        Last opened: {openedCard}
      </Text>
    </Surface>
  )
}
