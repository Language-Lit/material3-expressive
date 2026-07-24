import { useEffect, type RefObject } from 'react'

export type AppBarScrollBehaviorKind =
  | 'none'
  | 'pinned'
  | 'enterAlways'
  | 'exitUntilCollapsed'

export interface AppBarScrollOptions {
  readonly behavior: AppBarScrollBehaviorKind
  /** The bar's root element; receives the state attributes and variables. */
  readonly barRef: RefObject<HTMLElement | null>
  /**
   * The expanded title row of a two-row bar; its rendered height at rest is
   * the collapse range. Absent on single-row bars.
   */
  readonly expandedRowRef: RefObject<HTMLElement | null>
  /** The two title copies whose semantics swap at fraction 0.5. */
  readonly collapsedTitleRef: RefObject<HTMLElement | null>
  readonly expandedTitleRef: RefObject<HTMLElement | null>
  /**
   * Scroll container to observe. Defaults to the window — the common
   * document-scrolling page. Compose wires the coupling through a
   * nested-scroll connection; the web has no such protocol, so an inner
   * scroll container must be named explicitly.
   */
  readonly scrollContainer?: RefObject<HTMLElement | null>
  /**
   * Sourced collapse range in pixels, used when the rendered range cannot be
   * measured (a layout-less test environment reports zero heights).
   */
  readonly fallbackCollapseRange: number
}

/**
 * The source's `TopTitleAlphaEasing`: CubicBezierEasing(0.8, 0, 0.8, 0.15),
 * applied to the collapsed-title alpha of a two-row bar. CSS cannot apply an
 * easing curve to a custom property, so the curve is evaluated here and the
 * eased value is what reaches the stylesheet.
 */
export function topTitleAlphaEasing(fraction: number): number {
  if (fraction <= 0) return 0
  if (fraction >= 1) return 1
  // Cubic bezier with P1=(0.8, 0), P2=(0.8, 0.15): solve x(t) = fraction for
  // t by bisection (x(t) is monotonic on [0, 1]), then evaluate y(t).
  const x = (t: number) => 3 * t * (1 - t) * (1 - t) * 0.8 + 3 * t * t * (1 - t) * 0.8 + t * t * t
  const y = (t: number) => 3 * t * t * (1 - t) * 0.15 + t * t * t
  let low = 0
  let high = 1
  let t = fraction
  for (let i = 0; i < 32; i += 1) {
    const current = x(t)
    if (Math.abs(current - fraction) < 0.0001) break
    if (current < fraction) low = t
    else high = t
    t = (low + high) / 2
  }
  return y(t)
}

/** How long scrolling must pause before an enter-always bar snaps. */
const ENTER_ALWAYS_SNAP_IDLE_MS = 150

/**
 * Couples an app bar to its scroll container, producing the three outputs the
 * sourced behaviors need: a scrolled flag (`data-m3e-scrolled`), a collapse
 * fraction (`--m3e-app-bar-collapsed-fraction`, with the eased
 * `--m3e-app-bar-top-title-alpha` beside it and `data-m3e-collapsed` crossing
 * at 0.5), and an enter-always offset (`--m3e-app-bar-offset`).
 *
 * All writes are imperative: scroll fires per frame, and a React state update
 * per frame would re-render the entire bar to change one custom property.
 * React renders the resting state (fraction 0, not scrolled) and never
 * revisits these attributes, so ownership does not conflict.
 *
 * The behaviors map the sourced ones:
 *
 * - `pinned` never moves the bar; only the scrolled flag changes, driving the
 *   container-color swap (`overlappedFraction > 0.01` in the source is any
 *   overlap at all, so the web reading is `scrollTop > 0`).
 * - `enterAlways` accumulates raw scroll deltas into an offset clamped to the
 *   bar's own height, exactly `heightOffset` accumulating `dispatchRawDelta`:
 *   any downward scroll hides, any upward scroll begins revealing. The
 *   source's velocity-based fling settle becomes an idle snap — after 150ms
 *   without scrolling, a partially hidden bar settles to fully shown or fully
 *   hidden, whichever is nearer. Focus landing inside the bar resets the
 *   offset, because the accessibility guidance requires app bar actions to
 *   stay reachable while content is scrolled.
 * - `exitUntilCollapsed` derives the fraction deterministically from the
 *   scroll position over the collapse range. Position-derived is the web's
 *   native collapsing-header model and subsumes the source's "remain small
 *   until the page is scrolled back to the top"; it also means there is no
 *   independent bar state to settle, so the source's mid-collapse snap has
 *   nothing to act on and is not reproduced.
 */
