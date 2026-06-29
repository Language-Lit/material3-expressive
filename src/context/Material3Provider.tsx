// Material3Provider.tsx - Dependency injection for framework primitives
//
// The library is framework-agnostic React. Components that need a link or an
// optimized image pull those primitives from this context instead of importing
// a framework directly. By default they render native <a> / <img>, so the
// library works standalone. Consumers (e.g. a Next.js app) can inject
// `next/link` and `next/image` once at the root.
'use client'

import React, { createContext, useContext } from 'react'

/** Props the library passes to the injected Link component. */
export interface M3LinkProps {
  href: string
  className?: string
  children?: React.ReactNode
  'aria-label'?: string
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  prefetch?: boolean
  // Passthrough for framework-specific props (e.g. next/link `scroll`, `replace`).
  [key: string]: any
}

/** Props the library passes to the injected Image component. */
export interface M3ImageProps {
  src: string
  alt: string
  className?: string
  style?: React.CSSProperties
  width?: number
  height?: number
  fill?: boolean
  sizes?: string
  priority?: boolean
  placeholder?: string
  blurDataURL?: string
  draggable?: boolean | 'true' | 'false'
  onLoad?: () => void
  // Passthrough for framework-specific props.
  [key: string]: any
}

export type LinkComponent = React.ComponentType<M3LinkProps>
export type ImageComponent = React.ComponentType<M3ImageProps>

/** Native anchor fallback. */
const DefaultLink: LinkComponent = ({ href, children, prefetch: _prefetch, ...rest }) => (
  <a href={href} {...rest}>
    {children}
  </a>
)

/** Native img fallback. Next.js-only props are dropped for the native element. */
const DefaultImage: ImageComponent = ({
  src,
  alt,
  fill: _fill,
  priority: _priority,
  placeholder: _placeholder,
  blurDataURL: _blurDataURL,
  ...rest
}) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} {...rest} />
)

export interface Material3ContextValue {
  Link: LinkComponent
  Image: ImageComponent
}

const Material3Context = createContext<Material3ContextValue>({
  Link: DefaultLink,
  Image: DefaultImage,
})

export interface Material3ProviderProps {
  children: React.ReactNode
  /** Override the link primitive (e.g. pass `next/link`). */
  Link?: LinkComponent
  /** Override the image primitive (e.g. pass `next/image`). */
  Image?: ImageComponent
}

export const Material3Provider = ({ children, Link, Image }: Material3ProviderProps) => (
  <Material3Context.Provider value={{ Link: Link ?? DefaultLink, Image: Image ?? DefaultImage }}>
    {children}
  </Material3Context.Provider>
)

/** Access the injected framework primitives. */
export const useMaterial3 = (): Material3ContextValue => useContext(Material3Context)
