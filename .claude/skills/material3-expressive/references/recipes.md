# Recipes

Compositions for what the library deliberately leaves to the app. Use these
instead of inventing new primitives — and instead of reaching for another UI
library.

All CSS here assumes the stylesheet is imported and the element sits inside a
theme scope.

---

## Window size class hook (SSR-safe)

The same 600/840/1200/1600 thresholds `NavigationSuite` uses.

```ts
'use client'
import { useSyncExternalStore } from 'react'

export type WindowSizeClass = 'compact' | 'medium' | 'expanded' | 'large' | 'extraLarge'

const QUERIES = [
  ['extraLarge', '(min-width: 1600px)'],
  ['large', '(min-width: 1200px)'],
  ['expanded', '(min-width: 840px)'],
  ['medium', '(min-width: 600px)'],
] as const

function read(): WindowSizeClass {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'compact'
  for (const [name, query] of QUERIES) {
    if (window.matchMedia(query).matches) return name
  }
  return 'compact'
}

function subscribe(onChange: () => void): () => void {
  const lists = QUERIES.map(([, query]) => window.matchMedia(query))
  lists.forEach((list) => list.addEventListener('change', onChange))
  return () => lists.forEach((list) => list.removeEventListener('change', onChange))
}

export function useWindowSizeClass(): WindowSizeClass {
  // Server and first hydration render report `compact`, matching NavigationSuite.
  return useSyncExternalStore(subscribe, read, () => 'compact')
}
```

Prefer CSS media/container queries when the decision is purely visual; use the
hook only when the *component tree* must differ (one pane vs. two).

---

## App shell

```tsx
'use client'
import { useRef, useState } from 'react'
import {
  AppBar, FloatingActionButton, Icon, IconButton, Material3Provider,
  Menu, NavigationSuite, Text,
} from '@language-lit/material3-expressive'

const items = [
  { value: 'inbox', label: 'Inbox', icon: <Icon source="inbox" />, selectedIcon: <Icon source="inbox" fill={1} /> },
  { value: 'saved', label: 'Saved', icon: <Icon source="bookmark" /> },
  { value: 'settings', label: 'Settings', icon: <Icon source="settings" /> },
]

export function Shell({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLElement>(null)
  const overflowRef = useRef<HTMLButtonElement>(null)
  const [route, setRoute] = useState('inbox')
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <Material3Provider colorMode="system" className="shell">
      <a className="shell__skip" href="#main">Skip to content</a>

      {/* wrapper so app CSS positions the shell without ever selecting .m3e-* */}
      <div className="shell__nav">
        <NavigationSuite
          aria-label="Primary"
          items={items}
          value={route}
          onValueChange={setRoute}
          header={
            <FloatingActionButton
              icon={<Icon source="edit" />}
              aria-label="Compose message"
              size="medium"
            />
          }
        />
      </div>

      <div className="shell__frame">
        <AppBar
          size="small"
          scrollBehavior="pinned"
          scrollContainer={scrollRef}
          title={<Text as="h1" variant="titleLarge">Inbox</Text>}
          actions={
            <>
              <IconButton aria-label="Search"><Icon source="search" /></IconButton>
              <IconButton
                ref={overflowRef}
                aria-label="More options"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <Icon source="more_vert" />
              </IconButton>
              <Menu
                anchorRef={overflowRef}
                open={menuOpen}
                onOpenChange={setMenuOpen}
                items={[
                  { value: 'select', label: 'Select all', onSelect: selectAll },
                  { value: 'archive', label: 'Archive read', onSelect: archiveRead },
                ]}
              />
            </>
          }
        />
        <main id="main" ref={scrollRef} className="shell__body">{children}</main>
      </div>
    </Material3Provider>
  )
}
```

