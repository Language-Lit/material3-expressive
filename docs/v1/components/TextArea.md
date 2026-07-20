# TextArea

`TextArea` is a native `textarea` sharing every part of `TextField`'s field
chrome — label, indicator/outline, icon slots, supporting/error text — since
the pinned source itself has no distinct multiline composable: multiline is
`TextField`/`OutlinedTextField` with `singleLine=false`, reusing the exact
same decoration layer. `TextArea` mirrors that on the web instead of
duplicating a second component tree.

```tsx
import { TextArea } from '@language-lit/material3-expressive/v1'
import '@language-lit/material3-expressive/v1/styles.css'

<TextArea
  label="Feedback"
  rows={4}
  value={feedback}
  onChange={(event) => setFeedback(event.currentTarget.value)}
  supportingText="Tell us what worked and what didn't"
/>
```

## Contract

Identical to `TextField`'s contract (see `TextField.md`), substituting a
native `textarea` for the native `input`. There is no `type` prop — native
`textarea` has none — and every other native `textarea` attribute (`rows`,
`cols`, `wrap`, `maxLength`, …) forwards directly. Native vertical resize
(`resize: vertical`) is kept as a deliberate web affordance; auto-growing
height is out of scope.

## Multiline layout

An empty resting label starts at the ordinary 16px top padding instead of
centering across all rows. Leading/trailing icon slots remain vertically
centered across the container. Both choices follow the pinned measure
policy's explicit multiline-label branch and shared icon placement.

## Tokens and boundaries

`TextArea` consumes the exact same `--m3e-comp-text-field-*` registration as
`TextField` — there is no separate `text-area` token set, matching the
pinned source having no separate tokens for multiline.

Theme overrides remain scoped to `Material3Provider`; `TextArea` injects no
runtime styles. It imports no legacy source, Next.js, Vite, router, animation
library, or private downstream application code.
