import { describe, it, expect } from 'vitest'
import { calcFOV, calcFrameWidth, calcEquivFocalLength, calcCropRatio } from './fov'

describe('calcFOV', () => {
  it('calculates FOV for 50mm full frame', () => {
    const fov = calcFOV(50, 1.0)
    expect(fov.horizontal).toBeCloseTo(39.6, 1)
    expect(fov.vertical).toBeCloseTo(27.0, 1)
  })

  it('calculates FOV for 35mm full frame', () => {
    const fov = calcFOV(35, 1.0)
    expect(fov.horizontal).toBeCloseTo(54.4, 1)
    expect(fov.vertical).toBeCloseTo(37.8, 1)
  })

  it('applies crop factor', () => {
    const apsc = calcFOV(50, 1.5)
    const ff75 = calcFOV(75, 1.0)
    expect(apsc.horizontal).toBeCloseTo(ff75.horizontal, 1)
    expect(apsc.vertical).toBeCloseTo(ff75.vertical, 1)
  })
})

describe('calcFrameWidth', () => {
  it('calculates frame width at distance', () => {
    const fov = calcFOV(50, 1.0)
    const width = calcFrameWidth(fov.horizontal, 10)
    expect(width).toBeCloseTo(7.3, 0)
  })
})

describe('calcEquivFocalLength', () => {
  it('returns equivalent focal length', () => {
    expect(calcEquivFocalLength(50, 1.5)).toBe(75)
  })

  it('returns same value for full frame', () => {
    expect(calcEquivFocalLength(50, 1.0)).toBe(50)
  })
})

describe('calcCropRatio', () => {
  it('returns 1 when both lenses have same FOV', () => {
    const fovA = calcFOV(50, 1.0)
    const fovB = calcFOV(50, 1.0)
    expect(calcCropRatio(fovA.horizontal, fovB.horizontal)).toBeCloseTo(1, 2)
  })

  it('returns ratio < 1 for narrower FOV', () => {
    const wide = calcFOV(35, 1.0)
    const tele = calcFOV(85, 1.0)
    const ratio = calcCropRatio(tele.horizontal, wide.horizontal)
    expect(ratio).toBeLessThan(1)
    expect(ratio).toBeGreaterThan(0)
  })
})
