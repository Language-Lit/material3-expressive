/**
 * jsdom implements no layout engine, so a scroll container there has no size, no
 * scrollable overflow, and no scroll position — and `ResizeObserver`,
 * `matchMedia`, `scrollTo`, and `scrollIntoView` are missing or inert. All of
 * that is a test-environment gap rather than a product concern: every target
 * browser implements them natively.
 *
 * The stubs are installed on `HTMLElement.prototype` and answer only for a
 * carousel root, so they are in place *before* the component mounts. That matters:
 * a real browser has layout by the time effects run, and a suite that installed
 * sizes afterwards would never exercise the mount-time layout pass.
 *
 * What this reproduces is exactly the surface the carousel reads, so a jsdom
 * suite can assert on what the layout and paint passes *write* — masks,
 * translations, snap offsets, the focal index — without pretending to verify
 * geometry the browser audit is responsible for.
 */
export interface CarouselLayoutController {
  /** Moves the container's logical scroll offset and fires a `scroll` event. */
  readonly scrollTo: (offset: number) => void
  /** Reports the container's current logical scroll offset. */
  readonly scrollOffset: () => number
  /** Turns the reduced-motion preference on or off, firing `change` listeners. */
  readonly setReducedMotion: (reduce: boolean) => void
  /** Changes the container's main-axis size and fires its resize observation. */
  readonly resize: (mainAxisSize: number) => void
}

export interface CarouselLayoutOptions {
  /** Inline size for a horizontal carousel, block size for a vertical one. */
  readonly mainAxisSize: number
  readonly crossAxisSize?: number
  readonly vertical?: boolean
  /** Total laid-out content size along the main axis. Defaults to eight screens. */
  readonly contentSize?: number
}

const resizeCallbacks = new Set<() => void>()
const scrollOffsets = new WeakMap<HTMLElement, number>()

let reduceMotion = false
const motionListeners = new Set<(event: MediaQueryListEvent) => void>()

function isCarouselRoot(element: HTMLElement): boolean {
  return element.classList?.contains('m3e-carousel') ?? false
}

/**
 * Installs the environment stubs and the container geometry. Call before
 * rendering; the returned controller drives scroll, resize, and the motion
 * preference.
 */
export function installCarouselLayout(options: CarouselLayoutOptions): CarouselLayoutController {
  const vertical = options.vertical ?? false
  let mainAxisSize = options.mainAxisSize
  const crossAxisSize = options.crossAxisSize ?? 220
  const contentSize = options.contentSize ?? options.mainAxisSize * 8

  resizeCallbacks.clear()
  motionListeners.clear()
  reduceMotion = false

  const own = (property: string) =>
    Object.getOwnPropertyDescriptor(HTMLElement.prototype, property) ??
    Object.getOwnPropertyDescriptor(Element.prototype, property)

  const define = (property: string, value: (element: HTMLElement) => number) => {
    const fallback = own(property)
    Object.defineProperty(HTMLElement.prototype, property, {
      configurable: true,
      get(this: HTMLElement) {
        if (isCarouselRoot(this)) return value(this)
        return fallback?.get?.call(this) ?? 0
      },
    })
  }

  define('clientWidth', () => (vertical ? crossAxisSize : mainAxisSize))
  define('clientHeight', () => (vertical ? mainAxisSize : crossAxisSize))
  define('scrollWidth', () => (vertical ? crossAxisSize : contentSize))
  define('scrollHeight', () => (vertical ? contentSize : crossAxisSize))

  const offsetProperty = vertical ? 'scrollTop' : 'scrollLeft'
  const offsetFallback = own(offsetProperty)
  Object.defineProperty(HTMLElement.prototype, offsetProperty, {
    configurable: true,
    get(this: HTMLElement) {
      if (isCarouselRoot(this)) return scrollOffsets.get(this) ?? 0
      return offsetFallback?.get?.call(this) ?? 0
    },
    set(this: HTMLElement, next: number) {
      if (isCarouselRoot(this)) {
        scrollOffsets.set(this, next)
        return
      }
      offsetFallback?.set?.call(this, next)
    },
  })

  Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value(this: HTMLElement, arg: ScrollToOptions | number) {
      if (!isCarouselRoot(this)) return
      const next = typeof arg === 'number' ? arg : ((vertical ? arg.top : arg.left) ?? 0)
      scrollOffsets.set(this, Math.abs(next))
      this.dispatchEvent(new Event('scroll'))
    },
  })

  Object.defineProperty(window, 'ResizeObserver', {
    configurable: true,
    value: class {
      constructor(private readonly callback: () => void) {}
      observe() {
        resizeCallbacks.add(this.callback)
      }
      unobserve() {
        resizeCallbacks.delete(this.callback)
      }
      disconnect() {
        resizeCallbacks.delete(this.callback)
      }
    },
  })

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: (query: string): MediaQueryList =>
      ({
        media: query,
        get matches() {
          return query.includes('prefers-reduced-motion: reduce') ? reduceMotion : false
        },
        onchange: null,
        addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          motionListeners.add(listener)
        },
        removeEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
          motionListeners.delete(listener)
        },
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => true,
      }) as MediaQueryList,
  })

  // The paint pass schedules on a frame; running the callback synchronously keeps
  // the suite free of timers without changing what is written.
  Object.defineProperty(window, 'requestAnimationFrame', {
    configurable: true,
    value: (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    },
  })
  Object.defineProperty(window, 'cancelAnimationFrame', { configurable: true, value: () => {} })
  Object.defineProperty(Element.prototype, 'scrollIntoView', {
    configurable: true,
    value: () => {},
  })

  const container = (): HTMLElement | null => document.querySelector('.m3e-carousel')

  return {
    scrollTo(next: number) {
      const element = container()
      if (element === null) return
      scrollOffsets.set(element, next)
      element.dispatchEvent(new Event('scroll'))
    },
    scrollOffset() {
      const element = container()
      return element === null ? 0 : (scrollOffsets.get(element) ?? 0)
    },
    setReducedMotion(reduce: boolean) {
      reduceMotion = reduce
      const event = {
        matches: reduce,
        media: '(prefers-reduced-motion: reduce)',
      } as MediaQueryListEvent
      motionListeners.forEach((listener) => listener(event))
    },
    resize(nextMainAxisSize: number) {
      mainAxisSize = nextMainAxisSize
      resizeCallbacks.forEach((callback) => callback())
    },
  }
}

/** Gives a multi-aspect item the intrinsic box a browser would measure. */
export function stubItemBox(
  item: HTMLElement,
  box: { readonly width: number; readonly height: number; readonly left: number },
): void {
  Object.defineProperty(item, 'offsetWidth', { configurable: true, get: () => box.width })
  Object.defineProperty(item, 'offsetHeight', { configurable: true, get: () => box.height })
  Object.defineProperty(item, 'offsetLeft', { configurable: true, get: () => box.left })
}

/** Every carousel item element, in document order. */
export function carouselItems(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-m3e-carousel-item]'))
}

/** A written pixel length as a number, or `null` when the property is absent. */
export function readPixels(element: HTMLElement, property: string): number | null {
  const raw = element.style.getPropertyValue(property)
  if (raw === '') return null
  return Number.parseFloat(raw)
}
