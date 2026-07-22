# ADR 0029: Portal roots reconstitute the enclosing theme scope

Status: accepted
Date: 2026-07-22
Task: T36

## Context

ADR 0003 §2 makes `Material3Provider` render one `.m3e-theme` element and keys
the generated stylesheet on it. `generateTokenCss` emits four color rules for
that element — `[data-m3e-color-mode="light"], [data-m3e-color-mode="system"]`,
`[data-m3e-color-mode="dark"]`, `.m3e-theme[data-m3e-color-mode="system"]`, and
the `prefers-color-scheme: dark` pair — while `:root` carries the light scheme
unconditionally, as the no-JavaScript visual contract. A custom theme adds a
fifth ingredient: its differences from the default, written inline on that same
element.

Every one of those five reaches a component by *inheritance*. Four components
break that chain. `Menu`, `Select`'s popup listbox, `Tooltip`, and `Snackbar`
render through `ReactDOM.createPortal` into `document.body` (ADR 0017 §, ADR
0018) because an overlay must escape ancestor `overflow` and stacking contexts.
`document.body` is a sibling of the provider's element, not a descendant, so a
portaled overlay inherits none of it and resolves every `--m3e-sys-color-*`
against `:root` — permanently light, whatever the provider says.

A browser probe against the playground measured it directly: with the provider
scope resolved dark, `--m3e-sys-color-surface-container` read `#211f26` on the
provider element and `#f3edf7` on the portaled menu in the same document, which
painted `rgb(243, 237, 247)`. The defect predates `1.0.0`; every published
version has it.

It is not only a color-mode defect. The inline custom-property block carries
density, typography, shape, motion, and component-token overrides too, so under
a custom theme a portaled overlay silently rendered the *default* theme in every
domain — `Menu.theme.test.tsx` asserted a `container-max-width` override on the
provider element and never on the menu that was supposed to obey it.

`Tooltip` and `Snackbar` hid the symptom rather than escaping it. Both paint
`inverseSurface`, which is `neutral-20` in light and `neutral-90` in dark, so a
light-looking tooltip on a dark page is correct. What they actually rendered was
the *light* scheme's inverse — a dark tooltip on a dark page — the right role
resolved against the wrong scheme.

## Decision

1. A portal root re-applies its enclosing scope. `Material3Provider` publishes
   `{ className, colorMode, style }` — the same class, color-mode attribute, and
   inline differences it puts on its own element — through a
   `ThemeScopeContext`, and `usePortalThemeScope` reads it. The four portaled
   overlays spread that triple onto the element they portal into
   `document.body`. This adds no second theming mechanism: the values, the
   selectors, and the alias indirection are ADR 0003's, evaluated at a second
   place in the tree.
2. The scope travels through React context, not the DOM. The nearest provider
   wins, so an overlay opened inside a nested scope carries that nested scope
   out to the body, matching ADR 0003 §2's isolation guarantee for the
   non-portaled case.
3. The raw `colorMode` travels, not the resolved mode. Passing `"system"`
   through unchanged keeps the static `prefers-color-scheme` rules — not React
   state — selecting the overlay's scheme, which is what ADR 0003 §3 requires
   of a scope that must paint correctly before hydration.
4. Only the provider's *theme* style travels. The consumer's own `className` and
   `style` on the provider stay behind: a portaled overlay reproduces the token
   scope, not the wrapper's layout or appearance.
5. With no provider above it, an overlay emits neither the class nor the
   attribute. An application is free to put `.m3e-theme` and
   `data-m3e-color-mode` on `<html>` itself, in which case `document.body`
   already inherits the right scope; emitting a mode there would override a
   preference the library was never told about.
6. The scope lands on the overlay's own root rather than a wrapper element. No
   node is added to `document.body`, and `color-scheme` — which `styles.css`
   keys on the same attribute — lands on the element that actually scrolls, so
   a scrollable `Menu` gets correctly themed native scrollbars.

## Consequences

- Portaled overlays honor color mode, custom themes, and nested scopes. The
  four components' theme tests assert the scope on the portal root; six of them
  fail against the unrepaired components.
- `ThemeScopeContext` and `usePortalThemeScope` are internal. They are not
  exported from `./` or `./theme`, so the public surface is unchanged and this
  is a patch, not a minor.
- Every future portaled component must call `usePortalThemeScope`. This is the
  cost of body-level portals; the alternative — portaling into the provider
  element to inherit for free — was rejected because it re-exposes overlays to
  ancestor `overflow` and `transform`, the containment the portal exists to
  escape.
- A provider's inline custom properties are now written in two places when an
  overlay is open. The block is differences-only (ADR 0003 §3), so a default
  theme writes nothing and a typical custom theme writes a few dozen bytes.
