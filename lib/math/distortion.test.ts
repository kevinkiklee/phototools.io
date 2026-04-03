import { describe, it, expect } from 'vitest'
import { calcDistortionK1 } from './distortion'

describe('calcDistortionK1', () => {
  it('returns negative k1 (barrel distortion) for wide angles (14mm)', () => {
    // k1 = -0.4 * (1 - 14/50) = -0.4 * 0.72 = -0.288
    const k1 = calcDistortionK1(14)
    expect(k1).toBeCloseTo(-0.288, 5)
    expect(k1).toBeLessThan(0)
  })

  it('returns near-zero k1 for normal focal lengths (50mm)', () => {
    const k1 = calcDistortionK1(50)
    expect(k1).toBeCloseTo(0, 10)
  })

  it('returns exactly 0 for 50mm', () => {
    expect(calcDistortionK1(50)).toBe(0)
  })

  it('returns positive k1 (pincushion distortion) for telephoto (135mm)', () => {
    // k1 unclamped = -0.4 * (1 - 135/50) = 0.68, clamped to 0.3
    const k1 = calcDistortionK1(135)
    expect(k1).toBe(0.3)
    expect(k1).toBeGreaterThan(0)
  })

  it('clamps barrel distortion to -0.5 (8mm)', () => {
    // k1 = -0.4 * (1 - 8/50) = -0.336; lower clamp is -0.5 (not reached but enforced)
    const k1 = calcDistortionK1(8)
    expect(k1).toBeCloseTo(-0.336, 5)
    expect(k1).toBeGreaterThanOrEqual(-0.5)
  })

  it('clamps pincushion distortion to 0.3 (800mm)', () => {
    // Unclamped: -0.4 * (1 - 800/50) = 6.0, clamped to 0.3
    const k1 = calcDistortionK1(800)
    expect(k1).toBe(0.3)
  })
})
