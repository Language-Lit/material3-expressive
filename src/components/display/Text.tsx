// Text.tsx - Typography component
import React, { forwardRef, ElementType, Ref, CSSProperties } from 'react'
import clsx from 'clsx'

export type ColorVariant =
  | 'on-surface'
  | 'on-surface-variant'
  | 'on-primary'
  | 'on-primary-container'
  | 'on-secondary'
  | 'on-secondary-container'
  | 'on-tertiary'
  | 'on-tertiary-container'
  | 'on-error'
  | 'on-error-container'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'error'
  | 'outline'
  | 'outline-variant'

export type TextProps = {
  type?: 'display' | 'headline' | 'title' | 'label' | 'body'
  size?: 'large' | 'medium' | 'small'
  emphasis?: 'baseline' | 'emphasized'
  variant?: ColorVariant
  children: React.ReactNode
  className?: string
  style?: CSSProperties
  as?: keyof React.JSX.IntrinsicElements
} & Omit<React.HTMLAttributes<HTMLElement>, 'as' | 'style'>

const tagMapping: Record<
  'display' | 'headline' | 'title' | 'label' | 'body',
  Record<'large' | 'medium' | 'small', React.ElementType>
> = {
  display: { large: 'h1', medium: 'h2', small: 'h3' },
  headline: { large: 'h2', medium: 'h3', small: 'h4' },
  title: { large: 'h3', medium: 'h4', small: 'h5' },
  label: { large: 'label', medium: 'label', small: 'label' },
  body: { large: 'p', medium: 'p', small: 'p' },
}

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      type = 'body',
      size = 'large',
      emphasis = 'baseline',
      variant,
      children,
      className,
      style,
      as,
      ...rest
    },
    ref: Ref<HTMLElement>
  ) => {
    // Construct token prefix based on emphasis
    const emphasisPrefix = emphasis === 'emphasized' ? 'emphasized-' : ''
    const tokenBase = `--md-sys-typescale-${emphasisPrefix}${type}-${size}`

    // Build inline styles using CSS custom properties
    const typographyStyles: CSSProperties = {
      fontFamily: `var(${tokenBase}-font)`,
      fontSize: `var(${tokenBase}-size)`,
      fontWeight: `var(${tokenBase}-weight)`,
      lineHeight: `var(${tokenBase}-line-height)`,
      letterSpacing: `var(${tokenBase}-tracking)`,
      ...style,
    }

    // Apply color variant using inline style to avoid Turbopack CSS parsing issues with dynamic class names
    const colorStyle: CSSProperties = variant
      ? { color: `var(--md-sys-color-${variant})` }
      : {}

    const Tag: ElementType = as || tagMapping[type][size]

    return React.createElement(
      Tag,
      {
        ref,
        className: clsx(variant ? undefined : 'text-inherit', className),
        style: { ...typographyStyles, ...colorStyle },
        ...rest,
      },
      children
    )
  }
)

Text.displayName = 'Text'
