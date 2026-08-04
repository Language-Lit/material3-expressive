/**
 * jsdom implements no layout engine and so has neither `ResizeObserver` nor
 * `Element.scrollBy` — a test-environment gap, not a product concern, since
 * every target browser (Chrome 120+, Firefox 121+, Safari 17.2+) implements
 * both natively. Mirrors the Select `scrollIntoView` and Dialog
 * `showModal`/`show`/`close` test-only polyfill precedents. (`Tabs` itself
 * stopped calling `scrollIntoView` in T56 — it scrolls only its own list via
 * `scrollBy`, so ancestors never move.)
 */
export function installTabsNativePolyfills(): void {
  if (typeof Element.prototype.scrollBy !== 'function') {
    Element.prototype.scrollBy = function scrollBy() {
      // No-op: jsdom has no scroll position to update.
    } as Element['scrollBy']
  }
  if (typeof globalThis.ResizeObserver !== 'function') {
    globalThis.ResizeObserver = class ResizeObserver {
      observe() {
        // No-op: jsdom performs no layout, so there is nothing to observe.
      }
      unobserve() {}
      disconnect() {}
    }
  }
}
