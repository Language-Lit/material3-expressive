# WavyProgress

`WavyProgress` renders the Material 3 Expressive traveling-wave treatment:
a rippling sine wave along a bar (`shape="linear"`, the default) or around
a ring (`shape="circular"`). Pass `value` for determinate progress, or omit
it entirely for a continuously animating indeterminate wave — the same
contract a native `<progress>` element uses.

```tsx
import { WavyProgress } from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'

<WavyProgress aria-label="Upload progress" value={0.4} />
<WavyProgress aria-label="Progress" shape="circular" value={0.4} />
<WavyProgress aria-label="Syncing" />
```

## Contract

- `shape: 'linear' | 'circular'` (default `'linear'`) selects the
  orientation. `value` (a number in `[0, max]`) renders determinate
  progress with an accurate `aria-valuenow`; near `0%`/`100%` progress the
  wave's amplitude ramps down to a nearly flat line/ring. Omitting `value`
  renders indeterminate mode (no `aria-valuenow`), always at full
  amplitude.
- `max` defaults to `1`. `aria-label`/`aria-labelledby` provide the
  required accessible name.
- `shape="linear"`'s `inline-size` defaults to `100%`; `shape="circular"`
  has a fixed `48px` intrinsic size — the same width-flexibility split
  `LinearProgress`/`CircularProgress` use.
- For the plain (non-wavy) treatment, see `LinearProgress`/
  `CircularProgress`.

## Tokens and boundaries

Colors, geometry, and motion timing come entirely from `--m3e-comp-wavy-
progress-*` CSS custom properties, scoped by `Material3Provider`.
`WavyProgress` injects no runtime styles, uses no `requestAnimationFrame`
loop (every animation — wave travel, indeterminate motion, amplitude
ramp — is pure CSS `transform`/`@keyframes`/`transition`), and imports no
legacy source, Next.js, Vite, router, animation library, or private downstream application
code.
