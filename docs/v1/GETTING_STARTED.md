# Getting started with v1

## Install

Install the prerelease package and React peers:

```bash
npm install @language-lit/material3-expressive@next react react-dom
```

Tailwind is not required for v1. The package still exposes its legacy Tailwind
preset for legacy entry points, but that peer is optional for a v1-only
application.

## Import the complete stylesheet

Import the complete v1 stylesheet once from an application-level entry:

```tsx
import '@language-lit/material3-expressive/v1/styles.css'
```

The stylesheet includes the default reference, system, and component tokens plus
every conformant component style. Do not import the legacy `./styles` entry into
a v1-only application, and do not add the package to a Tailwind content glob.

## Render a provider

`Material3Provider` owns one theme scope. With no props it supplies the complete
default theme and follows the operating-system color preference:

```tsx
import {
  Button,
  Material3Provider,
  Text,
} from '@language-lit/material3-expressive/v1'

export function App() {
  return (
    <Material3Provider>
      <main>
        <Text as="h1" variant="headlineLarge">
          Welcome
        </Text>
        <Button variant="filled">Get started</Button>
      </main>
    </Material3Provider>
  )
}
```

The provider renders a `.m3e-theme` `div` and forwards ordinary div attributes,
`className`, and `style`. Native document structure remains application-owned.

## Use custom or nested themes

Create theme data through the server-safe theme entry, then pass the validated,
immutable result to a provider:

```tsx
import { Material3Provider } from '@language-lit/material3-expressive/v1'
import { createTheme } from '@language-lit/material3-expressive/v1/theme'

const brandTheme = createTheme({
  reference: {
    typeface: {
      brand: ['Roboto Flex', 'sans-serif'],
    },
  },
})

export function BrandedArea({ children }) {
  return (
    <Material3Provider theme={brandTheme} colorMode="system">
      {children}
    </Material3Provider>
  )
}
```

See [THEMING.md](THEMING.md) for extension, palette references, nested scopes,
and resolved-mode hooks.

## Choose a component

The [supported-component matrix](SUPPORTED_COMPONENTS.md) is generated from the
public inventory. Every linked page documents its anatomy, variants and states,
accessibility behavior, tokens, and an example.

Use native labels and accessible names exactly as each page describes. Icon-only
controls, progress indicators, navigation regions, dialogs, and transient
feedback require application-supplied labels or relationships where noted.

## Server rendering

The main `/v1` entry contains client-capable React APIs. Theme and token data can
be created in server modules through `/v1/theme` and `/v1/tokens`. Follow
[SSR.md](SSR.md) for deterministic system-mode hydration and framework examples.
