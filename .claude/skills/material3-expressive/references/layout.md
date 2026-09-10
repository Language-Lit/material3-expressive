# Layout, adaptivity, and canonical layouts

Material specifies layout in dp. On the web **1 dp = 1 CSS px**, so every number
here is a CSS pixel and every breakpoint is a `min-width` media query in px.

## Window size classes

| Class | Width | Typical | Panes | Navigation |
| --- | --- | --- | --- | --- |
| Compact | `< 600px` | phone portrait, narrow split view | 1 | bottom navigation bar |
| Medium | `600–839px` | tablet portrait, unfolded portrait, half-screen desktop | 1–2 | navigation rail |
| Expanded | `840–1199px` | tablet landscape, laptop | 2 | rail, or permanent drawer |
| Large | `1200–1599px` | large tablet, desktop | 2–3 | rail or permanent drawer |
| Extra-large | `≥ 1600px` | wide desktop | 2–3 | rail or permanent drawer |

Height classes matter for one decision: compact height (`< 480px`) means no
two-row app bar and no vertically stacked panes, even when the width is medium —
a phone in landscape. Medium height is `480–899px`, expanded `≥ 900px`.

```css
/* the only breakpoints an M3E app should contain */
@media (min-width: 600px)  { /* medium and up */ }
@media (min-width: 840px)  { /* expanded and up */ }
@media (min-width: 1200px) { /* large and up */ }
@media (min-width: 1600px) { /* extra-large */ }
```

If the codebase contains 640/768/1024/1280 (Tailwind), 576/992 (Bootstrap), or
any other scale, that is a finding: the layout changes at a different point from
the navigation, which `NavigationSuite` switches at 600 and 840.

Prefer **container queries** for components that must adapt to their pane rather
than the window (a card grid inside a detail pane); keep media queries for the
shell.

## Spacing

- **Base grid 8px**, sub-grid 4px for component internals and icon/type nudges.
  Every app-authored gap, padding, and offset should be a multiple of 4, and
  usually of 8.
- **Body margins**: 16px in compact, 24px from medium up.
- **Pane spacer**: 24px between panes. If panes are resizable the spacer holds
  the drag handle.
- **Touch target spacing**: ≥8px between adjacent targets.
- **Line length**: keep body text at 40–60 characters. Adjust margins and pane
  widths to hold that, don't let text run the full width of a 1600px window
  (`max-width: 65ch` on prose containers).
- Content gets a max width on very wide windows; extra space becomes margin or a
  third pane, never stretched controls or stretched text.

```css
.app-body {
  padding-inline: 16px;
  padding-block: 16px;
}
@media (min-width: 600px) {
  .app-body { padding-inline: 24px; padding-block: 24px; }
}
```

## App anatomy

Three regions:

1. **System / browser chrome** — not yours, but respect it: `env(safe-area-inset-*)`
   for notches and home indicators, `100dvh` (not `100vh`) so mobile browser
   chrome and the software keyboard do not clip the last row.
2. **Navigation region** — `AppBar`/`SearchAppBar` at the top;
   `NavigationBar`/`NavigationRail`/`NavigationDrawer` (or `NavigationSuite`) at
   the bottom or side.
3. **Body region** — panes, and the content inside them.

Rules:

- Exactly one navigation host visible at a time. A bottom bar plus a rail is
  always wrong.
- One top app bar per screen. `SearchAppBar` replaces `AppBar`; it does not stack
  under it.
- The FAB belongs to the body region and floats above it. One per screen, for the
  screen's primary action, with 16px clearance from any bottom bar or toolbar.
- Actions that don't fit `AppBar actions` go into a `Menu` overflow button, not a
  second row of icons.
- When an inner element scrolls instead of the document, pass its ref as
  `scrollContainer` to `AppBar`/`SearchAppBar` or the scroll behavior silently
  does nothing.

```tsx
/* app shell skeleton — see recipes.md for the complete version */
<Material3Provider colorMode="system">
  <div className="shell">              {/* grid: nav + body, 100dvh */}
    <NavigationSuite items={items} value={route} onValueChange={go}
      header={<FloatingActionButton icon={<Icon source="edit" />} aria-label="Compose" />} />
    <div className="shell__main">
      <AppBar size="small" title="Inbox" scrollContainer={scrollRef} scrollBehavior="pinned" />
      <main ref={scrollRef} className="shell__body">…</main>
    </div>
  </div>
</Material3Provider>
```

