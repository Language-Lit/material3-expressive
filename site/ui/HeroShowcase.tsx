'use client'

import { useState } from 'react'
import { Button, Icon, LoadingIndicator, Surface, Switch, Text } from '@language-lit/material3-expressive'
import { localizePath } from '../i18n/locales'
import { homeMessages } from '../i18n/messages/home'
import { useLocale } from '../i18n/useLocale'

/** A site composition using the same public defaults as the component demos. */
export function HeroShowcase() {
  const locale = useLocale()
  const t = homeMessages[locale]
  const [presses, setPresses] = useState(0)
  const [animate, setAnimate] = useState(false)

  return (
    <div className="hero-demo" role="group" aria-label={t.heroDemoLabel}>
      <div className="hero-demo__heading">
        <span className="section__eyebrow">{t.tryRealComponents}</span>
        <span className="hero-demo__live">{t.interactiveDemo}</span>
      </div>
      <Surface color="primary-container" shape="extra-extra-large" className="hero-demo__press">
        <Text as="h2" variant="titleLarge">{t.buttonsRespond}</Text>
        <div className="hero-demo__button">
          <Button size="large" variant="filled" onClick={() => setPresses((value) => value + 1)}
            trailingIcon={<Icon source="arrow_forward" mirrored />}>
            {t.pressAndHold}
          </Button>
        </div>
        <Text as="p" variant="bodyMedium">{t.shapeChangeHint}</Text>
        <span className="visually-hidden" role="status">{presses ? t.buttonPressed(presses) : ''}</span>
      </Surface>
      <div className="hero-demo__bottom">
        <Surface color="tertiary-container" shape="extra-large" className="hero-demo__motion">
          <LoadingIndicator aria-label={t.exampleLoadingIndicator} value={animate ? undefined : 0.65} />
          <Text as="h2" variant="titleMedium">{t.expressiveLoading}</Text>
          <Text as="p" variant="bodySmall">{t.spinnerReplacement}</Text>
        </Surface>
        <Surface color="secondary-container" shape="large-increased" className="hero-demo__toggle">
          <label className="hero-demo__switch">
            <Switch checked={animate} onCheckedChange={setAnimate} />
            <Text as="span" variant="titleMedium">{t.animateIndicator}</Text>
          </label>
          <Text as="p" variant="bodySmall">{t.animationHint}</Text>
          <a href={localizePath(locale, '/components/LoadingIndicator/')}>{t.loadingIndicatorDocs}</a>
        </Surface>
      </div>
      <p className="hero-demo__caption">{t.packageDemoCaption}</p>
    </div>
  )
}
