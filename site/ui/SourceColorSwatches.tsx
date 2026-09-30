'use client'

import { useId, useRef, useState, type PointerEvent } from 'react'
import { Button, Dialog, Icon, IconButton, Text, TextField } from '@language-lit/material3-expressive'
import { useSiteSource, useThemeControls } from '../app/providers'
import { defaultSourceColor, parseHex, presetSources } from '../theme/palette'
import { hexToHsv, hsvToHex, type HsvColor } from '../theme/color-selection'
import { useLocale } from '../i18n/useLocale'
import { shellMessages } from '../i18n/messages/shell'

/** Source-color controls shared by the theme panel and home-page showcase. */
export function SourceColorSwatches() {
  const locale = useLocale()
  const t = shellMessages[locale]
  const { sourceColor } = useSiteSource()
  const { setSourceColor } = useThemeControls()
  const [open, setOpen] = useState(false)
  const [hsv, setHsv] = useState(() => hexToHsv(sourceColor))
  const [hex, setHex] = useState(sourceColor)
  const pointerId = useRef<number | null>(null)
  const dragHintId = useId()
  const draft = hsvToHex(hsv)
  const validHex = parseHex(hex)
  const isCustom = !presetSources.some((preset) => preset.value === sourceColor)

  const editHex = (value: string) => {
    setHex(value)
    if (parseHex(value)) setHsv(hexToHsv(value, hsv.h))
  }
  const selectColor = (next: HsvColor) => {
    setHsv(next)
    setHex(hsvToHex(next))
  }
  const selectAtPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    selectColor({
      ...hsv,
      s: Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)),
      v: 1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height)),
    })
  }
  const apply = () => {
    if (!validHex) return
    if (draft !== sourceColor) setSourceColor(draft)
    setOpen(false)
  }

  return (
    <div className="swatches">
      {presetSources.map((preset) => (
        <button
          key={preset.value}
          type="button"
          className="swatch"
          style={{ background: preset.value }}
          aria-label={t.presetColors[presetSources.indexOf(preset)] ?? preset.name}
          aria-pressed={sourceColor === preset.value}
          onClick={() => setSourceColor(preset.value)}
        />
      ))}
      <IconButton
        aria-label={t.customSourceColor}
        aria-haspopup="dialog"
        variant={isCustom ? 'filled' : 'outlined'}
        onClick={() => {
          const initial = parseHex(sourceColor) ? sourceColor : defaultSourceColor
          setHsv(hexToHsv(initial))
          setHex(initial)
          setOpen(true)
        }}
      >
        <Icon source="palette" />
      </IconButton>
      {/* No input[type=color]: its browser-owned panel can expose a screen
          eyedropper. This dialog uses only page controls and local draft state. */}
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t.customSourceColor}
        actions={
          <>
            <Button variant="text" onClick={() => setOpen(false)}>{t.cancel}</Button>
            <Button disabled={!validHex} onClick={apply}>{t.apply}</Button>
          </>
        }
      >
        <div className="source-color-editor">
          <div
            className="source-color-editor__plane"
            style={{ backgroundColor: `hsl(${hsv.h} 100% 50%)` }}
            role="slider"
            tabIndex={0}
            aria-label={t.saturationBrightness}
            aria-describedby={dragHintId}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(hsv.s * 100)}
            aria-valuetext={t.saturationBrightnessValue(Math.round(hsv.s * 100), Math.round(hsv.v * 100))}
            onPointerDown={(event) => {
              if (event.button !== 0 || pointerId.current !== null) return
              event.preventDefault()
              event.currentTarget.focus()
              event.currentTarget.setPointerCapture(event.pointerId)
              pointerId.current = event.pointerId
              selectAtPointer(event)
            }}
            onPointerMove={(event) => {
              if (pointerId.current === event.pointerId) selectAtPointer(event)
            }}
            onPointerUp={(event) => {
              if (pointerId.current !== event.pointerId) return
              selectAtPointer(event)
              pointerId.current = null
              event.currentTarget.releasePointerCapture(event.pointerId)
            }}
            onPointerCancel={() => { pointerId.current = null }}
            onLostPointerCapture={() => { pointerId.current = null }}
            onKeyDown={(event) => {
              const step = event.shiftKey ? 0.1 : 0.01
              const next = { ...hsv }
              switch (event.key) {
                case 'ArrowLeft': next.s = Math.max(0, hsv.s - step); break
                case 'ArrowRight': next.s = Math.min(1, hsv.s + step); break
                case 'ArrowDown': next.v = Math.max(0, hsv.v - step); break
                case 'ArrowUp': next.v = Math.min(1, hsv.v + step); break
                default: return
              }
              event.preventDefault()
              selectColor(next)
            }}
          >
            <span
              className="source-color-editor__cursor"
              style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, backgroundColor: draft }}
              aria-hidden="true"
            />
          </div>
          <span id={dragHintId} className="visually-hidden">
            {t.saturationBrightnessHint}
          </span>
          <label className="source-color-editor__channel">
            <Text as="span" variant="labelLarge">{t.hue}</Text>
            <input
              className="source-color-editor__hue"
              type="range"
              min={0}
              max={360}
              step={1}
              value={hsv.h}
              aria-label={t.hue}
              aria-valuetext={t.hueValue(Math.round(hsv.h))}
              onChange={(event) => selectColor({ ...hsv, h: Number(event.currentTarget.value) })}
            />
          </label>
          <div className="source-color-editor__preview" style={{ backgroundColor: draft }} aria-hidden="true" />
          <TextField
            label={t.hexColor}
            value={hex}
            autoComplete="off"
            spellCheck={false}
            error={!validHex}
            supportingText={validHex ? t.hexColorHint : t.hexColorInvalid}
            onChange={(event) => editHex(event.currentTarget.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                apply()
              }
            }}
          />
        </div>
      </Dialog>
    </div>
  )
}
