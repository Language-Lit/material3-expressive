'use client'

import { useState, useEffect, useRef } from 'react'

interface IntersectionObserverOptions {
  rootMargin?: string
  threshold?: number
}

/**
 * Hook that tracks whether an element is currently in the viewport.
 * Returns isInView which toggles as the element enters/exits the viewport.
 * Use this for virtualization and conditional rendering.
 */
export function useIntersectionObserver(options: IntersectionObserverOptions = {}) {
  const [isInView, setIsInView] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
      },
      {
        rootMargin: options.rootMargin || '2000px 0px', // Large margin to pre-render nearby blocks
        threshold: options.threshold || 0
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [options.rootMargin, options.threshold])

  return { ref, isInView }
}
