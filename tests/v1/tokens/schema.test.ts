import {
  COLOR_ROLE_NAMES,
  MOTION_CATEGORY_NAMES,
  MOTION_SCHEME_NAMES,
  MOTION_SPEED_NAMES,
  PALETTE_TOKEN_NAMES,
  SHAPE_CORNER_VALUE_NAMES,
  SHAPE_ROLE_NAMES,
  STATE_OPACITY_NAMES,
  TYPOGRAPHY_EMPHASES,
  TYPOGRAPHY_ROLE_NAMES,
  defaultTokenSet,
  isDeeplyFrozen,
  validateTokenSet,
} from '../../../src/v1/tokens'

describe('default token schema', () => {
  it('contains every approved foundation domain and role', () => {
    expect(PALETTE_TOKEN_NAMES).toHaveLength(96)
    expect(COLOR_ROLE_NAMES).toHaveLength(49)
    expect(TYPOGRAPHY_EMPHASES).toEqual(['baseline', 'emphasized'])
    expect(TYPOGRAPHY_ROLE_NAMES).toHaveLength(15)
    expect(SHAPE_CORNER_VALUE_NAMES).toHaveLength(9)
    expect(SHAPE_ROLE_NAMES).toHaveLength(15)
    expect(MOTION_SCHEME_NAMES).toEqual(['standard', 'expressive'])
    expect(MOTION_SPEED_NAMES).toEqual(['fast', 'default', 'slow'])
    expect(MOTION_CATEGORY_NAMES).toEqual(['spatial', 'effects'])
    expect(STATE_OPACITY_NAMES).toEqual(['disabled', 'dragged', 'focus', 'hover', 'pressed'])
    expect(defaultTokenSet.system.elevation).toHaveProperty('level5')
    expect(defaultTokenSet.system.density).toEqual({
      scale: 0,
      minimumInteractiveTarget: '48px',
    })
  })

  it('is complete, source-traced, deeply immutable, and serializable', () => {
    expect(validateTokenSet(defaultTokenSet)).toEqual({ success: true, issues: [] })
    expect(defaultTokenSet.metadata.materialVersion).toBe('34.0.21')
    expect(defaultTokenSet.metadata.sources).toHaveLength(2)
    expect(defaultTokenSet.metadata.sources.every((source) => source.accessed === '2026-07-19')).toBe(true)
    expect(isDeeplyFrozen(defaultTokenSet)).toBe(true)
    expect(defaultTokenSet.componentTokens).toHaveLength(4)
    expect(defaultTokenSet.componentTokens).toContainEqual(expect.objectContaining({
      component: 'surface',
      task: 'T04',
      source: expect.objectContaining({ accessed: '2026-07-19' }),
    }))
    expect(defaultTokenSet.componentTokens).toContainEqual(expect.objectContaining({
      component: 'icon',
      task: 'T06',
      source: expect.objectContaining({ accessed: '2026-07-19' }),
    }))
    expect(defaultTokenSet.componentTokens).toContainEqual(expect.objectContaining({
      component: 'button',
      task: 'T07',
      source: expect.objectContaining({ accessed: '2026-07-19' }),
    }))
    expect(defaultTokenSet.componentTokens).toContainEqual(expect.objectContaining({
      component: 'icon-button',
      task: 'T08',
      source: expect.objectContaining({
        revision: 'f0793303999c933a40c10d79212e0580d21bdc68',
        accessed: '2026-07-19',
      }),
    }))

    const roundTrip = JSON.parse(JSON.stringify(defaultTokenSet))
    expect(validateTokenSet(roundTrip)).toEqual({ success: true, issues: [] })
  })

  it('keeps baseline and emphasized typography visually aligned except for emphasis weight', () => {
    for (const role of TYPOGRAPHY_ROLE_NAMES) {
      const baseline = defaultTokenSet.system.typography.baseline[role]
      const emphasized = defaultTokenSet.system.typography.emphasized[role]
      expect(emphasized.fontFamily).toEqual(baseline.fontFamily)
      expect(emphasized.fontSize).toBe(baseline.fontSize)
      expect(emphasized.lineHeight).toBe(baseline.lineHeight)
      expect(emphasized.letterSpacing).toBe(baseline.letterSpacing)
      expect(emphasized.axes.wght).toBeGreaterThan(baseline.axes.wght)
    }
  })
})
