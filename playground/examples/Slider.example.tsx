import { useState } from 'react'
import {
  RangeSlider,
  Slider,
  Surface,
  Text,
} from '@language-lit/material3-expressive'

export function SliderExample() {
  const [volume, setVolume] = useState(0.62)
  const [price, setPrice] = useState<readonly [number, number]>([20, 80])

  return (
    <Surface
      as="section"
      aria-labelledby="slider-example-title"
      color="surface-container-low"
      shape="extra-large"
      className="slider-example"
    >
      <Text
        as="h2"
        id="slider-example-title"
        variant="titleLarge"
        emphasis="emphasized"
      >
        Sliders
      </Text>
      <Text as="p" variant="bodyMedium">
        Continuous, stepped, centered, range, and vertical source paths.
      </Text>

      <label className="slider-example__field">
        <Text as="span" variant="labelLarge">
          Volume · {Math.round(volume * 100)}%
        </Text>
        <Slider
          value={volume}
          onValueChange={setVolume}
          name="volume"
        />
      </label>

      <label className="slider-example__field">
        <Text as="span" variant="labelLarge">
          Reading speed
        </Text>
        <Slider min={0.5} max={2} steps={5} defaultValue={1} />
      </label>

      <label className="slider-example__field">
        <Text as="span" variant="labelLarge">
          Centered balance
        </Text>
        <Slider min={-1} max={1} steps={7} defaultValue={0.25} centered />
      </label>

      <label className="slider-example__field" dir="rtl">
        <Text as="span" variant="labelLarge">
          RTL stepped
        </Text>
        <Slider
          aria-label="RTL stepped slider"
          steps={4}
          defaultValue={0.4}
        />
      </label>

      <div
        className="slider-example__field"
        role="group"
        aria-label="Price range example"
      >
        <Text as="span" variant="labelLarge">
          Price · ${price[0]}–${price[1]}
        </Text>
        <RangeSlider
          startAriaLabel="Minimum price"
          endAriaLabel="Maximum price"
          min={0}
          max={100}
          steps={9}
          value={price}
          onValueChange={setPrice}
        />
      </div>

      <div className="slider-example__vertical-row">
        <div className="slider-example__vertical-field">
          <Text as="span" variant="labelMedium">
            Top to bottom
          </Text>
          <Slider
            aria-label="Top to bottom level"
            orientation="vertical"
            defaultValue={0.35}
          />
        </div>
        <div className="slider-example__vertical-field">
          <Text as="span" variant="labelMedium">
            Bottom to top
          </Text>
          <Slider
            aria-label="Bottom to top level"
            orientation="vertical"
            topToBottom={false}
            defaultValue={0.65}
          />
        </div>
        <div className="slider-example__vertical-field">
          <Text as="span" variant="labelMedium">
            Disabled
          </Text>
          <Slider
            aria-label="Unavailable level"
            orientation="vertical"
            defaultValue={0.5}
            disabled
          />
        </div>
      </div>
    </Surface>
  )
}
