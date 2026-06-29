'use client'

import { useState, useEffect, useRef } from 'react'

interface IntersectionOnceOptions {
  rootMargin?: string
  threshold?: number
}

/**
 * Hook that detects when an element has entered the viewport at least once.
 * Returns hasIntersected which becomes true and stays true forever.
 * Use this for progressive loading (e.g., iframe loading attribute).
 */
export function useIntersectionOnce(options: IntersectionOnceOptions = {}) {
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true)
          // Unobserve once intersected since we don't need to track anymore
          if (ref.current) {
            observer.unobserve(ref.current)
          }
        }
      },
      {
        rootMargin: options.rootMargin || '1000px 0px',
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

  return { ref, hasIntersected }
}
