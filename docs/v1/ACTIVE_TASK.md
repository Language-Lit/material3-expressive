# Active v1 task

## T17 — Menu and Select

Status: complete
Approved: 2026-07-20
Completed: 2026-07-20

### Scope

Two public components, both anchored popups with no native top-layer
equivalent available across this library's browser floor (the Popover API
reaches Firefox only at 125, after the pinned 121 floor; CSS anchor
positioning is further out still) — the first v1 components requiring a
portal (`ReactDOM.createPortal` to `document.body`) and manual outside-click/
Escape/focus-restoration, since neither gets Dialog's free native `<dialog>`
backdrop, focus trap, or closing steps.

- **Shared internal overlay primitives** (`src/v1/internal/`, not exported):
  `overlayPosition.ts` is a pure, unit-testable function reproducing the
  pinned `DropdownMenuPositionProvider`'s behavior — try anchor-start then
  anchor-end then clamp to the viewport horizontally, try below-anchor then
  above-anchor then clamp vertically — using the sourced `MenuHorizontalMargin`
  (8dp) as the viewport clamp margin on both axes. Android's separate 48dp
  `MenuVerticalMargin` exists to clear the status/nav bar, which has no web
  equivalent, so it is not ported as a second number; reusing the one
  cross-axis value that is genuinely sourced avoids inventing a web-specific
  constant. `useAnchoredOverlay.ts` is a hook shared by `Menu` and `Select`
  that owns: portal mounting gated on a post-mount effect (so SSR and the
  first client render before hydration emit nothing, the same "renders
  nothing/closed until a client effect acts" precedent Dialog established,
  extended here to "does not exist in the tree" since a portal has no server
  container to render into at all); live repositioning on scroll/resize/anchor
  or popover size change; a document-level `pointerdown` listener that closes
  on a click outside both the anchor and the popover; a document-level
  `keydown` listener that closes on Escape; and focus restoration to the
  anchor element on close. Neither component traps focus or makes the rest of
  the page inert — the APG Menu Button pattern explicitly does not trap focus
  in a menu (Tab moves on and closes it), and the select-only combobox
  pattern keeps focus on the trigger throughout, so no prior component's
  inert-background precedent applies here.
