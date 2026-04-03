import { describe, it, expect } from 'vitest'
import { pixelPitch, diffractionLimitedAperture } from './diffraction'

describe('pixelPitch', () => {
  it('24MP FF sensor (36mm wide) has ~6µm pixel pitch', () => {
    // widthPixels = sqrt(24e6 * 1.5) = sqrt(36e6) = 6000
    // pitchMm = 36 / 6000 = 0.006 mm = 6 µm
    expect(pixelPitch(36, 24)).toBeCloseTo(6.0, 1)
  })

  it('45MP FF sensor (36mm wide) has smaller pixel pitch than 24MP', () => {
    const pitch24 = pixelPitch(36, 24)
    const pitch45 = pixelPitch(36, 45)
    expect(pitch45).toBeLessThan(pitch24)
  })

  it('12MP FF sensor has larger pixel pitch than 24MP', () => {
    const pitch12 = pixelPitch(36, 12)
    const pitch24 = pixelPitch(36, 24)
    expect(pitch12).toBeGreaterThan(pitch24)
  })

  it('24MP APS-C (23.5mm wide) has smaller pitch than 24MP FF', () => {
    const pitchFF = pixelPitch(36, 24)
    const pitchAPS = pixelPitch(23.5, 24)
    expect(pitchAPS).toBeLessThan(pitchFF)
  })

  it('45MP FF sensor pitch is ~4.4µm', () => {
    // widthPixels = sqrt(45e6 * 1.5) = sqrt(67.5e6) ≈ 8216
    // pitchMm = 36 / 8216 ≈ 0.00438 mm ≈ 4.38 µm
    expect(pixelPitch(36, 45)).toBeCloseTo(4.38, 1)
  })
})

describe('diffractionLimitedAperture', () => {
  it('24MP FF (~6µm pitch) diffraction limit is around f/8-f/9', () => {
    const limit = diffractionLimitedAperture(6.0)
    // 6.0 / 0.67 ≈ 8.96
    expect(limit).toBeGreaterThan(8)
    expect(limit).toBeLessThan(10)
  })

  it('higher resolution (smaller pitch) has lower diffraction limit', () => {
    const limit24mp = diffractionLimitedAperture(pixelPitch(36, 24))
    const limit45mp = diffractionLimitedAperture(pixelPitch(36, 45))
    expect(limit45mp).toBeLessThan(limit24mp)
  })

  it('12MP FF sensor has higher diffraction limit than 24MP', () => {
    const limit12 = diffractionLimitedAperture(pixelPitch(36, 12))
    const limit24 = diffractionLimitedAperture(pixelPitch(36, 24))
    expect(limit12).toBeGreaterThan(limit24)
  })
})