```css
.shell {
  min-height: 100dvh;
  display: grid;
  background: var(--m3e-sys-color-surface);
  color: var(--m3e-sys-color-on-surface);
}
/* Navigation stays first in the DOM (tab order, skip link). At compact it is
   pinned to the bottom of the viewport; from medium up it becomes the first
   grid column. No `order` tricks, so reading order never diverges. */
.shell { grid-template-columns: 1fr; }
.shell__nav { position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 2; }
.shell__frame { display: grid; grid-template-rows: auto 1fr; min-height: 0; }
.shell__body {
  overflow: auto;
  padding-inline: 16px;
  padding-block-start: 16px;
  /* clear the fixed navigation bar (80px) plus the home indicator */
  padding-block-end: calc(80px + max(16px, env(safe-area-inset-bottom)));
  scroll-padding-block-start: 64px;   /* keeps focus clear of the pinned app bar */
}
@media (min-width: 600px) {
  .shell { grid-template-columns: auto 1fr; }
  .shell__nav { position: sticky; inset: 0 auto auto auto; block-size: 100dvh; }
  .shell__body { padding-inline: 24px; padding-block: 24px; }
}
.shell__skip {
  position: absolute; inset-inline-start: -9999px;
  background: var(--m3e-sys-color-primary-container);
  color: var(--m3e-sys-color-on-primary-container);
  border-radius: var(--m3e-sys-shape-corner-small);
  padding: 8px 16px;
}
.shell__skip:focus { inset-inline-start: 16px; inset-block-start: 16px; z-index: 10; }
```

Set `class="m3e-theme" data-m3e-color-mode="system"` on `<html>` as well if
anything outside the provider is painted (see `tokens.md`).

---

## List-detail

```tsx
'use client'
import { useState } from 'react'
import { Divider, IconButton, Icon, ListItem, Surface, Text } from '@language-lit/material3-expressive'
import { useWindowSizeClass } from './useWindowSizeClass'

export function Threads({ threads }: { threads: Thread[] }) {
  const sizeClass = useWindowSizeClass()
  const twoPane = sizeClass === 'expanded' || sizeClass === 'large' || sizeClass === 'extraLarge'
  const [selected, setSelected] = useState<string | null>(null)
  const current = threads.find((thread) => thread.id === selected) ?? null

  if (!twoPane) {
    return current ? (
      <Detail
        thread={current}
        onBack={() => setSelected(null)}
        backButton={
          <IconButton aria-label="Back to threads" onClick={() => setSelected(null)}>
            <Icon source="arrow_back" />
          </IconButton>
        }
      />
    ) : (
      <List threads={threads} selected={selected} onSelect={setSelected} />
    )
  }

  return (
    <div className="list-detail">
      <Surface as="section" color="surface-container-low" shape="large" aria-label="Threads">
        <List threads={threads} selected={selected} onSelect={setSelected} />
      </Surface>
      <Surface as="section" color="surface" shape="large" aria-label="Thread">
        {current ? <Detail thread={current} /> : <DetailPlaceholder />}
      </Surface>
    </div>
  )
}

function List({ threads, selected, onSelect }: ListProps) {
  return (
    <ul className="thread-list">
      {threads.map((thread, index) => (
        <li key={thread.id}>
          <ListItem
            interaction="single"
            name="thread"
            value={thread.id}
            selected={selected === thread.id}
            onSelectedChange={() => onSelect(thread.id)}
            overline={thread.sender}
            headline={thread.subject}
            supportingText={thread.preview}
            trailingContent={<Text variant="labelSmall">{thread.time}</Text>}
          />
          {index < threads.length - 1 ? <Divider decorative /> : null}
        </li>
      ))}
    </ul>
  )
}
```

```css
.list-detail { display: grid; gap: 24px; grid-template-columns: minmax(320px, 400px) 1fr; align-items: start; }
.thread-list { list-style: none; margin: 0; padding: 0; }
```

`DetailPlaceholder` is required, not optional — see § Empty states.

---

## Feed

```tsx
<Surface as="section" color="surface" aria-labelledby="feed-title">
  <Text as="h2" id="feed-title" variant="headlineSmall" emphasis="emphasized">Latest</Text>
  <div className="feed">
    {items.map((item, index) => (
      <Card key={item.id} variant="elevated" className={index === 0 ? 'feed__hero' : undefined}>
        <img src={item.image} alt="" width={640} height={360} />
        <div className="feed__text">
          <Text as="h3" variant="titleMedium">{item.title}</Text>
          <Text as="p" variant="bodyMedium">{item.summary}</Text>
        </div>
      </Card>
    ))}
  </div>
</Surface>
```