- Both popups animate open/close with a fade + scale using the sourced
  `FastSpatial`/`FastEffects` motion slots (already-registered
  `--m3e-sys-motion-expressive-fast-spatial-*`/`-fast-effects-*` tokens, no
  new motion tokens needed) and the sourced `0.8`→`1` scale target. Unlike
  Dialog, this is a plain CSS transition on a conditionally-mounted portaled
  `div`, not `@starting-style`/`allow-discrete` on a persistent top-layer
  element — there is no native top layer here to transition across, so this
  motion needs no floor exception. Exit motion is real (matching the pinned
  source's own enter/exit `AnimatedVisibility`): closing flips the popover
  back to its entering visual state and defers actual unmount until
  `transitionend` (with a reduced-motion/no-transition immediate-unmount
  fallback), rather than the source's `MutableTransitionState`-driven
  current/target-state bookkeeping.

#### `Menu`

- One data-driven `items: readonly MenuItem[]` prop replaces the pinned
  source's children-composable API, extending the T15 SegmentedButtonGroup
  precedent of a data array over `Children`-walking where the source itself
  is a plain list — and matches the component inventory's already-named
  `Menu`/`MenuProps` pair with one added `MenuItem` data type, the same shape
  T15 added `SegmentedButtonGroupSegment`. Each `MenuItem` is
  `{ value, label, onSelect?, leadingIcon?, trailingIcon?, disabled?, checked?, onCheckedChange? }`.
  Omitting `checked` renders `role="menuitem"` (the plain `DropdownMenuItem`
  overload); supplying it renders `role="menuitemcheckbox"` with
  `aria-checked` (the checked `DropdownMenuItem` overload) and does not close
  the menu on activation, matching the APG menu-button pattern's own
  checkbox-group example of letting a user toggle several items in one
  visit. The separate radio-role (`selected`) overload is folded into the
  same `checked` mechanism — `Select` already owns the real single-choice-
  from-a-list use case — a documented flattening in the same spirit as T15/
  T16's Compose-composition flattenings.
- `open`/`defaultOpen`/`onOpenChange` follow the library's universal
  `useControllableState` shape. `anchorRef: RefObject<HTMLElement | null>`
  points at a consumer-owned trigger; `Menu` renders no trigger of its own,
  matching Dialog's trigger-agnostic precedent. The consumer's trigger is
  documented to carry its own `aria-haspopup="menu"`/`aria-expanded`/click
  handling, the same "consumer wires the opener" contract Dialog already
  established for its own open state.
- Keyboard, matching the APG Menu Button pattern: opening moves real DOM
  focus to the first enabled item (roving `tabindex`, not
  `aria-activedescendant` — items are genuinely focusable, matching the
  pattern's own recommendation and material-web's own per-option
  `tabindex="0"`). ArrowDown/ArrowUp move cyclically across enabled items,
  Home/End jump to the first/last enabled item, typing jumps to the next item
  whose label starts with that character (typeahead), Enter/Space activates
  the focused item, Escape closes and restores focus to the anchor, and Tab
  closes without trapping focus and lets the browser's own tab order
  continue. A non-checkable item's activation closes the menu; a checkable
  item's activation does not.
- Container geometry/color from `MenuTokens` (`ContainerColor`
  surfaceContainer, `ContainerShape` cornerExtraSmall, `ContainerElevation`
  level2 as shadow elevation, `112`–`280px` `DropdownMenuItemDefaultMinWidth`/
  `MaxWidth`, `8px` `DropdownMenuVerticalPadding` container block padding).
  Item geometry/color from `ListTokens` (`48px` `ItemOneLineContainerHeight`
  read through the source's own `MenuListItemContainerHeight` menu-specific
  48px, `12px` `DropdownMenuItemHorizontalPadding`, `onSurface`/
  `onSurfaceVariant`/disabled-0.38 label/leading/trailing-icon roles) — the
  plain, non-selectable `DropdownMenuItemContent` the source itself resolves
  to has no independent shape or background of its own (a bare `Row` with
  only ripple indication), so item rows carry no corner radius and rely
  entirely on the shared state-layer system every other v1 interactive
  component already uses for hover/focus/press, rather than porting the
  separate Expressive per-item hover/press shape-morph tokens
  (`ItemHoveredContainerExpressiveShape`, etc.) that belong to a different,
  out-of-scope "expressive list" rendering path. Checked-item color from
  `StandardMenuTokens` (`ItemSelectedContainerColor` tertiaryContainer,
  `ItemSelected*Color` onTertiaryContainer, disabled-0.38 pair) — the actual
  resolved values `defaultMenuSelectableItemColors` reads, not the unread
  `MenuTokens.ListItemSelectedContainerColor`/secondaryContainer role the
  token file itself defines but no default color resolver ever reaches.
  Label typography reuses the existing `label-large` typescale variables
  directly, matching every prior task's unread-typography-role precedent.
  `MenuItemColors`' own resolution takes only `(enabled, selected)` — no
  hover/focus/pressed axis exists in the source's own color model — so this
  registration adds no separate state-layer color role beyond the one
  already shared everywhere else in v1.

#### `Select`

- A single-choice, data-driven `options: readonly SelectOption[]` prop
  (`{ value, label, disabled? }`) plus `value`/`defaultValue`/`onValueChange`
  (all `string`), matching the component inventory's `Select`/`SelectProps`
  pair with one added `SelectOption` data type on the same T15/T17-`Menu`
  precedent. No native `<select>` element is used: Material's opinionated
  popup option rows cannot be styled inside a native `<select>`'s popup
  across this library's browser floor (customizable `<select>` is a distant
  postdate of even the `@starting-style` exception), so — following the
  pinned source's own `ExposedDropdownMenuBox`, which composes a real
  `TextField`/`OutlinedTextField` rather than any native platform picker —
  `Select` composes the existing `TextFieldChrome` internal primitive around
  a `readOnly` native `<input>` trigger plus a popup listbox, reusing T14's
  foundation for a third time.
