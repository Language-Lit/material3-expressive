# NavigationSuite

`NavigationSuite` picks the right navigation layout for the current
viewport width automatically: `NavigationBar` below 600px,
`NavigationRail` from 600–839px, and a permanent `NavigationDrawer` at
840px and up — the pinned Material breakpoint tiers.

```tsx
import { Icon, NavigationSuite } from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'

<NavigationSuite
  aria-label="Primary sections"
  items={[
    { value: 'home', label: 'Home', icon: <Icon source="home" /> },
    { value: 'favorites', label: 'Favorites', icon: <Icon source="favorite" /> },
  ]}
/>
```

## Contract

- `items`, `value`/`defaultValue`/`onValueChange` reuse `NavigationBar`'s
  own `NavigationItem` shape. `header` passes through to `NavigationRail`
  only (ignored at the other two tiers).
- Registers no component tokens of its own — whichever of `NavigationBar`/
  `NavigationRail`/`NavigationDrawer` is currently rendered supplies every
  color, geometry, and motion value.
- Server-rendered and pre-hydration markup always reflects the compact
  tier (`NavigationBar`), since there is no real viewport to measure yet;
  a client effect measures the actual width immediately after mount and
  corrects it.

## Tokens and boundaries

Theme overrides remain scoped to `Material3Provider`; `NavigationSuite`
injects no runtime styles. It imports no legacy source, Next.js, Vite,
router, animation library, or private downstream application code.
