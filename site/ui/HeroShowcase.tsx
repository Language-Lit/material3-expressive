'use client'

import { useState } from 'react'
import { Button, Icon, LoadingIndicator, Surface, Switch, Text } from '@language-lit/material3-expressive'

/** A site composition using the same public defaults as the component demos. */
export function HeroShowcase() {
  const [presses, setPresses] = useState(0)
  const [animate, setAnimate] = useState(false)

  return (
    <div className="hero-demo" role="group" aria-label="Try Material 3 Expressive">
      <div className="hero-demo__heading">
        <span className="section__eyebrow">Try the real components</span>
        <span className="hero-demo__live">Interactive demo</span>
      </div>
      <Surface color="primary-container" shape="extra-extra-large" className="hero-demo__press">
        <Text as="h2" variant="titleLarge">Buttons that respond to you</Text>
        <div className="hero-demo__button">
          <Button size="large" variant="filled" onClick={() => setPresses((value) => value + 1)}
            trailingIcon={<Icon source="arrow_forward" mirrored />}>
            Press and hold
          </Button>
        </div>
        <Text as="p" variant="bodyMedium">Press and hold to see the shape change.</Text>
        <span className="visually-hidden" role="status">{presses ? `Button pressed ${presses} ${presses === 1 ? 'time' : 'times'}.` : ''}</span>
      </Surface>
      <div className="hero-demo__bottom">
        <Surface color="tertiary-container" shape="extra-large" className="hero-demo__motion">
          <LoadingIndicator aria-label="Example loading indicator" value={animate ? undefined : 0.65} />
          <Text as="h2" variant="titleMedium">Expressive loading</Text>
          <Text as="p" variant="bodySmall">Material shapes replace the usual spinner.</Text>
        </Surface>
        <Surface color="secondary-container" shape="large-increased" className="hero-demo__toggle">
          <label className="hero-demo__switch">
            <Switch checked={animate} onCheckedChange={setAnimate} />
            <Text as="span" variant="titleMedium">Animate the indicator</Text>
          </label>
          <Text as="p" variant="bodySmall">Switch between a fixed value and the full animation.</Text>
          <a href="/components/LoadingIndicator/">View LoadingIndicator docs →</a>
        </Surface>
      </div>
      <p className="hero-demo__caption">Everything in this demo comes from the package.</p>
    </div>
  )
}