- Because the trigger is a real `TextFieldChrome`-decorated `input`, `Select`
  registers **no component tokens of its own** for its field chrome: every
  color/shape/spacing role comes from the existing `--m3e-comp-text-field-*`
  domain, exactly reproducing how the pinned source's `ExposedDropdownMenuBox`
  reads the same `TextFieldColors`/`TextFieldTokens` as a plain `TextField`
  with no distinct token file of its own. This is the same "one shared token
  domain serves two public components" precedent T14 already set between
  `TextField` and `TextArea`. The popup listbox itself reuses this task's own
  `menu` token domain unchanged, matching how `ExposedDropdownMenuDefaults`
  itself resolves straight through to `MenuDefaults.shape`/`containerColor`/
  `TonalElevation`/`ShadowElevation` — the exact same values plain
  `DropdownMenu` uses, not a distinct exposed-dropdown token set. The
  currently-selected option's highlight reuses the same checked-item roles
  `Menu`'s own checkable items already register. The trailing chevron is a
  fixed inline SVG (not a Material Symbols glyph, since baking in a font
  dependency the consumer has not opted into would break "font loading
  remains consumer-owned") rendered through `TextFieldChrome`'s existing
  `trailingIcon` slot, so it inherits the same enabled/disabled/error color
  handling with no new token at all; it rotates 180° when the field's
  `aria-expanded="true"`, read directly off that attribute with a CSS
  attribute selector rather than duplicated React state, the same native-
  truth precedent Radio/Dialog established.
- The trigger is `role="combobox"` with `aria-expanded`/`aria-controls`
  (pointing at the popup listbox id)/`aria-activedescendant` (pointing at the
  currently highlighted option's id), following the APG select-only combobox
  pattern exactly — DOM focus never leaves the trigger, unlike `Menu`'s real
  per-item focus movement. This is a deliberate divergence from `Menu`'s own
  focus model, matching each component's own distinct, authoritative APG
  pattern rather than forcing one shared technique. The trigger's displayed
  `value` is the selected option's label text with a non-empty placeholder
  (` `), the same `:placeholder-shown` has-value signal `TextField` already
  uses to float its label, so `Select` needs no separate has-value styling
  hook. The popup is `role="listbox"`, options are `role="option"` with
  `aria-selected`, and its width matches the trigger's rendered width
  (`ExposedDropdownMenuBox`'s own `matchAnchorWidth = true` default) rather
  than `Menu`'s intrinsic 112–280px bounds.
- Keyboard: closed, Enter/Space/ArrowDown/ArrowUp/click open the listbox with
  the active descendant on the selected option (or the first/last enabled
  option if none is selected, for Down/Up respectively). Open, ArrowDown/
  ArrowUp/Home/End/typeahead move the active descendant across enabled
  options only; Enter/Space commits the active option's value, calls
  `onValueChange`, and closes; Escape closes without changing the value;
  clicking an option commits and closes; clicking the trigger toggles.
- `name`, when supplied, renders one native `<input type="hidden">` carrying
  the current value alongside the visible trigger, so `Select` still
  participates in native form submission/`FormData`/`form.reset()` despite
  its visible control being a non-value-carrying, read-only display input —
  the first hidden-input forms shim in v1, necessary specifically because no
  native form-associated element can render Material's option rows, unlike
  every prior form control's real native element.
- `label`, `variant` (default `filled`), `leadingIcon`, `supportingText`,
  `error`, `disabled`, `required` mirror `TextField`'s own prop names and
  defaults exactly, so a consumer already familiar with `TextField` needs no
  new mental model for `Select`'s field half.

### Expected files

- `src/v1/internal/overlayPosition.ts`, `src/v1/internal/useAnchoredOverlay.ts`.
- `src/v1/components/Menu/`, its public barrel, and sourced `menu`
  component-token defaults.
- `src/v1/components/Select/`, its public barrel (no new component-token
  defaults file — see Scope).
- Menu and Select behavior, interaction, accessibility, theme, CSS, SSR,
  type-contract, and conformance evidence under `tests/v1/`, plus unit tests
  for `overlayPosition.ts`.
- Mirrored examples under `playground/v1/examples/`, playground usage, and
  packed Vite/Next fixture coverage.
- Menu and Select documentation, one ADR covering both plus the shared
  overlay primitives, architecture/provenance notes, and the component
  inventory status/exports for both rows.
- An explicit bundle-budget update only if justified by measured output.

### Acceptance checks

- `Menu`: `open`/`defaultOpen`/`onOpenChange` behave like every other v1
  controlled/uncontrolled pair; nothing renders server-side or before the
  first client effect. Opening moves focus to the first enabled item;
  ArrowDown/ArrowUp/Home/End/typeahead move it correctly; Enter/Space
  activates; Escape closes and restores focus to the anchor; Tab closes
  without trapping focus; outside click/anchor re-click close; a checkable
  item toggles `aria-checked` without closing; a non-checkable item closes on
  activation; a disabled item is skipped by keyboard navigation and does not
  activate.
- `Menu` positioning: prefers below/start-aligned to the anchor, flips to
  above and/or end-aligned when the preferred position would leave the
  viewport, and stays clamped inside the viewport margin in every case; width
  stays within 112–280px regardless of anchor width.
- `Select`: `value`/`defaultValue`/`onValueChange` behave like every other v1
  controlled/uncontrolled pair. The trigger shows `role="combobox"` with
  correct `aria-expanded`/`aria-controls`/`aria-activedescendant`; the popup
  is `role="listbox"` with `role="option"`/`aria-selected` children; the
  displayed value and floated label reflect the selected option; keyboard
  open/navigate/commit/cancel behave as specified; a disabled option is
  skipped and unselectable; `name` renders a working hidden input whose value
  tracks the selected option and participates in real form submission and
  `form.reset()`.
- `Select` popup width matches the trigger's rendered width; the chevron
  rotates with `aria-expanded` and inherits the trigger's disabled/error
  color.
- Forced colors keep both popups' boundaries and content visibly distinct
  from the page; logical properties mirror correctly under RTL; all
  transitions become immediate under reduced motion, including the
  deferred-unmount exit path (immediate unmount, no stuck-open frame).
- Rendering and hydration remain deterministic and inject no styles for
  either component.
- Forced colors, RTL, reduced motion, default/custom/nested theme, CSS
  resolution, documentation, source provenance, both examples, public
  exports, production fixtures, and inventory are covered and agree.
- Existing typecheck, tests, legacy contracts, packed Vite/Next fixtures,
  CSS checks, architecture checks, and bundle budgets remain green through
  `npm run verify:v1`.
