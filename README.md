# @language-lit/material3-expressive

A framework-neutral React implementation of Material 3 Expressive. The v1
prerelease ships precompiled CSS, typed theme and token APIs, native web
semantics, and 32 conformant public components.

## v1 prerelease

Install the `next` candidate with React 18 or React 19:

```bash
npm install @language-lit/material3-expressive@next
```

Import components from the additive v1 entry and the complete stylesheet once:

```tsx
import {
  Button,
  Material3Provider,
} from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'

export function App() {
  return (
    <Material3Provider colorMode="system">
      <Button>Continue</Button>
    </Material3Provider>
  )
}
```

v1 does not require Tailwind, a content glob, a preset, runtime style injection,
or framework-specific adapters. `Material3Provider` defaults to the complete
theme and system color mode.

The package root and existing subpaths still expose the frozen legacy API during
the prerelease. Use `/v1` explicitly; stable-root cutover is a later, separately
approved release task.

## Documentation

- [v1 documentation](docs/v1/README.md)
- [Getting started](docs/v1/GETTING_STARTED.md)
- [Theming](docs/v1/THEMING.md)
- [SSR and system color mode](docs/v1/SSR.md)
- [Supported components](docs/v1/SUPPORTED_COMPONENTS.md)
- [Generic legacy-to-v1 migration](docs/v1/MIGRATION.md)
- [Web deviations](docs/v1/WEB_DEVIATIONS.md)
- [Prerelease notes and breaking changes](docs/v1/RELEASE_NOTES.md)

The supported-component matrix is generated from the machine-readable inventory.
Only entries marked `conformant` are part of the advertised v1 prerelease
surface.

## Legacy 0.3

Existing applications can remain on the legacy release and its current entry
points. The legacy Tailwind setup still uses the package preset and stylesheet:

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

```css
@import '@language-lit/material3-expressive/styles';
```

Legacy and v1 styles are independent. Do not replace legacy imports or styles
until deliberately migrating to the v1 contract.

## Development

```bash
npm install
npm run playground:v1
npm run check:v1:docs
npm run verify:v1
```

The v1 playground runs at `http://localhost:5173`. The aggregate verification
checks types, tests, package output, architecture, documentation, CSS, tokens,
legacy contracts, bundle budgets, and packed Vite/Next consumer fixtures.

## License

MIT
