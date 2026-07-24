import type { ComponentPropsWithRef } from 'react'

/**
 * Passive elements that can validly own divider styling. `hr` is the native
 * separator and the default; `li` exists because `ul`/`ol` accept only `li` and
 * script-supporting children; `div` covers layouts that forbid both.
 */
export type DividerElement = 'hr' | 'div' | 'li'

export type DividerOrientation = 'horizontal' | 'vertical'

interface DividerOwnProps {
  /** Axis the divider separates across, mapping Material's two divider composables. */
  readonly orientation?: DividerOrientation
  /**
   * Whether the line is purely visual. A decorative divider leaves the
   * accessibility tree; the default exposes it as a separator, because Material
   * dividers group content rather than only decorate it.
   */
  readonly decorative?: boolean
}

type DividerElementProp<TElement extends DividerElement> = TElement extends 'hr'
  ? { readonly as?: TElement }
  : { readonly as: TElement }

/**
 * Props for a Material divider. The generic element narrows native attributes
 * and the forwarded ref. `children` is excluded: a divider is an empty line and
 * its default element is void.
 */
export type DividerProps<TElement extends DividerElement = 'hr'> = DividerOwnProps &
  DividerElementProp<TElement> &
  Omit<ComponentPropsWithRef<TElement>, keyof DividerOwnProps | 'as' | 'children'>
