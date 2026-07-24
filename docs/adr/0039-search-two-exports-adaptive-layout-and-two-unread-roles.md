# ADR 0039: Search as two exports, an adaptive layout default, and two deliberately registered unread roles

Status: accepted
Date: 2026-07-24
Task: T47

## Context

Search is catalog row 25 and the third composite of tranche C. The pinned
revision is `a90df2fc27e026b9ad2ed569f203a260c1041fab`: `SearchBar.kt` and both
generated token files were fetched at that revision and at `androidx-main` HEAD
(`409acc1915f01da1855d63bb721e4635ec736f84`, 2026-07-24) and are byte-identical,
extending the unified snapshot for a fourth consecutive task. The two pinned
test files moved at HEAD by exactly one line each — `createComposeRule(
StandardTestDispatcher())` became `createComposeRule()` — a Compose
test-infrastructure change that adds, removes, and renames no case, so the pin
holds and the delta is classified (the T44 rule) rather than re-pinned.

Four facts shaped the decisions below.

**The source has six current composables where the design has two axes.**
`SearchBar` is the collapsed bar; `AppBarWithSearch` is the same bar in app-bar
chrome; and four `Expanded*SearchBar` composables are the cross product of
contained/divided and full-screen/docked. The design site's own configuration
table names those two axes — Style ("Contained", "Divided (baseline)") and
Layout ("Docked, full-screen") — and marks divided "Not recommended. Use
contained."

**The expanded search is a different window upstream.** Compose renders it in a
`Dialog` (full screen) or a `Popup` (docked), each re-rendering the caller's
`inputField` slot, animating from the collapsed bar's recorded bounds. Nothing
about that is portable, but the *structure* is: the expanded surface owns a
field of its own, and the collapsed one is behind it.

**The guidance is adaptive, and says so explicitly.** "Search suggestions or
results should swap from full-screen in compact windows to docked in larger
window sizes." Upstream cannot express that — a Compose caller picks a
composable — but the web can, and `NavigationSuite` already resolves Material's
window classes at 600px in this library.

**Two generated roles describe things the implementation never wired.**
`SearchBarTokens` declares `AvatarShape`/`AvatarSize` (full corner, 30dp) and
`FocusIndicatorColor` (`Secondary`). No pinned composable resolves any of them,
yet the specification's anatomy lists an avatar with a 30dp measurement, and
the source does draw an inset focus ring — it just takes the color from the
ambient ripple theme rather than from the role that names it.

## Decisions

### 1. Two exports: `SearchBar` and `SearchAppBar`

`SearchBar` covers the bar and both expanded surfaces. `SearchAppBar` wraps one
in app-bar chrome with `navigationIcon`, `actions`, and scroll coupling.

They are separate rather than one component with a variant because the source
separates them the same way and for the same reason: `AppBarWithSearch`
composes `SearchBar` inside its own surface, and its slots and scroll behavior
describe app-bar chrome, not search. A `variant="appBar"` prop would put three
props on a discriminated union that only ever apply together, and would make
`SearchBar`'s root element depend on a prop.

`SearchAppBar` takes the search bar as `children` rather than duplicating every
search prop, mirroring the source's `inputField` slot. The scrolled color
handoff — the source's `scrolledSearchBarContainerColor` — is a descendant CSS
rule, so no prop threading is needed.

`SearchAppBar` is an API rather than a recipe because it owns behavior: the
scroll coupling and the on-scroll color transition cannot be composed from
public parts. It does not extend `AppBar`, which requires a `title` and renders
title rows — the source does not compose a top app bar here either.

### 2. Style and layout are props, not four exports

`appearance: 'contained' | 'divided'` and `layout: 'adaptive' | 'docked' |
'fullScreen'` map the four expanded composables onto the two axes the design
site names. This is the Slider/Divider precedent (one component per axis)
rather than the NavigationDrawer precedent (one component per variant): the
four composables are not four anatomies, they are one anatomy under two binary
choices, and the source's own `ExpandedDockedSearchBarWithGap` is literally
`ExpandedDockedSearchBar` plus the contained treatment's gap and scrim.

`contained` is the default because the design site recommends it and calls the
alternative "not recommended".

### 3. `layout="adaptive"` is the default

Adaptive resolves full-screen below Material's 600px compact breakpoint and
docked above it, live, using the same `min-width: 600px` query
`NavigationSuite` registers. It is the default because it is what the guidance
prescribes; pinning a layout is the opt-out.

Before the client measures, the hook reports compact — the same compact-first
default `NavigationSuite` takes, and safe here because a collapsed bar renders
identically either way and an expanded surface requires interaction.

A consequence worth recording: when the window crosses the breakpoint while
expanded, the full-screen dialog closes and the docked panel takes over. The
native `close` event is otherwise the single path back to the controlled value,
so that one close is filtered — it is a change of surface, not a dismissal.

### 4. The expanded surface owns the field; the in-page bar goes inert

