'use client'

import { useState } from 'react'
import {
  Button,
  Dialog,
  Icon,
  IconButton,
  SegmentedButtonGroup,
  Text,
  type ColorMode,
} from '@language-lit/material3-expressive'
import { useThemeControls } from '../app/providers'
import { Ramp } from './Ramp'
import { SourceColorSwatches } from './SourceColorSwatches'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

/**
 * Color mode and source color, both wired to the public theme APIs.
 *
 * This is `Material3Provider`'s live demonstration — it is the one conformant
 * component with no isolated example, because every component on the site is
 * already inside it.
 */
export function ThemeControls() {
  const [open, setOpen] = useState(false)
  const locale = useLocale()
  const t = shellMessages[locale]
  const modeSegments = [
    { value: 'light', label: t.light },
    { value: 'dark', label: t.dark },
    { value: 'system', label: t.system },
  ]
  const { colorMode, setColorMode, themeError, isCustomized, resetTheme } = useThemeControls()

  return (
    <>
      <div className="bar__desktop-only">
        <SegmentedButtonGroup
          aria-label={t.colorMode}
          name="site-color-mode"
          value={colorMode}
          onValueChange={(value) => setColorMode(value as ColorMode)}
          segments={modeSegments}
        />
      </div>

      <IconButton
        aria-label={isCustomized ? t.themeButtonCustomized : t.themeButton}
        variant={isCustomized ? 'filled' : 'outlined'}
        onClick={() => setOpen(true)}
      >
        <Icon source="palette" />
      </IconButton>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t.themeTitle}
        actions={
          <>
            <Button variant="text" onClick={resetTheme} disabled={!isCustomized}>
              {t.themeReset}
            </Button>
            <Button variant="text" onClick={() => setOpen(false)}>
              {t.themeDone}
            </Button>
          </>
        }
      >
        <div className="theme-panel">
          {/*
           * The rows below label control groups, so they are marked up as
           * groups rather than as `h3` sections. The panel is in the static
           * HTML whether or not it is open, and as headings these three sat in
           * every page's outline ahead of its `h1`.
           */}
          <div className="theme-panel__row" role="group" aria-label={t.sourceColor}>
            <Text as="p" variant="titleSmall">
              {t.sourceColor}
            </Text>
            <Text as="p" variant="bodySmall">
              {t.sourceColorDescription}
            </Text>
            <SourceColorSwatches />
          </div>

          {themeError && (
            <p className="theme-panel__error">
              {t.sourceColorInvalidTheme(themeError)}
            </p>
          )}

          <div className="theme-panel__row" role="group" aria-label={t.generatedPalettes}>
            <Text as="p" variant="titleSmall">
              {t.generatedPalettes}
            </Text>
            <Ramp showTones={false} />
          </div>

          <div className="theme-panel__row" role="group" aria-label={t.colorMode}>
            <Text as="p" variant="titleSmall">
              {t.colorMode}
            </Text>
            <SegmentedButtonGroup
              aria-label={t.colorMode}
              name="site-color-mode-panel"
              value={colorMode}
              onValueChange={(value) => setColorMode(value as ColorMode)}
              segments={modeSegments}
            />
          </div>
        </div>
      </Dialog>
    </>
  )
}