export function useAppBarScroll({
  behavior,
  barRef,
  expandedRowRef,
  collapsedTitleRef,
  expandedTitleRef,
  scrollContainer,
  fallbackCollapseRange,
}: AppBarScrollOptions): void {
  useEffect(() => {
    if (behavior === 'none') return undefined
    const bar = barRef.current
    if (!bar) return undefined

    const container = scrollContainer?.current ?? null
    const target: EventTarget = container ?? window
    const readScrollTop = () =>
      container ? container.scrollTop : window.scrollY

    // The expanded row's resting height is the collapse range. Measured while
    // the fraction is still 0 (React rendered the resting state), so the
    // measurement is the full range; the sourced constant stands in where
    // there is no layout to measure.
    const measuredRange = expandedRowRef.current?.offsetHeight ?? 0
    const collapseRange = measuredRange > 0 ? measuredRange : fallbackCollapseRange

    let lastScrollTop = readScrollTop()
    let offset = 0
    let collapsed = false
    let snapTimer: ReturnType<typeof setTimeout> | undefined

    const applyScrolled = (scrolled: boolean) => {
      if (scrolled) bar.setAttribute('data-m3e-scrolled', 'true')
      else bar.removeAttribute('data-m3e-scrolled')
    }

    const applyOffset = () => {
      bar.style.setProperty('--m3e-app-bar-offset', `${offset}px`)
    }

    const applyFraction = (fraction: number) => {
      bar.style.setProperty('--m3e-app-bar-collapsed-fraction', String(fraction))
      bar.style.setProperty(
        '--m3e-app-bar-top-title-alpha',
        String(topTitleAlphaEasing(fraction)),
      )
      // The source hides the collapsed row's title semantics below 0.5 and
      // the expanded row's above it, so exactly one title is exposed to
      // assistive technology at any fraction.
      const nowCollapsed = fraction >= 0.5
      if (nowCollapsed !== collapsed) {
        collapsed = nowCollapsed
        if (nowCollapsed) bar.setAttribute('data-m3e-collapsed', 'true')
        else bar.removeAttribute('data-m3e-collapsed')
        collapsedTitleRef.current?.setAttribute('aria-hidden', String(!nowCollapsed))
        expandedTitleRef.current?.setAttribute('aria-hidden', String(nowCollapsed))
      }
    }

    const handleScroll = () => {
      const scrollTop = readScrollTop()
      const delta = scrollTop - lastScrollTop
      lastScrollTop = scrollTop
      applyScrolled(scrollTop > 0)

      if (behavior === 'enterAlways') {
        offset = Math.min(Math.max(offset + delta, 0), bar.offsetHeight)
        applyOffset()
        if (snapTimer !== undefined) clearTimeout(snapTimer)
        snapTimer = setTimeout(() => {
          const height = bar.offsetHeight
          if (offset > 0 && offset < height) {
            offset = offset < height / 2 ? 0 : height
            bar.setAttribute('data-m3e-settling', 'true')
            applyOffset()
          }
        }, ENTER_ALWAYS_SNAP_IDLE_MS)
      } else if (behavior === 'exitUntilCollapsed') {
        const fraction =
          collapseRange > 0 ? Math.min(Math.max(scrollTop / collapseRange, 0), 1) : 0
        applyFraction(fraction)
      }
    }

    // A bar hidden by enterAlways must reveal when focus enters it, or a
    // keyboard user tabs into an off-screen control.
    const handleFocusIn = () => {
      if (behavior !== 'enterAlways' || offset === 0) return
      offset = 0
      bar.setAttribute('data-m3e-settling', 'true')
      applyOffset()
    }

    // The settle transition exists only for the snap and the focus reveal;
    // while actively scrolling the bar must track the finger exactly.
    const handleTransitionEnd = () => bar.removeAttribute('data-m3e-settling')
    const clearSettling = () => bar.removeAttribute('data-m3e-settling')

    // A page restored mid-scroll must not wait for the first scroll event —
    // but a page at rest writes nothing, because the stylesheet's resting
    // defaults already express fraction 0 and offset 0, and dirtying them at
    // mount would make server and client markup diverge for no state change.
    if (readScrollTop() > 0) handleScroll()

    target.addEventListener('scroll', handleScroll, { passive: true })
    target.addEventListener('scroll', clearSettling, { passive: true })
    bar.addEventListener('focusin', handleFocusIn)
    bar.addEventListener('transitionend', handleTransitionEnd)
    return () => {
      if (snapTimer !== undefined) clearTimeout(snapTimer)
      target.removeEventListener('scroll', handleScroll)
      target.removeEventListener('scroll', clearSettling)
      bar.removeEventListener('focusin', handleFocusIn)
      bar.removeEventListener('transitionend', handleTransitionEnd)
      bar.removeAttribute('data-m3e-scrolled')
      bar.removeAttribute('data-m3e-collapsed')
      bar.removeAttribute('data-m3e-settling')
      bar.style.removeProperty('--m3e-app-bar-offset')
      bar.style.removeProperty('--m3e-app-bar-collapsed-fraction')
      bar.style.removeProperty('--m3e-app-bar-top-title-alpha')
    }
  }, [
    behavior,
    barRef,
    expandedRowRef,
    collapsedTitleRef,
    expandedTitleRef,
    scrollContainer,
    fallbackCollapseRange,
  ])
}