## Adaptive strategies

Three moves, in order of preference:

- **Reflow** — the same content, rearranged: one column becomes a grid, a
  vertical stack becomes side-by-side panes, navigation moves from bottom to side.
- **Reveal** — content hidden at compact becomes visible: the list pane appears
  next to the detail, filters move from a sheet into a persistent sidebar.
- **Presentation change** — a component becomes a different component: bottom
  sheet → side sheet or supporting pane, full-screen search → docked search,
  modal drawer → permanent drawer, dialog → inline pane.

Never: lock to one orientation, stretch a single column across 1600px, or hide
functionality permanently at compact widths.

## Canonical layouts

### List-detail

Explorable items plus each item's detail. Messaging, mail, contacts, file
browsers, settings.

| Class | Behavior |
| --- | --- |
| Compact | one pane at a time; selecting pushes detail, Back returns to list |
| Medium | one pane at a time (two only if both stay usable — rarely) |
| Expanded and up | both panes, list narrower, selection highlighted in the list |
| Large / extra-large | both panes plus optional third pane (side sheet) |

Details that make or break it:

- Give the list pane a fixed-ish width (≈320–400px) and let the detail take the
  remainder, or split evenly when both are content-dense. 24px spacer between.
- On expanded, an empty detail pane needs a real placeholder — never blank.
- The selected list row must be visibly selected in two-pane mode
  (`ListItem interaction="single"` or `aria-current`).
- Preserve state across a size-class change: expanded→compact keeps the detail
  visible; compact-with-list→expanded shows list + placeholder.
- Compact must have a working Back affordance that returns to the list without
  leaving the app.

### Supporting pane

A primary work area plus content that is only meaningful *in relation to* it:
comments on a document, a playlist beside a player, tool palettes, filters,
inspectors.

| Class | Behavior |
| --- | --- |
| Compact | supporting content below the primary content, or in a bottom sheet / modal reached from a button |
| Medium | side by side, roughly 50/50 |
| Expanded and up | side by side, roughly 70/30 with the primary pane larger |

If the secondary content stands on its own, it is a *detail*, not a supporting
pane — use list-detail.

### Feed

Equivalent items in a grid: news, media libraries, galleries, dashboards.

- One scrolling column at compact; more columns as width allows.
- Use an intrinsic grid, not breakpoint-counted columns:

  ```css
  .feed {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  @media (min-width: 600px) { .feed { gap: 24px; } }
  ```

- Vary item size deliberately to signal importance (a hero item spanning the full
  row), then keep the rest uniform. Random size variation reads as noise.
- Keep card aspect ratios stable so images do not jump; reserve space to avoid
  layout shift.
- Full-width rows (section headers, dividers) span all columns
  (`grid-column: 1 / -1`).

## Adaptive navigation

`NavigationSuite` implements the correct mapping already: bar `<600`, rail
`600–839`, permanent drawer `≥840`. Use it unless you need a shape it cannot
produce, then follow the same thresholds by hand.

- Compact: `NavigationBar`, 3–5 top-level destinations, always visible, labels on.
- Medium: `NavigationRail`, `header` slot for the FAB or a menu button.
- Expanded and up: rail, or a `permanent` `NavigationDrawer` when destinations
  need names, grouping, or counts. Note that current Material guidance favours a
  persistent rail over a modal drawer on large windows — a `modal` drawer at
  desktop width is a smell.
- More than 5 destinations means the information architecture needs a rethink,
  not a sixth icon.
- `NavigationSuite` server-renders the compact markup; if above-the-fold layout
  depends on the wide variant, expect one client pass.

## Edge cases to check on every screen

- **Zoom / large text**: at 200% text size nothing clips or overlaps. Material
  buttons use `min-block-size`, so app containers must not impose fixed heights.
- **RTL**: use logical properties (`padding-inline`, `margin-inline-start`,
  `inset-inline-end`). All library spacing is already logical.
- **Keyboard open** (mobile web): `100dvh` and sticky footers that don't cover the
  focused input.
- **Long content in a fixed row**: `ListItem` and `Card` text must wrap or
  truncate deliberately, with the full value reachable.
- **Empty, loading, and error states** for every pane — including the second pane
  of a two-pane layout.
