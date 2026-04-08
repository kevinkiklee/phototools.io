import { describe, it, expect } from 'vitest'
import { mpToPixelDimensions, formatAspectRatio, cropReach } from './resolution'

describe('mpToPixelDimensions', () => {
  it('24 MP at 3:2 → 6000 × 4000', () => {
    const { pxW, pxH } = mpToPixelDimensions(24, { w: 3, h: 2 })
    expect(pxW).toBe(6000)
    expect(pxH).toBe(4000)
  })

  it('12 MP at 3:2 → ~4243 × 2828', () => {
    const { pxW, pxH } = mpToPixelDimensions(12, { w: 3, h: 2 })
    expect(pxW).toBeCloseTo(4243, -1)
    expect(pxH).toBeCloseTo(2828, -1)
  })

  it('24 MP at 1:1 → ~4899 × 4899', () => {
    const { pxW, pxH } = mpToPixelDimensions(24, { w: 1, h: 1 })
    expect(pxW).toBeCloseTo(4899, -1)
    expect(pxH).toBeCloseTo(4899, -1)
  })

  it('45 MP at 3:2 → ~8216 × 5477', () => {
    const { pxW } = mpToPixelDimensions(45, { w: 3, h: 2 })
    expect(pxW).toBeCloseTo(8216, -1)
  })
})

describe('formatAspectRatio', () => {
  it('snaps 36:24 to 3:2', () => {
    expect(formatAspectRatio(36, 24)).toBe('3:2')
  })
  it('snaps 17.3:13 to 4:3', () => {
    expect(formatAspectRatio(17.3, 13)).toBe('4:3')
  })
  it('handles 1:1', () => {
    expect(formatAspectRatio(10, 10)).toBe('1:1')
  })
  it('returns raw ratio for uncommon inputs', () => {
    expect(formatAspectRatio(31, 19)).toMatch(/^\d+:\d+$/)
  })
})

describe('cropReach', () => {
  it('45 MP at APS-C 1.5× → 20 MP', () => {
    expect(cropReach(45, 1.5)).toBeCloseTo(20, 1)
  })
  it('24 MP at M4/3 2.0× → 6 MP', () => {
    expect(cropReach(24, 2.0)).toBe(6)
  })
  it('FF 1.0× → same MP', () => {
    expect(cropReach(50, 1.0)).toBe(50)
  })
})
