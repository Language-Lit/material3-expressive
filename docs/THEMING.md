# Theming

Import the complete stylesheet once and render a provider around the scope that
should receive Material 3 tokens:

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'

export function App() {
  return <Material3Provider colorMode="system">...</Material3Provider>
}
```

The provider defaults to the complete immutable theme and system color mode. It
renders a `.m3e-theme` div; `className`, `style`, and other div attributes are
forwarded to that element.

## Create and extend themes

Theme utilities accept partial overrides, validate the resulting complete
theme, and return a new deeply frozen value:

```tsx
import { Material3Provider } from '@language-lit/material3-expressive'
import { createTheme } from '@language-lit/material3-expressive/theme'

const compactTheme = createTheme({
  density: { scale: -1 },
  reference: {
    typeface: {
      brand: ['Roboto Flex', 'sans-serif'],
    },
  },
})

export function App() {
  return <Material3Provider theme={compactTheme}>...</Material3Provider>
}
```

The `./theme` and `./tokens` subpaths contain no React runtime and are safe for
server data modules. The root entry is the convenient React client surface
because it also exports the provider and hooks.

Color schemes reference the theme's `reference.palette` paths. Override a
palette value when a role keeps the same tonal mapping, or override a role's
`$ref` when it should use a different palette tone. Invalid references and
contrast-breaking schemes are rejected.

## Nested scopes

Every provider starts from a complete default scope, then applies its theme's
differences. A nested provider is isolated from its parent:

```tsx
<Material3Provider theme={brandTheme}>
  <MainContent />
  <Material3Provider theme={editorTheme} colorMode="dark">
    <Editor />
  </Material3Provider>
</Material3Provider>
```

## Portaled overlays

`Menu`, `Select`'s popup listbox, `Tooltip`, and `Snackbar` render into
`document.body` so they escape ancestor `overflow` and stacking contexts. That
puts them outside the provider's element, where none of its scope would reach
them by inheritance, so each re-applies the enclosing scope to its own portal
root: the `.m3e-theme` class, the color-mode attribute, and the provider's
inline theme differences.

Nothing is required of a consumer. An overlay opened inside a nested provider
carries that nested scope, and one rendered with no provider above it emits no
scope at all — so an application that puts `.m3e-theme` and
`data-m3e-color-mode` on `<html>` itself keeps governing `document.body`.

```tsx
<Material3Provider theme={editorTheme} colorMode="dark">
  <Editor /> {/* a Menu opened here paints editorTheme's dark scheme */}
</Material3Provider>
```

## SSR and resolved mode

`systemModeFallback` controls the deterministic server and hydration snapshot
for `useResolvedColorMode`. Static CSS still selects the browser's visual system
scheme before hydration.

```tsx
const mode = useResolvedColorMode() // "light" or "dark"
const theme = useMaterial3Theme()
```

These hooks use separate contexts, so a component that only reads resolved mode
does not subscribe to the complete theme object.

For applications that inspect `data-m3e-resolved-color-mode` before hydration,
`preventColorSchemeFlash` emits an optional static initialization script. Pass
the request's CSP nonce through `nonce`. The script is absent by default and
never changes the document root.