```css
.feed { display: grid; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
@media (min-width: 600px) { .feed { gap: 24px; } }
@media (min-width: 840px) { .feed__hero { grid-column: 1 / -1; } }
.feed__text { display: grid; gap: 4px; padding: 16px; }
.feed img { inline-size: 100%; block-size: auto; border-start-start-radius: inherit; border-start-end-radius: inherit; }
```

One hero item, then uniformity. `alt=""` only because the title repeats the
meaning; otherwise describe the image.

---

## Supporting pane

```tsx
const sizeClass = useWindowSizeClass()
const inline = sizeClass !== 'compact'

return inline ? (
  <div className="supporting">
    <Surface as="section" color="surface" aria-label="Document">{primary}</Surface>
    <Surface as="aside" color="surface-container-low" shape="large" aria-label="Comments">{support}</Surface>
  </div>
) : (
  <>
    <Surface as="section" color="surface" aria-label="Document">{primary}</Surface>
    <Button variant="tonal" onClick={() => setSheet('expanded')} leadingIcon={<Icon source="comment" />}>
      Comments
    </Button>
    <BottomSheet value={sheet} onValueChange={setSheet} aria-label="Comments">{support}</BottomSheet>
  </>
)
```

```css
.supporting { display: grid; gap: 24px; }
@media (min-width: 600px) { .supporting { grid-template-columns: 1fr 1fr; } }
@media (min-width: 840px) { .supporting { grid-template-columns: 7fr 3fr; } }
```

---

## Side sheet (not shipped)

Native `<dialog>` for modal behavior, tokens for the surface.

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { IconButton, Icon, Text } from '@language-lit/material3-expressive'

export function SideSheet({ open, onClose, title, children }: SideSheetProps) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog ref={ref} className="side-sheet" aria-label={title} onCancel={onClose} onClose={onClose}>
      <header className="side-sheet__head">
        <Text as="h2" variant="titleLarge">{title}</Text>
        <IconButton aria-label="Close" onClick={onClose}><Icon source="close" /></IconButton>
      </header>
      <div className="side-sheet__body">{children}</div>
    </dialog>
  )
}
```

```css
.side-sheet {
  margin: 0 0 0 auto; block-size: 100dvh; inline-size: min(400px, 100vw);
  border: none; padding: 0;
  background: var(--m3e-sys-color-surface-container-low);
  color: var(--m3e-sys-color-on-surface);
  border-start-start-radius: var(--m3e-sys-shape-corner-large);
  border-end-start-radius: var(--m3e-sys-shape-corner-large);
  box-shadow: var(--m3e-sys-elevation-level1-shadow);
}
.side-sheet::backdrop { background: color-mix(in srgb, var(--m3e-sys-color-scrim) 32%, transparent); }
.side-sheet__head { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 16px 8px 16px 24px; }
.side-sheet__body { padding: 0 24px 24px; overflow: auto; }
@media (min-width: 840px) { /* consider a supporting pane instead of a sheet here */ }
```

On expanded windows, prefer promoting this to a persistent supporting pane.

---

## Date and time input (not shipped)

`TextField` deliberately excludes `date`/`time` types. Use the native control and
give it the outlined-field treatment with tokens.

```tsx
<div className="date-field">
  <Text as="label" htmlFor="due" variant="bodySmall">Due date</Text>
  <input
    id="due"
    className="date-field__input"
    type="date"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    aria-describedby={error ? 'due-error' : undefined}
    aria-invalid={error || undefined}
  />
  {error ? <Text as="p" id="due-error" variant="bodySmall" className="date-field__error">{error}</Text> : null}
</div>
```

```css
.date-field { display: grid; gap: 4px; }
.date-field__input {
  min-block-size: 56px; padding-inline: 16px;
  font: inherit;
  font-family: var(--m3e-sys-typescale-baseline-body-large-font-family);
  font-size: var(--m3e-sys-typescale-baseline-body-large-font-size);
  color: var(--m3e-sys-color-on-surface);
  background: transparent;
  border: 1px solid var(--m3e-sys-color-outline);
  border-radius: var(--m3e-sys-shape-corner-extra-small);
}
.date-field__input:focus-visible { outline: 3px solid var(--m3e-sys-color-primary); outline-offset: 2px; border-color: var(--m3e-sys-color-primary); }
.date-field__input[aria-invalid='true'] { border-color: var(--m3e-sys-color-error); }
.date-field__error { color: var(--m3e-sys-color-error); }
```

Native pickers are localized, keyboard-accessible, and mobile-friendly. Do not
build a calendar grid unless the product genuinely needs range selection with
availability — and then say so and scope it properly.

---

## Snackbar host (queue)

`Snackbar` is one controlled message. Own the queue.

```tsx
'use client'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { Snackbar } from '@language-lit/material3-expressive'

