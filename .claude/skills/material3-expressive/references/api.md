# Component reference — `@language-lit/material3-expressive`

Accurate for **v1.2.0** (41 conformant components). Everything imports from the
package root:

```tsx
import { Button, Icon, Material3Provider } from '@language-lit/material3-expressive'
import '@language-lit/material3-expressive/styles.css'
```

Entry points, and there are only these four:

| Entry | Contents |
| --- | --- |
| `@language-lit/material3-expressive` | components, `Material3Provider`, `useMaterial3Theme`, `useResolvedColorMode` |
| `.../theme` | `createTheme`, `extendTheme`, `defaultTheme`, `parseTheme`, `validateTheme`, types — React-free, server-safe |
| `.../tokens` | `defaultTokenSet`, `generateTokenCss`, `tokenPathToCssVariable`, `resolveColorScheme`, `colorContrastRatio`, `validateColorContrasts`, `defineComponentTokens`, role-name constants — React-free |
| `.../styles.css` | all tokens + all component CSS, precompiled |

Conventions that hold across the whole surface:

- Named exports, exported props types (`ButtonProps`, `CardProps`, …).
- Unlisted props reach the underlying native element. `className`/`style` land on
  the **visual root**; for the native-input-backed controls (`Checkbox`, `Radio`,
  `Switch`, `Slider`, `TextField`, `TextArea`, `Select`, `SearchBar`) the ref and
  remaining attributes belong to the **input**.
- Controlled/uncontrolled pairs are `value`/`defaultValue` + `onValueChange`,
  `checked`/`defaultChecked` + `onCheckedChange`, `selected`/`defaultSelected` +
  `onSelectedChange`, `open`/`defaultOpen` + `onOpenChange`. Controlled variants
  make the change handler **required** at the type level.
- Prop unions are discriminated and reject invalid combinations at compile time.
  A type error here is usually the spec telling you the combination does not
  exist upstream.
- Icon slots (`leadingIcon`, `trailingIcon`, `icon`) are decorative and hidden
  from assistive technology.
- No component injects a style element, needs Tailwind, or depends on a router.

---

## Foundation

### `Material3Provider`

Owns one theme scope: renders a `div.m3e-theme` carrying
`data-m3e-color-mode` / `data-m3e-resolved-color-mode` plus the theme's inline
custom properties.

| Prop | Default | Notes |
| --- | --- | --- |
| `theme` | complete default theme | from `createTheme`/`extendTheme`; serializable across a server boundary |
| `colorMode` | `'system'` | `'light' \| 'dark' \| 'system'` |
| `systemModeFallback` | `'light'` | deterministic SSR/first-hydration snapshot for `useResolvedColorMode` |
| `preventColorSchemeFlash` | `false` | emits a scoped init script; only needed if app code reads `data-m3e-resolved-color-mode` pre-hydration. Pass `nonce` under CSP. |

Nesting is supported and isolated — a nested provider starts from a complete
default scope and applies its own differences. Portaled overlays (`Menu`,
`Select` popup, `Tooltip`, `Snackbar`) re-apply the enclosing scope to their
portal root automatically.

**Gotcha:** the scope is the provider's `div`. `html`/`body` are outside it and
resolve `--m3e-sys-color-*` from `:root`, which is **always light**. See
`tokens.md` § "The dark-mode scope trap".

Hooks: `useMaterial3Theme()` → the theme object; `useResolvedColorMode()` →
`'light' | 'dark'`. Separate contexts, so reading the mode does not subscribe to
the whole theme.

### `Surface`

The tone-and-shape container. Use it for every app-owned region that needs a
Material background.

```tsx
<Surface as="main" color="surface-container-low" shape="large" shadowElevation={1}>
```

