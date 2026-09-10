'use client'

import {
  Button,
  Card,
  Checkbox,
  Icon,
  LinearProgress,
  SegmentedButtonGroup,
  Surface,
  Switch,
  Text,
  TextField,
} from '@language-lit/material3-expressive'
import { useSiteTheme } from '../app/providers'
import { presetSources } from '../theme/palette'

/**
 * A live sampler with the source-color control beside it.
 *
 * The point is immediacy: the visitor changes one value and watches real
 * components — not an image of them — resolve new tokens. The controls are
 * repeated here rather than only in the app bar because this is the moment the
 * claim is being made.
 */
export function ThemeShowcase() {
  const { sourceColor, setSourceColor, colorMode, setColorMode, themeError } = useSiteTheme()

  return (
    <div className="showcase">
      <div className="showcase__controls">
        <Text as="h3" variant="titleSmall">
          Source color
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
        {themeError && (
          <p className="theme-panel__error">
            The library rejected this theme: {themeError}
          </p>
        )}
        <Text as="p" variant="bodySmall" className="claim__body">
          Choose a color and watch the whole page change. You can also compare
          the components in light and dark mode.
        </Text>
      </div>

      <Surface as="div" color="surface-container-lowest" shape="large" className="showcase__stage">
        <div className="showcase__row">
          <Button variant="filled" leadingIcon={<Icon source="add" />}>
            Filled
          </Button>
          <Button variant="tonal">Tonal</Button>
          <Button variant="elevated">Elevated</Button>
          <Button variant="outlined">Outlined</Button>
          <Button variant="text">Text</Button>
        </div>

        <div className="showcase__row">
          <SegmentedButtonGroup
            aria-label="Demo color mode"
            name="showcase-color-mode"
            value={colorMode}
            onValueChange={(value) => setColorMode(value as 'light' | 'dark' | 'system')}
            segments={[
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
              { value: 'system', label: 'System' },
            ]}
          />
        </div>

        <div className="showcase__row">
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox defaultChecked name="showcase-checkbox" />
            <Text as="span" variant="bodyMedium">
              Checkbox
            </Text>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Switch defaultChecked name="showcase-switch" />
            <Text as="span" variant="bodyMedium">
              Switch
            </Text>
          </label>
        </div>

        <TextField
          variant="outlined"
          label="Project name"
          supportingText="Native input, native validation"
          leadingIcon={<Icon source="folder" />}
        />

        <LinearProgress value={0.62} aria-label="Example progress" />

        <Card variant="filled">
          {/* `Card` is a container: it owns color, shape, and elevation, and
              leaves padding and content layout to the consumer. This is that
              layout — without it the card's children are flush to its edges
              and compress as column flex items. */}
          <div className="showcase__card">
            <Text as="h4" variant="titleMedium">
              One theme controls every component
            </Text>
            <Text as="p" variant="bodySmall" className="claim__body">
              Buttons, fields, and cards all use the same color, shape, and
              motion tokens. Change them through the typed theme API.
            </Text>
          </div>
        </Card>
      </Surface>
    </div>
  )
}
