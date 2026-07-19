# v1 internal primitives

Private web and React primitives shared by multiple v1 features live here. This
directory is not exported from the package.

- `composeEventHandlers` preserves consumer-first event ordering and native
  `preventDefault()` cancellation.
- `useControllableState` keeps controlled values authoritative and initializes
  uncontrolled state exactly once.
- `composeRefs` assigns one node to both a consumer ref and a library-owned ref
  so components that read their own DOM node still forward the primary element.
- `TextFieldChrome` renders the label, indicator/outline, icon, and
  supporting-text decoration shared by `TextField` and `TextArea` around a
  native `input`/`textarea` child, matching the one decoration layer the
  pinned Compose source reuses for both single- and multi-line fields.
- `overlayPosition` is a pure function computing an anchored popover's
  position (start/end/clamp horizontally, below/above/clamp vertically),
  shared by `Menu` and `Select`'s popup.
- `useAnchoredOverlay` owns the portal mount lifecycle, live repositioning,
  outside-click/Escape dismissal, and deferred-unmount exit animation shared
  by `Menu` and `Select`'s popup — see ADR 0017 for why this is needed at all
  (neither component gets Dialog's native top-layer/backdrop/focus-restore
  behavior for free).
