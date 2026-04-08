import { describe, it, expect } from 'vitest'
import { ASPECT_RATIOS, DEFAULT_ASPECT_ID, getAspect } from './aspectRatios'

describe('ASPECT_RATIOS', () => {
  it('contains 6 entries', () => {
    expect(ASPECT_RATIOS).toHaveLength(6)
  })

  it('all entries have positive w/h', () => {
    for (const a of ASPECT_RATIOS) {
      expect(a.w).toBeGreaterThan(0)
      expect(a.h).toBeGreaterThan(0)
      expect(a.label).toBeTruthy()
      expect(a.id).toMatch(/^[0-9]+x[0-9]+$/)
    }
  })

  it('ids are unique', () => {
    const ids = ASPECT_RATIOS.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes 3:2, 4:3, 16:9, 1:1, 5:4, 7:5', () => {
    const ids = ASPECT_RATIOS.map(a => a.id)
    expect(ids).toEqual(expect.arrayContaining(['3x2', '4x3', '16x9', '1x1', '5x4', '7x5']))
  })
})

describe('getAspect', () => {
  it('returns the matching aspect', () => {
    expect(getAspect('3x2').label).toBe('3:2')
  })

  it('falls back to 3:2 for unknown ids', () => {
    expect(getAspect('bogus').id).toBe('3x2')
  })
})

describe('DEFAULT_ASPECT_ID', () => {
  it('is 3x2', () => {
    expect(DEFAULT_ASPECT_ID).toBe('3x2')
  })
})
