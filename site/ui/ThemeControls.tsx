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
import { useSiteTheme } from '../app/providers'
import { presetSources } from '../theme/palette'
import { Ramp } from './Ramp'

const modeSegments = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

/**
 * Color mode and source color, both wired to the public theme APIs.
 *
 * This is `Material3Provider`'s live demonstration — it is the one conformant
 * component with no isolated example, because every component on the site is
 * already inside it.
 */
export function ThemeControls() {
  const [open, setOpen] = useState(false)
  const { sourceColor, setSourceColor, colorMode, setColorMode, themeError, isCustomized, resetTheme } =
    useSiteTheme()

  return (
    <>
      <div className="bar__desktop-only">
        <SegmentedButtonGroup
          aria-label="Color mode"
          name="site-color-mode"
          value={colorMode}
          onValueChange={(value) => setColorMode(value as ColorMode)}
          segments={modeSegments}
        />
      </div>

      <IconButton
        aria-label={isCustomized ? 'Theme, customized' : 'Theme'}
        variant={isCustomized ? 'filled' : 'outlined'}
        onClick={() => setOpen(true)}
      >
        <Icon source="palette" />
      </IconButton>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Theme"
        actions={
          <>
            <Button variant="text" onClick={resetTheme} disabled={!isCustomized}>
              Reset
            </Button>
            <Button variant="text" onClick={() => setOpen(false)}>
              Done
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
          <div className="theme-panel__row" role="group" aria-label="Source color">
            <Text as="p" variant="titleSmall">
              Source color
            </Text>
            <Text as="p" variant="bodySmall">
              Every color on this site is generated from one source color, then
              validated by the library before it is applied.
            </Text>
            <div className="swatches">
              {presetSources.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  className="swatch"
                  style={{ background: preset.value }}
                  aria-label={preset.name}
                  aria-pressed={sourceColor === preset.value}
                  onClick={() => setSourceColor(preset.value)}
                />
              ))}
              <label
                className="swatch"
                style={{ background: sourceColor, display: 'grid', placeItems: 'center' }}
                title="Choose any source color"
              >
                <span className="visually-hidden">Custom source color</span>
                <input
                  type="color"
                  value={sourceColor}
                  onChange={(event) => setSourceColor(event.currentTarget.value)}
                  style={{ opacity: 0, inlineSize: '100%', blockSize: '100%', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {themeError && (
            <p className="theme-panel__error">
              The library rejected this theme: {themeError}
            </p>
          )}

          <div className="theme-panel__row" role="group" aria-label="Generated palettes">
            <Text as="p" variant="titleSmall">
              Generated palettes
            </Text>
            <Ramp showTones={false} />
          </div>

          <div className="theme-panel__row" role="group" aria-label="Color mode">
            <Text as="p" variant="titleSmall">
              Color mode
            </Text>
            <SegmentedButtonGroup
              aria-label="Color mode"
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