| Prop | Default | Values |
| --- | --- | --- |
| `as` | `'div'` | `div section article aside main header footer nav` |
| `color` | `'surface'` | 23 kebab-case container roles: `surface`, `surface-dim`, `surface-bright`, `surface-container-lowest/-low/-/-high/-highest`, `primary`, `primary-container`, `primary-fixed`, `primary-fixed-dim`, `secondary…`, `tertiary…`, `error`, `error-container`, `inverse-surface`. The paired `on-*` content color is applied too. |
| `shape` | `'none'` | 15 corner roles, kebab-case: `extra-small`, `extra-small-top`, `small`, `medium`, `large`, `large-start`, `large-end`, `large-top`, `large-increased`, `extra-large`, `extra-large-top`, `extra-large-increased`, `extra-extra-large`, `full` |
| `tonalElevation` | `0` | `0–5`, **only applies when `color="surface"`** |
| `shadowElevation` | `0` | `0–5`; visual shadow only, no stacking change |

Passive only — no interaction props. For an interactive container use
`Card interactive`, `Button`, or `ListItem interaction="action"`.

**Note the case split:** `Surface` props are kebab-case strings; theme color role
names in `createTheme` are camelCase (`surfaceContainerLow`).

### `Text`

Applies a type-scale role. **It never decides the element.**

```tsx
<Text as="h1" variant="displaySmall" emphasis="emphasized">Library</Text>
<Text as="p" variant="bodyLarge">…</Text>
```

| Prop | Default | Values |
| --- | --- | --- |
| `as` | `'span'` | `span p div h1–h6 label legend strong em small blockquote figcaption` |
| `variant` | `'bodyLarge'` | the 15 roles: `display/headline/title/body/label` × `Large/Medium/Small` |
| `emphasis` | `'baseline'` | `'baseline' \| 'emphasized'` |

Choose `as` from document structure, `variant` from visual hierarchy, and make
them agree. Never pick `as="h3"` because the size looked right, and never build a
heading out of a styled `span`.

### `Icon`

Two sources, one contract.

```tsx
<Icon source="add" />                                   {/* Material Symbols ligature */}
<Icon source={ArrowSvg} size={20} />                    {/* consumer SVG component */}
<Icon source="warning" decorative={false} label="Warning" />
```

- `decorative` defaults to `true` (hidden from AT). `decorative={false}` **requires**
  `label` and exposes one named image role.
- Symbols axes: `symbolStyle` (`outlined`/`rounded`/`sharp`), `fill` 0–1,
  `weight` 100–700, `grade` -50–200, `opticalSize` 20–48, `roundness` (`ROND`)
  0–100. Axes only work when the app actually loads a variable Symbols font.
- `size` default 24. `mirrored` flips directional artwork in RTL only.
- The library bundles **no** icon font or SVG set. Serving Material Symbols (or
  any SVG set) is the app's job — self-host it; do not rely on a CDN for a
  glyph the UI depends on.

---

## Actions

### `Button`

Native `<button>`, `type="button"` by default.

| Prop | Default | Values |
| --- | --- | --- |
| `variant` | `'filled'` | `filled` (primary/on-primary), `tonal` (secondary-container), `elevated` (surface-container-low, level 1), `outlined`, `text` |
| `size` | `'small'` | `extra-small` 32px, `small` 40px, `medium` 56px, `large` 96px, `extra-large` 136px visual min-block-size |
| `shape` | `'round'` | `round` \| `square`; both morph to the tier's pressed corner |
| `width` | `'fit'` | `fit` \| `full` |
| `leadingIcon` / `trailingIcon` | — | decorative slots in logical order |

Emphasis ladder on one screen: exactly one `filled`, then `tonal`/`elevated` for
secondary, `outlined` for tertiary, `text` for low-stakes and dialog dismissal.
`large`/`extra-large` are display actions for a single hero moment — never a
density knob. Every tier keeps a ≥48×48px interaction target regardless of visual
size.

`Button` is **not** a link. For navigation use a real anchor (styled with tokens),
`Tabs`/navigation `href`, or a router link.

### `IconButton`

