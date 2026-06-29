# @language-lit/material3-expressive

A framework-agnostic React component library implementing the Material 3 Expressive design system. Pure React — no Next.js dependency.

## Install

```bash
npm install @language-lit/material3-expressive
```

Peer dependencies: `react`, `react-dom`, `tailwindcss`.

## Setup

**1. Tailwind preset** — add it to your `tailwind.config`:

```ts
import { material3Preset } from '@language-lit/material3-expressive/tailwind-preset'

export default {
  presets: [material3Preset],
  content: [
    './src/**/*.{ts,tsx}',
    './node_modules/@language-lit/material3-expressive/dist/**/*.js',
  ],
}
```

**2. Styles** — import the token stylesheet once (e.g. in your global CSS):

```css
@import '@language-lit/material3-expressive/styles';
```

**3. Provider** — components that render links or images pull those primitives
from context, defaulting to native `<a>` / `<img>`. To plug in your framework's
optimized primitives (e.g. Next.js), wrap your app once:

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import NextLink from 'next/link'
import NextImage from 'next/image'

const LinkAdapter = ({ href, children, ...rest }) => (
  <NextLink href={href} {...rest}>{children}</NextLink>
)
const ImageAdapter = (props) => <NextImage {...props} />

export function Providers({ children }) {
  return (
    <Material3Provider Link={LinkAdapter} Image={ImageAdapter}>
      {children}
    </Material3Provider>
  )
}
```

Without a provider the components still work using native elements.

## Usage

```tsx
import { Button } from '@language-lit/material3-expressive/components/buttons'
import { Text } from '@language-lit/material3-expressive/components/display'
// or from the barrel:
import { Button, Text } from '@language-lit/material3-expressive'
```

### Controlled navigation

`NavigationBar`, `NavigationRail`, and `TabsContainer` are presentational and
controlled — they don't read a router. Supply the active location and a
navigation callback:

```tsx
<NavigationBar
  navigationItems={items}
  activeLink={pathname}
  onNavigate={(link) => router.push(link)}
  onPrefetch={(link) => router.prefetch(link)}
  fab={<FAB iconName="add" href="/new" />}
/>
```

## Build

```bash
npm run build      # tsup -> dist/ (ESM + d.ts), then copies styles
npm run typecheck
npm run test
```

## License

MIT
