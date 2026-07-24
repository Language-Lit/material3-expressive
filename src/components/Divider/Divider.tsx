import {
  forwardRef,
  type ElementType,
  type ForwardedRef,
  type HTMLAttributes,
  type ReactElement,
} from 'react'
import type { DividerElement, DividerOrientation, DividerProps } from './Divider.types'

interface DividerImplementationProps extends HTMLAttributes<HTMLElement> {
  readonly as?: DividerElement
  readonly orientation?: DividerOrientation
  readonly decorative?: boolean
}

interface DividerComponent {
  <TElement extends DividerElement = 'hr'>(props: DividerProps<TElement>): ReactElement | null
  displayName?: string
}

/**
 * `hr` carries an implicit `separator` role, so a semantic divider needs no
 * explicit role and a decorative one must have it removed. `div` carries no
 * implicit semantics, so the reverse holds. `li` is a required owned element of
 * its list, so both cases are explicit.
 */
function resolveRole(as: DividerElement, decorative: boolean): string | undefined {
  if (decorative) return as === 'div' ? undefined : 'none'
  return as === 'hr' ? undefined : 'separator'
}

/** `separator` defaults to a horizontal orientation, so only vertical is emitted. */
function resolveAriaOrientation(
  orientation: DividerOrientation,
  decorative: boolean,
): 'vertical' | undefined {
  return !decorative && orientation === 'vertical' ? 'vertical' : undefined
}

function DividerRender(
  {
    as = 'hr',
    orientation = 'horizontal',
    decorative = false,
    className,
    ...elementProps
  }: DividerImplementationProps,
  forwardedRef: ForwardedRef<HTMLElement>,
) {
  const Element = as as ElementType
  const mergedClassName = className ? `m3e-divider ${className}` : 'm3e-divider'

  return (
    <Element
      {...elementProps}
      ref={forwardedRef}
      className={mergedClassName}
      data-m3e-orientation={orientation}
      role={resolveRole(as, decorative)}
      aria-orientation={resolveAriaOrientation(orientation, decorative)}
    />
  )
}

const ForwardedDivider = forwardRef<HTMLElement, DividerImplementationProps>(DividerRender)
ForwardedDivider.displayName = 'Divider'

export const Divider = ForwardedDivider as DividerComponent