| Prop | Default | Values |
| --- | --- | --- |
| `variant` | `'standard'` | `standard`, `filled`, `tonal`, `outlined` |
| `size` | `'small'` | `extra-small … extra-large` |
| `width` | `'uniform'` | `narrow`, `uniform`, `wide` |
| `shape` | `'round'` | `round`, `square` |
| `toggle` | `false` | `toggle` + `selected`/`defaultSelected` + `onSelectedChange`, optional `selectedIcon` |

`children` is the decorative visual, so **`aria-label` is mandatory**. Toggle mode
manages `aria-pressed` itself — do not add it.

```tsx
<IconButton
  toggle
  selected={saved}
  onSelectedChange={setSaved}
  aria-label="Save article"
  selectedIcon={<Icon source="bookmark" fill={1} />}
>
  <Icon source="bookmark" />
</IconButton>
```

### `FloatingActionButton`

One per screen, for the screen's single most common action.

- `icon` required, `aria-label` required.
- `size`: `standard` | `medium` | `large`.
- `elevation`: `default` | `lowered` | `none`.
- Extended: pass `label` (+ optional `expanded` to collapse the label while
  keeping the accessible name).
- Toggle: `toggle` + `selected`/`onSelectedChange` (+ `selectedIcon`); mutually
  exclusive with `label`/`expanded`/`elevation`.

Do not pair an extended FAB with a bottom bar without collapsing it on scroll,
and keep 16px clearance from any bottom navigation or toolbar.

### `ButtonGroup`

Wraps a row of `Button`/`IconButton` children; pressing one grows it and
compresses its neighbours. This is a *visual grouping of independent actions* —
for a single-choice or multi-choice control use `SegmentedButtonGroup`.

### `SplitButton`

One primary action plus an attached secondary trigger.

```tsx
<SplitButton
  variant="tonal"
  onClick={send}
  trailingIcon={<Icon source="arrow_drop_down" />}
  trailingLabel="Send options"
  selected={menuOpen}
  onSelectedChange={setMenuOpen}
>
  Send
</SplitButton>
```

`trailingIcon` and `trailingLabel` are required; wiring the trailing button to an
actual `Menu` is the app's job.

---

## Containment

### `Card`

| Prop | Default | Notes |
| --- | --- | --- |
| `variant` | `'filled'` | `filled`, `elevated`, `outlined` |
| `as` | `'article'` | `article`, `div`, `section`, `aside` — required for anything but `article` |
| `interactive` | `false` | `true` renders a whole-card native `<button>` |

Card imposes no padding or content slots — the app owns the interior.

**The rule that trips people:** an `interactive` card is a button, so its
descendants must be non-interactive. A card containing links, buttons, inputs, or
menus must stay passive; put the interactive affordances inside it, and if the
whole surface should be clickable use a passive card with one primary link inside.

### `ListItem` / `SegmentedListItem`

Anatomy: `headline` (required), `overline`, `supportingText`, `leadingContent`,
`trailingContent`, `disabled`, `draggable` + `onDragStart`/`onDragEnd`.

`interaction` picks the native semantics:

| `interaction` | Renders | Extra props |
| --- | --- | --- |
| `'none'` (default) | `div` or `li` (`as`) | — |
| `'action'` | native `<button>` row | `onClick` |
| `'single'` | native radio | `name`, `value` (required), `selected`/`onSelectedChange` |
| `'multiple'` | native checkbox | `checked`/`onCheckedChange` |

`SegmentedListItem` adds `index` + `count` to derive first/middle/last corners for
a grouped, rounded list.

Inside a `<ul>`/`<ol>`, pass `as="li"` for passive rows; the interactive modes
render their own control element, so wrap those in your own `li` if you need list
semantics.

### `Divider`

`as`: `hr` (default) | `div` | `li`. `orientation`: `horizontal` | `vertical`.
`decorative` defaults to `false`, i.e. it is exposed as a separator; pass
`decorative` for purely visual rules. Prefer whitespace over dividers; a divider
should mean "these are different groups", not "here is a line".

### `Carousel`

One export, six layouts, ported keyline/aspect engines.