type Toast = { id: number; message: string; action?: { label: string; onClick: () => void } }
const SnackbarContext = createContext<(toast: Omit<Toast, 'id'>) => void>(() => {})
export const useSnackbar = () => useContext(SnackbarContext)

export function SnackbarHost({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<Toast[]>([])
  const current = queue[0]

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    setQueue((previous) => [...previous, { ...toast, id: Date.now() + previous.length }])
  }, [])

  const handleOpenChange = useCallback((open: boolean) => {
    if (!open) setQueue((previous) => previous.slice(1))
  }, [])

  const value = useMemo(() => show, [show])

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {current ? (
        <Snackbar
          key={current.id}
          open
          onOpenChange={handleOpenChange}
          message={current.message}
          action={current.action}
        />
      ) : null}
    </SnackbarContext.Provider>
  )
}
```

One at a time, newest last. Errors that need a decision belong in a `Dialog`, not
a snackbar; a snackbar must never be the only place a failure is reported.

---

## Confirm dialog

```tsx
<Dialog
  open={open}
  onOpenChange={setOpen}
  role="alertdialog"
  icon={<Icon source="delete" />}
  title="Delete 3 messages?"
  actions={
    <>
      <Button variant="text" onClick={() => setOpen(false)}>Cancel</Button>
      <Button variant="filled" onClick={() => { remove(); setOpen(false) }}>Delete</Button>
    </>
  }
>
  They will be removed from every device. This cannot be undone.
</Dialog>
```

Name the consequence in the title, put the verb on the confirm button, keep the
dismissal on the left as `text`. Undo via snackbar beats a confirm dialog whenever
the action is reversible.

---

## Form

```tsx
<form onSubmit={handleSubmit} className="form" noValidate>
  <Text as="h2" variant="headlineSmall" emphasis="emphasized">Create account</Text>

  <TextField
    label="Email"
    type="email"
    name="email"
    autoComplete="email"
    required
    value={email}
    onChange={(event) => setEmail(event.target.value)}
    error={Boolean(errors.email)}
    supportingText={errors.email ?? 'We only use this to sign you in.'}
  />

  <TextField
    label="Password"
    type="password"
    name="password"
    autoComplete="new-password"
    required
    value={password}
    onChange={(event) => setPassword(event.target.value)}
    error={Boolean(errors.password)}
    supportingText={errors.password ?? 'At least 12 characters.'}
  />

  <Select label="Country" options={countries} value={country} onValueChange={setCountry} name="country" />

  <div className="form__consent">
    <Checkbox id="terms" checked={agreed} onCheckedChange={setAgreed} />
    <Text as="label" htmlFor="terms" variant="bodyMedium">I accept the terms</Text>
  </div>

  <Button type="submit" variant="filled" size="medium" width="full" disabled={submitting}>
    {submitting ? 'Creating account…' : 'Create account'}
  </Button>
  <p role="status" className="sr-only">{submitting ? 'Submitting' : status}</p>
