import { createRef } from 'react'
import {
  RangeSlider,
  Slider,
  type RangeSliderValue,
  type SliderVisualState,
} from '../../../src/components/Slider'

const inputRef = createRef<HTMLInputElement>()
const rootRef = createRef<HTMLDivElement>()
const startRef = createRef<HTMLInputElement>()
const endRef = createRef<HTMLInputElement>()
const range: RangeSliderValue = [0.2, 0.8]

;<Slider ref={inputRef} aria-label="Volume" name="volume" />
;<Slider defaultValue={0.5} orientation="vertical" topToBottom={false} centered />
;<Slider value={0.5} onValueChange={() => undefined} steps={4} />
;<Slider
  aria-label="Custom"
  thumb={(state: SliderVisualState) => <span>{state.value}</span>}
  renderTick={(state) => <span>{state.index}</span>}
  renderStopIndicator={(state) => <span>{state.edge}</span>}
/>

;<RangeSlider
  ref={rootRef}
  startInputRef={startRef}
  endInputRef={endRef}
  startAriaLabel="Minimum"
  endAriaLabel="Maximum"
  defaultValue={range}
  startInputProps={{ name: 'minimum', form: 'filters' }}
  endInputProps={{ name: 'maximum', form: 'filters' }}
  onPointerDown={() => undefined}
/>
;<RangeSlider
  startAriaLabel="Minimum"
  endAriaLabel="Maximum"
  value={range}
  onValueChange={() => undefined}
/>

// @ts-expect-error a controlled Slider must report changes
;<Slider aria-label="Volume" value={0.5} />

// @ts-expect-error controlled and uncontrolled Slider state cannot be combined
;<Slider
  aria-label="Volume"
  value={0.5}
  defaultValue={0.2}
  onValueChange={() => undefined}
/>

// @ts-expect-error orientation is closed
;<Slider aria-label="Volume" orientation="diagonal" />

// @ts-expect-error Slider owns pointer gesture resolution
;<Slider aria-label="Volume" onPointerDown={() => undefined} />

// @ts-expect-error the semantic input type is fixed
;<Slider aria-label="Volume" type="text" />

// @ts-expect-error the semantic role is fixed
;<Slider aria-label="Volume" role="spinbutton" />

// @ts-expect-error both RangeSlider thumb names are required
;<RangeSlider startAriaLabel="Minimum" />

// @ts-expect-error a controlled RangeSlider must report changes
;<RangeSlider startAriaLabel="Minimum" endAriaLabel="Maximum" value={range} />

// @ts-expect-error RangeSlider owns its visual children
;<RangeSlider startAriaLabel="Minimum" endAriaLabel="Maximum">Text</RangeSlider>

;<RangeSlider
  startAriaLabel="Minimum"
  endAriaLabel="Maximum"
  // @ts-expect-error each range input role is fixed
  startInputProps={{ role: 'spinbutton' }}
/>
