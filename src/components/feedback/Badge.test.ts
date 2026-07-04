import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { formatBadgeLabel } from './Badge'

/**
 * Feature: material3-expressive-lib
 * Badge label formatting per the M3 badge spec: the large badge label should
 * not exceed 4 characters — numeric values above `max` render as "{max}+".
 */
describe('Badge label formatting', () => {
  it('renders numbers up to max verbatim', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 999 }), (n) => {
        expect(formatBadgeLabel(n, 999)).toBe(`${n}`)
      })
    )
  })

  it('caps numbers above max as "{max}+"', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 1_000_000 }), (n) => {
        expect(formatBadgeLabel(n, 999)).toBe('999+')
      })
    )
  })

  it('never exceeds 4 characters for numeric values with the default cap', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1_000_000 }), (n) => {
        expect(formatBadgeLabel(n, 999).length).toBeLessThanOrEqual(4)
      })
    )
  })

  it('passes string values through untouched', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 0, maxLength: 8 }), (s) => {
        expect(formatBadgeLabel(s, 999)).toBe(s)
      })
    )
  })
})
