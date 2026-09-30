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
import { useThemeControls } from '../app/providers'
import { SourceColorSwatches } from './SourceColorSwatches'
import { homeMessages } from '../i18n/messages/home'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

/**
 * A live sampler with the source-color control beside it.
 *
 * The point is immediacy: the visitor changes one value and watches real
 * components — not an image of them — resolve new tokens. The controls are
 * repeated here rather than only in the app bar because this is the moment the
 * claim is being made.
 */
export function ThemeShowcase() {
  const locale = useLocale()
  const t = homeMessages[locale]
  const shell = shellMessages[locale]
  const { colorMode, setColorMode, themeError } = useThemeControls()

  return (
    <div className="showcase">
      <div className="showcase__controls">
        <Text as="h3" variant="titleSmall">
          {t.themeSourceColor}
        </Text>
        <SourceColorSwatches />
        {themeError && (
          <p className="theme-panel__error">
            {t.themeError(themeError)}
          </p>
        )}
        <Text as="p" variant="bodySmall" className="claim__body">
          {t.themeShowcaseLede}
        </Text>
      </div>

      <Surface as="div" color="surface-container-lowest" shape="large" className="showcase__stage">
        <div className="showcase__row">
          <Button variant="filled" leadingIcon={<Icon source="add" />}>
            {t.filled}
          </Button>
          <Button variant="tonal">{t.tonal}</Button>
          <Button variant="elevated">{t.elevated}</Button>
          <Button variant="outlined">{t.outlined}</Button>
          <Button variant="text">{t.textButton}</Button>
        </div>

        <div className="showcase__row">
          <SegmentedButtonGroup
            aria-label={t.demoColorMode}
            name="showcase-color-mode"
            value={colorMode}
            onValueChange={(value) => setColorMode(value as 'light' | 'dark' | 'system')}
            segments={[
              { value: 'light', label: shell.light },
              { value: 'dark', label: shell.dark },
              { value: 'system', label: shell.system },
            ]}
          />
        </div>

        <div className="showcase__row">
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Checkbox defaultChecked name="showcase-checkbox" />
            <Text as="span" variant="bodyMedium">
              {t.checkbox}
            </Text>
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
            <Switch defaultChecked name="showcase-switch" />
            <Text as="span" variant="bodyMedium">
              {t.switch}
            </Text>
          </label>
        </div>

        <TextField
          variant="outlined"
          label={t.projectName}
          supportingText={t.nativeValidation}
          leadingIcon={<Icon source="folder" />}
        />

        <LinearProgress value={0.62} aria-label={t.exampleProgress} />

        <Card variant="filled">
          {/* `Card` is a container: it owns color, shape, and elevation, and
              leaves padding and content layout to the consumer. This is that
              layout — without it the card's children are flush to its edges
              and compress as column flex items. */}
          <div className="showcase__card">
            <Text as="h4" variant="titleMedium">
              {t.oneThemeTitle}
            </Text>
            <Text as="p" variant="bodySmall" className="claim__body">
              {t.oneThemeBody}
            </Text>
          </div>
        </Card>
      </Surface>
    </div>
  )
}
