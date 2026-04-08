import { describe, it, expect } from 'vitest'
import {
  printSizeMm, qualityTier, effectiveDpi,
  fileSizeBytes, cropOverlap,
} from './megapixel'

describe('printSizeMm', () => {
  it('6000×4000 at 300 DPI → 508×338.67 mm', () => {
    const { wMm, hMm } = printSizeMm(6000, 4000, 300)
    expect(wMm).toBeCloseTo(508, 0)
    expect(hMm).toBeCloseTo(338.67, 1)
  })
  it('4243×2828 at 240 DPI', () => {
    const { wMm } = printSizeMm(4243, 2828, 240)
    expect(wMm).toBeCloseTo(449.1, 1)
  })
})

describe('qualityTier', () => {
  it('300 DPI at arms length → excellent', () => {
    expect(qualityTier(300, 'arms')).toBe('excellent')
  })
  it('180 DPI at arms length → acceptable', () => {
    expect(qualityTier(180, 'arms')).toBe('acceptable')
  })
  it('100 DPI at arms length → soft', () => {
    expect(qualityTier(100, 'arms')).toBe('soft')
  })
  it('60 DPI at 6-foot distance → excellent (viewing distance adjusts threshold)', () => {
    expect(qualityTier(60, 'far')).toBe('excellent')
  })
})

describe('effectiveDpi', () => {
  it('300 DPI at arms length is ~300', () => {
    expect(effectiveDpi(300, 'arms')).toBeCloseTo(300, 0)
  })
  it('300 DPI at 6-foot distance is effectively much higher relative to eye acuity', () => {
    const effective = effectiveDpi(300, 'far')
    expect(effective).toBeGreaterThan(300)
  })
})

describe('fileSizeBytes', () => {
  it('24 MP JPEG ≈ 7.2 MB', () => {
    expect(fileSizeBytes(24, 'jpeg8')).toBeCloseTo(24e6 * 0.3, -4)
  })
  it('24 MP RAW 14-bit ≈ 42 MB', () => {
    expect(fileSizeBytes(24, 'raw14')).toBeCloseTo(24e6 * 1.75, -4)
  })
  it('24 MP TIFF 16-bit ≈ 144 MB', () => {
    expect(fileSizeBytes(24, 'tiff16')).toBeCloseTo(24e6 * 6, -4)
  })
})

describe('cropOverlap', () => {
  it('matching aspects → retained=1, no crop', () => {
    const r = cropOverlap(1.5, 1.5)
    expect(r.retained).toBe(1)
    expect(r.cropSide).toBe('none')
  })
  it('3:2 image onto 4:3 paper → sides cropped', () => {
    const r = cropOverlap(3 / 2, 4 / 3)
    expect(r.retained).toBeLessThan(1)
    expect(r.cropSide).toBe('left-right')
  })
  it('5:4 image onto 16:9 paper → top-bottom cropped', () => {
    const r = cropOverlap(5 / 4, 16 / 9)
    expect(r.cropSide).toBe('top-bottom')
  })
})