| `layout` | Required sizing prop | Default scroll |
| --- | --- | --- |
| `multiBrowse` (default) | `preferredItemWidth` | `snap` |
| `uncontained` | `itemWidth` | `free` |
| `multiAspect` | none — each item carries `aspectRatio` (9:16 … 16:9) | `free` |
| `hero` / `centeredHero` | optional `maxItemWidth` | `snap` |
| `fullScreen` | none; one edge-to-edge item, vertical, portrait only | `snap` |

Items: `{ key, content, label?, onActivate?, href?, disabled?, aspectRatio? }`.
`label` is composed with position ("Sunrise, 3 of 8"). Give items `onActivate` or
`href` to make them real controls — otherwise they are not keyboard reachable.
Optional: `itemSpacing`, `currentItem`/`defaultCurrentItem`/`onCurrentItemChange`,
`minSmallItemWidth` (40) / `maxSmallItemWidth` (56).

A carousel hides content behind a gesture. Pair it with a "Show all" destination
whenever the items matter.

---

## Selection and input

None of these render a visible label. Associate one yourself — a native
`<label htmlFor>` (preferred) or `aria-label`.

### `Checkbox`

```tsx
<label htmlFor="terms">I agree</label>
<Checkbox id="terms" checked={ok} onCheckedChange={setOk} />
```

`indeterminate` renders the dash and `aria-checked="mixed"`; the app clears it
from its own change handler (activation resolves the native checked value).

### `Radio`

`name` is **required** — a nameless radio cannot form a group. Native grouping and
roving arrow-key focus come from the browser.

### `Switch`

`input type="checkbox" role="switch"`. Optional `thumbIcon` (16px, decorative);
its presence keeps the thumb at selected size in both states. Use a switch for an
immediately-applied setting, a checkbox for a value submitted with a form.

### `Slider` / `RangeSlider`

`min` 0, `max` 1, `steps` 0 (continuous) by default. `orientation`,
`topToBottom`, `centered`, `showStopIndicator`, `onValueChangeFinished`, and
passive render slots (`thumb`, `trackContent`, `renderTick`,
`renderStopIndicator`). `RangeSlider` **requires** `startAriaLabel` and
`endAriaLabel`; it exposes `startInputRef`/`endInputRef`.

Always show the current value in text next to the slider, and offer a
non-dragging way to set it (WCAG 2.2 SC 2.5.7) — arrow keys satisfy this for
keyboard, but a numeric field is often the right companion.

### `SegmentedButtonGroup`

Data-driven only — no children composition.

```tsx
<SegmentedButtonGroup
  segments={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }]}
  value={range}
  onValueChange={setRange}
/>
```

Default is single-choice (native radios). `multiple` renders independent
checkboxes and switches `value`/`onValueChange` to `readonly string[]`. Segments
carry `value`, `label`, optional `icon` (shown only while unselected — it
crossfades with the built-in checkmark) and `disabled`. Keep it to a small number
of short, mutually comparable options; anything longer belongs in a `Select`.

### `Chip`

`kind` is required and picks the semantics:

| `kind` | Semantics | Extras |
| --- | --- | --- |
| `assist` | momentary action | `trailingIcon` |
| `suggestion` | momentary action | — |
| `filter` | selectable | `selected`/`onSelectedChange`, `trailingIcon`, `shape` |
| `input` | selectable, flat only | `avatar` (24px, replaces `leadingIcon`), `trailingIcon`, `shape` |

`variant`: `flat` (default) | `elevated` (not for `input`). `shape`:
`standard` | `expressive` (the sourced selected/pressed morph) on filter/input.
Chips are not buttons and not tabs: filter chips refine a result set, assist and
suggestion chips offer a contextual action.

### `TextField` / `TextArea`

`label` is **required** and renders a real `<label htmlFor>`.

- `variant`: `filled` (default) | `outlined`. Pick one per app, not per field.
- `TextField.type`: `text` (default) `email password search tel url number`.
  Types with browser chrome that fights the Material decoration (`date`, `file`,
  `color`, `range`, checkbox/radio) are excluded by design — see
  `recipes.md` for the date/time input pattern.