</form>
```

```css
.form { display: grid; gap: 16px; max-width: 480px; }
.form__consent { display: flex; align-items: center; gap: 8px; }
```

One field per row, one `variant` for every field in the app, real
`autoComplete` values, supporting text that says how to fix the error, and a
status region so the submit outcome is announced. Never disable submit until the
user has been told what is wrong.

---

## Link that looks like a button

`Button` never renders an anchor. Style a real link with tokens:

```tsx
<a className="link-button" href="/pricing">See pricing</a>
```

```css
.link-button {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-block-size: 40px; min-inline-size: 48px; padding-inline: 16px;
  border-radius: var(--m3e-sys-shape-corner-full);
  background: var(--m3e-sys-color-secondary-container);
  color: var(--m3e-sys-color-on-secondary-container);
  font-family: var(--m3e-sys-typescale-baseline-label-large-font-family);
  font-size: var(--m3e-sys-typescale-baseline-label-large-font-size);
  font-weight: var(--m3e-sys-typescale-baseline-label-large-font-weight);
  letter-spacing: var(--m3e-sys-typescale-baseline-label-large-letter-spacing);
  text-decoration: none;
}
.link-button:hover { background: color-mix(in srgb, var(--m3e-sys-color-on-secondary-container) calc(var(--m3e-sys-state-hover) * 100%), var(--m3e-sys-color-secondary-container)); }
.link-button:focus-visible { outline: 3px solid var(--m3e-sys-color-primary); outline-offset: 2px; }
```

For in-app navigation lists, prefer `Tabs` items or navigation items with `href` —
they are already real links.

---

## Autocomplete / combobox

`Select` is a fixed-option listbox, not a text combobox. For free text with
suggestions, either use `SearchBar` (which owns query + expanded state and renders
your results in `children`):

```tsx
<SearchBar
  placeholder="Search projects"
  query={query}
  onQueryChange={setQuery}
  onSearch={runSearch}
  expanded={expanded}
  onExpandedChange={setExpanded}
  leadingIcon={<Icon source="search" />}
>
  <ul className="suggestions" aria-label="Suggestions">
    {suggestions.map((suggestion) => (
      <li key={suggestion.id}>
        <ListItem
          interaction="action"
          headline={suggestion.title}
          supportingText={suggestion.subtitle}
          leadingContent={<Icon source="history" />}
          onClick={() => choose(suggestion)}
        />
      </li>
    ))}
  </ul>
</SearchBar>
```

That is a **list of real buttons** — plain, correct, and keyboard reachable.

If the product genuinely needs combobox semantics (arrow keys moving a virtual
cursor inside the field), implement the APG combobox pattern fully on a
`TextField`: `role="combobox"`, `aria-expanded`, `aria-controls`,
`aria-activedescendant`, `role="listbox"`/`role="option"`, and keyboard handling
for Up/Down/Home/End/Escape/Enter. Half of that is worse than none — without
`aria-activedescendant` wiring, `role="listbox"` only removes the list semantics
screen readers would otherwise have given you.

---

## Bottom actions without a bottom app bar

The library ships no bottom app bar; current Material guidance prefers a docked
or floating toolbar anyway.

```tsx
{/* collapse from your own scroll listener: setExpanded(!scrolledDown) */}
<FloatingToolbar
  variant="vibrant"
  expanded={expanded}
  onExpandedChange={setExpanded}
  aria-label="Editing tools"
>
  <IconButton aria-label="Bold"><Icon source="format_bold" /></IconButton>
  <IconButton aria-label="Italic"><Icon source="format_italic" /></IconButton>
  <IconButton aria-label="Link"><Icon source="link" /></IconButton>
</FloatingToolbar>
```

Position it yourself with `position: sticky`/`fixed`, `inset-block-end:
max(16px, env(safe-area-inset-bottom))`, and clearance from any navigation bar.

---

## Empty, loading, and error states

Every pane needs all three. The second pane of a two-pane layout is the one people
forget.

```tsx
function DetailPlaceholder() {
  return (
    <div className="state">
      <Icon source="drafts" size={48} />
      <Text as="p" variant="titleMedium">Select a thread</Text>
      <Text as="p" variant="bodyMedium">Choose a message on the left to read it here.</Text>
    </div>
  )
}

function ErrorState({ retry }: { retry: () => void }) {
  return (
    <div className="state" role="alert">
      <Icon source="error" decorative={false} label="Error" size={48} />
      <Text as="p" variant="titleMedium">Couldn’t load messages</Text>
      <Text as="p" variant="bodyMedium">Check your connection and try again.</Text>
      <Button variant="tonal" onClick={retry}>Retry</Button>
    </div>
  )
}
```

```css
.state {
  display: grid; justify-items: center; gap: 8px; padding: 48px 24px; text-align: center;
  color: var(--m3e-sys-color-on-surface-variant);
}
```

Empty states name the thing that is missing and offer the action that fills it.
Error states say what failed and what to do. Loading states reserve the final
layout so nothing jumps.