Both surfaces render their own copy of the bar, exactly as all four expanded
composables re-render the `inputField` slot. The in-page bar is then made
`inert`, so exactly one combobox is focusable or exposed to assistive
technology. The query survives because it is hoisted; the caret survives
because the selection is copied across on expansion.

The alternative — keeping one field in the page and portalling only the
results — was rejected because the contained docked treatment dims the page
with a scrim, and there is no reliable way to raise an in-flow element above a
portalled scrim: any ancestor stacking context (a sticky app bar's own
`z-index`, for one) wins. The source solves this by drawing its bar copy above
the scrim inside the popup, and that solution ports exactly.

`inert` is applied imperatively rather than as a JSX prop because React 18 and
19 serialize the attribute differently and this library supports both peers.

### 5. Full screen is `<dialog>`; docked is the shared anchored overlay

The full-screen surface uses native `showModal()` — the ADR 0016 lifecycle
`Dialog`, `NavigationDrawer`, and `BottomSheet` already share — so top-layer
promotion, the focus trap, background inertness, and focus restoration are the
platform's. The docked surface uses `useAnchoredOverlay`, the portal lifecycle
`Menu` and `Select` share (ADR 0017), with a `computePosition` override placing
the panel over the collapsed bar's own box rather than below it, which is where
the source's popup positions itself.

### 6. Combobox semantics replace the state description

The field is `role="combobox"` with `aria-expanded`, `aria-controls`, and
`aria-autocomplete="list"`. The source sets a `stateDescription` of
"Suggestions available" when expanded, which is Android's way of announcing the
same fact; ARIA's expanded state is the web's, and it needs no live region.

The results container gets no role. The specification says to fill it with the
list component, and the accessibility page says screen readers announce results
"as a list" — which is true of the consumer's own list markup, and would be
made false by imposing a `listbox` on arbitrary children.

### 7. Non-touch expansion rules apply in every input mode

The source couples focus and expansion in touch mode (focus expands) but not in
keyboard mode, where expansion waits for typing or the down key. The web has no
touch-mode signal, and the touch-mode rule is the dangerous one to generalize:
tabbing past a search field would take over the screen. So the non-touch rules
apply always — pointer activation, a query that grew, or the down key — and a
touch tap still expands because it produces a click.

### 8. `avatar` and `focus-ring-color` are registered despite being unread

Two generated roles are registered even though the pinned implementation reads
neither:

- `AvatarShape`/`AvatarSize` back an `avatar` slot. The specification lists
  "with avatar" and "with trailing icon button and avatar" as distinct
  specimens and measures the avatar at 30dp; the completeness contract requires
  every documented specimen to be API, recipe, adaptation, or exclusion, and a
  30dp full-corner slot with generated roles of its own is API.
- `FocusIndicatorColor` backs the focus ring. The source draws an inset ring
  and takes its color from the ripple theme, so the role that names the ring is
  unread; `Secondary` is also what every other focus ring in this library
  resolves to, which makes registering it strictly better than hard-coding.

This is a deliberate, bounded exception to the read/unread rule T42 established.
The other sixteen unread roles stay recorded in the ledger, not registered.

### 9. Excluded, with reasons

- **Predictive back.** An Android system gesture; the browser owns its own back
  affordance. Its five pinned screenshot cases are ledgered.
- **Window insets.** An Android window concern; a web page owns its insets.
- **Fling settle.** Replaced by the shared idle snap, as T46 did.
- **Compose animation specs.** The enter/exit tween pairs become the semantic
  fast-effects motion role rather than being reproduced numerically.
- **Soft-keyboard interception.** `DisableSoftKeyboard` suppresses the Android
  IME for a collapsed field; the web has nothing to suppress.
- **Reverse-layout scrolling.** A Compose lazy-list concern.
- **`SearchBarState.progress`.** Mid-flight animation progress is an
  `Animatable` reading; here the transition is the browser's and is not
  sampled. Like T45's drag offset and T46's collapse fraction, it is a
  measurement rather than enumerable state.
- **Binary-compatibility shims.** The T44 class.

## Consequences

Catalog row 25 moves from Planned to **Conformant**: both styles, both layouts,
the adaptive rule, the search app bar, and the results container are all
covered, and the remaining specimens (avatars, filter chips, grouped results)
are content composition documented as recipes.

Row 1's "Search app bar" specimen now has an implementation. That row stays
Partial for its own reason — the behavior-owning overflow-action system — and
this task does not change that.

`useAppBarScroll` gains a `variablePrefix` option so a second host writes its
own custom-property names. `AppBar`'s names are unchanged by default; the
option is the smallest change that avoids a search app bar writing
`--m3e-app-bar-offset`.

The library now has a component that reads three other components' token
families: `--m3e-comp-app-bar-*` for the app-bar chrome and
`--m3e-comp-text-field-disabled-*` for disabled colors, both because the source
reads exactly those upstream families, plus its own. That is a precedent worth
naming: cross-family token reads follow the source's own read path rather than
duplicating values under a new name.