- `supportingText` renders below and is wired via `aria-describedby`.
- `error` recolors label/indicator/supporting text and sets `aria-invalid`. It
  does **not** write the message — supply `supportingText` with the reason.
- Value state is native: use `value`+`onChange` or `defaultValue`.
- `TextArea` height follows native `rows` and the resize handle; no autogrow.

### `Select`

Not a native `<select>`: a read-only combobox input plus a portaled listbox.

```tsx
<Select
  label="Country"
  options={[{ value: 'br', label: 'Brazil' }]}
  value={country}
  onValueChange={setCountry}
  supportingText="Used for billing"
/>
```

`options[].label` must be plain text (it becomes the trigger's displayed value).
`variant`: `filled` | `outlined`. Supplying `name` renders a hidden input for real
form submission. `open`/`defaultOpen`/`onOpenChange` expose the listbox state.
For free-text-plus-suggestions, this is the wrong component — see
`recipes.md` § Autocomplete.

### `SearchBar` / `SearchAppBar`

`SearchBar` owns query + expanded state and renders results in `children`.

- `query`/`defaultQuery`/`onQueryChange`, `expanded`/`defaultExpanded`/
  `onExpandedChange`, `onSearch` (Enter).
- `placeholder` doubles as the accessible name unless `aria-label` overrides it.
- `appearance`: `contained` (default, the Expressive recommendation) | `divided`.
- `layout`: `adaptive` (default — full-screen under 600px, docked above) |
  `docked` | `fullScreen`.
- `leadingIcon`, `trailingIcon` (at most two trailing affordances), `avatar`.
- The results container is **empty until you fill it**. Render suggestions,
  recent searches, and results yourself; an expanded-but-empty search surface is
  a defect.

`SearchAppBar` is the app-bar variant for when search is the global function:
`navigationIcon`, `actions`, `scrollBehavior` (`none`/`pinned`/`enterAlways`),
`scrollContainer`, and a `SearchBar` as its child. Use it *instead of* `AppBar`,
not stacked with it.

---

## Navigation

### `AppBar`

```tsx
<AppBar
  size="large"
  flexible
  title="Inbox"
  subtitle="12 unread"
  navigationIcon={<IconButton aria-label="Open menu"><Icon source="menu" /></IconButton>}
  actions={<IconButton aria-label="Search"><Icon source="search" /></IconButton>}
  scrollBehavior="exitUntilCollapsed"
  scrollContainer={scrollRef}
/>
```

- `size`: `small` (default) | `medium` | `large`. Centre alignment is not a size —
  it is `titleAlignment="center"` on a small bar.
- `flexible` (medium/large only) unlocks `subtitle` + `titleAlignment` and is the
  current design recommendation over the baseline two-row bars.
- `scrollBehavior`: `none` (default) | `pinned` | `enterAlways` |
  `exitUntilCollapsed` (needs two rows, so not on `small`).
- `scrollContainer` defaults to the window — pass a ref when an inner element
  scrolls. Getting this wrong is why "the bar doesn't collapse".
- `title` is a **slot, not a heading**. The page still owns its `<h1>`; if the bar
  text is the page title, render the heading via `<Text as="h1">` inside the slot.

Invalid combinations are compile errors, by design.

### `NavigationBar` / `NavigationRail` / `NavigationDrawer` / `NavigationSuite`

All four share one item shape:

```ts
{ value, label, icon, selectedIcon?, disabled?, href?, badge? }
```

- Real `<nav>` + `aria-current`; not a tablist. No arrow-key roving — these are
  persistent app navigation, and `href` items are real links.
- `NavigationBar`: bottom bar, compact windows, 3–5 destinations.
- `NavigationRail`: medium and up; `header` slot for a FAB or menu button.
- `NavigationDrawer`: `variant` `modal` (default, native `<dialog>` + scrim) |
  `dismissible` (in-flow, collapses) | `permanent` (always visible;
  `open`/`onOpenChange` ignored). Drawer badges are a plain trailing count, not
  the error pill.
- `NavigationSuite`: composes the other three and switches automatically —
  bar `<600px`, rail `600–839px`, permanent drawer `≥840px`. SSR renders the
  compact markup, so keep hydration in mind for above-the-fold layout.

Never render two navigation hosts at once. `NavigationSuite` is the default
answer for an app shell; reach for the individual components only when you need a
layout it does not produce.

### `Tabs`

In-page content switching within one destination — never app-level navigation.

```tsx
<Tabs
  variant="primary"
  items={[{ value: 'all', label: 'All', panel: <AllList /> }]}
  value={tab}
  onValueChange={setTab}
/>
```

- `variant`: `primary` (default, content-hugging indicator) | `secondary`
  (full-width underline).
- `scrollable` for a horizontally scrolling row.
- Items: `value`, `label`, `icon`, `badge`, `disabled`, `href`, `panel`. Omit
  `panel` everywhere for router-driven link tabs — then no tabpanel is rendered
  and arrow keys move focus without navigating.

### `FloatingToolbar` / `FabMenu`

- `FloatingToolbar`: `orientation` (`horizontal` default), `variant`
  (`standard` | `vibrant`), `expanded`/`defaultExpanded` (`true`) +
  `onExpandedChange`. Children are typically `IconButton`s with roving focus.
  Wire your own scroll listener to collapse it. This is the modern replacement
  for a bottom app bar full of actions.
- `FabMenu` + `FabMenuItem`: `triggerLabel`, `icon`, `closeIcon`, and
  `expanded`/`onExpandedChange`. Use it when a screen has 3–6 related creation
  actions instead of stacking mini-FABs.

---

## Overlays

### `Dialog`

Native `<dialog>`: the top layer, focus trapping, inertness, and focus
restoration are the browser's.

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  role="alertdialog"
  icon={<Icon source="delete" />}
  title="Delete project?"
  actions={<>
    <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
    <Button variant="filled" onClick={confirmDelete}>Delete</Button>
  </>}
>
  This cannot be undone.
</Dialog>
```

`title` sets `aria-labelledby`, `children` sets `aria-describedby` (unless you
override). `modal` defaults to `true`; `dismissOnEscape`/`dismissOnOutsideClick`
default true and are modal-only. `onOpenChange` fires only for self-closing —
Escape, outside click, `<form method="dialog">` — not for your own `open` writes.
Destructive confirmations use `role="alertdialog"` and put the destructive verb on
the confirm button ("Delete", not "OK").

### `BottomSheet`

`variant`: `modal` (default, scrim, blocks background) | `standard` (docked
inline, background live). State machine: `hidden` | `partiallyExpanded` |
`expanded` via `value`/`defaultValue`/`onValueChange`, with
`confirmValueChange` to veto. `peekHeight` is **standard-only**. `dragHandle` and
`gesturesEnabled` default true; `dismissOnEscape`/`dismissOnScrimClick` are
modal-only. Give the sheet an `aria-label`.

On expanded windows a bottom sheet is usually the wrong shape — promote the
content to a supporting pane or a side sheet (`recipes.md`).

### `Menu`

Portaled, roving focus, APG menu-button pattern. The app renders and owns the
trigger:

```tsx
const triggerRef = useRef<HTMLButtonElement>(null)
<IconButton ref={triggerRef} aria-label="More" aria-haspopup="menu" aria-expanded={open}
  onClick={() => setOpen(o => !o)}><Icon source="more_vert" /></IconButton>
<Menu anchorRef={triggerRef} open={open} onOpenChange={setOpen} items={items} />
```

Items: `{ value, label, onSelect?, leadingIcon?, trailingIcon?, disabled?,
checked?, onCheckedChange? }`. Defining `checked` (even `false`) makes it a
`menuitemcheckbox` that keeps the menu open. Typeahead only matches string
labels. **You must wire the trigger's `aria-haspopup`/`aria-expanded`/click** —
`Menu` does not.

### `Tooltip`

Unlike `Menu`, `Tooltip` wires its own hover/focus/Escape from `anchorRef`.
`variant` `plain` | `rich` (+ `subhead`), `placement` `top`(default)`/bottom/
start/end`. Content must be non-interactive — `role="tooltip"` forbids focusable
descendants, so there is no rich-tooltip action button. A tooltip is never the
only place information appears, and never a substitute for a label.

---

## Feedback

### `Snackbar`

One controlled snackbar with a pausable timer.

```tsx
<Snackbar
  open={open}
  onOpenChange={setOpen}
  message="Draft saved"
  action={{ label: 'Undo', onClick: undo }}
  duration="short"
/>
```

`duration`: `'short'` (4000) | `'long'` (10000) | `'indefinite'` | ms. Default
matches the source: `short` with no action, `indefinite` with one. The countdown
pauses on hover/focus. `dismissible` adds a close button (`dismissLabel`,
default `'Dismiss'`).

There is **no queue host** — one snackbar, one message. Queue policy is app-owned;
see `recipes.md` § Snackbar host.

### `Badge` / `BadgeAnchor`

```tsx
<BadgeAnchor badge={<Badge label="3 unread messages">3</Badge>}>
  <Icon source="mail" />
</BadgeAnchor>
```

Childless `Badge` = small dot; any content = large pill capped at 4 characters
including `+`. Without `label` the badge exposes no role at all (matching
Material), so **always pass `label` when the count carries meaning** — it names
the badge and prunes the duplicate glyph reading. `BadgeAnchor` measures only its
children, so adding a badge never shifts layout.

### `LinearProgress` / `CircularProgress` / `WavyProgress` / `LoadingIndicator`

All four take `value` + `max` (default 1) and go indeterminate when `value` is
omitted, exactly like native `<progress>`. `WavyProgress` adds
`shape: 'linear' | 'circular'`.

Choosing:

- **Determinate and measurable** (upload, import): `LinearProgress` inline with
  the thing, or `WavyProgress` when you want the Expressive treatment.
- **Indeterminate, blocking a region**: `CircularProgress`.
- **Short waits and pull-to-refresh**: `LoadingIndicator` (the M3E
  shape-morphing indicator).
- Skeletons beat spinners for content-shaped waits — but never both at once.

Each needs an accessible name (`aria-label`) and, for async regions, a live-region
announcement policy. Under `prefers-reduced-motion` the infinite decorative
motion stops while state stays visible.

---

## What the library does not ship

Do not hand-roll these as new primitives without saying so; use the recipes.

| Missing | Status | What to do |
| --- | --- | --- |
| Date pickers | planned (roadmap tranche C) | native `<input type="date">` styled with tokens, or `TextField` + validation; `recipes.md` |
| Time pickers | planned | same pattern with `type="time"` |
| Side sheets | planned; no upstream implementation exists | `Surface` + `<dialog>` recipe, or a supporting pane |
| Bottom app bar / docked toolbar | partial (`FloatingToolbar` only) | `FloatingToolbar`, or `Surface as="footer"` + `IconButton`s |
| Expanded navigation rail | not shipped | `NavigationSuite` gives permanent drawer at ≥840px; use it |
| App bar overflow rows (`AppBarRow`/`AppBarColumn`) | partial | `actions` + a `Menu` overflow button |
| List expansion / grouping / headers | partial | compose `ListItem` + `Divider` + `Text` |
| Scaffold / app shell | intentionally not a component | `recipes.md` § App shell |
| Snackbar queue host | intentionally app-owned | `recipes.md` § Snackbar host |
| Autocomplete / combobox with free text | not shipped | `recipes.md` § Autocomplete |
| Data table, pagination, tree, breadcrumb | not in the Material catalog | app-owned; build from `Surface`/`Text`/`ListItem` + tokens |
| Rich tooltip with an action | web-impossible under `role="tooltip"` | use a `Menu`, `Dialog`, or inline disclosure |
