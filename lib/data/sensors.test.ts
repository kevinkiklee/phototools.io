import { describe, it, expect } from 'vitest'
import { SENSORS, getSensor } from './sensors'

describe('SENSORS', () => {
  it('contains 6 sensors', () => { expect(SENSORS).toHaveLength(6) })
  it('all have valid crop factors > 0', () => {
    for (const s of SENSORS) {
      expect(s.cropFactor).toBeGreaterThan(0)
      expect(s.id).toBeTruthy()
      expect(s.name).toBeTruthy()
    }
  })
  it('has unique IDs', () => {
    const ids = SENSORS.map(s => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('is sorted by ascending crop factor', () => {
    for (let i = 1; i < SENSORS.length; i++) {
      expect(SENSORS[i].cropFactor).toBeGreaterThanOrEqual(SENSORS[i-1].cropFactor)
    }
  })
  it('has full frame with crop factor 1.0', () => {
    const ff = SENSORS.find(s => s.id === 'ff')
    expect(ff?.cropFactor).toBe(1.0)
  })
})

describe('getSensor', () => {
  it('returns matching sensor', () => {
    expect(getSensor('ff').cropFactor).toBe(1.0)
    expect(getSensor('apsc_n').cropFactor).toBe(1.5)
  })
  it('falls back to full frame for unknown ID', () => {
    expect(getSensor('unknown').id).toBe('ff')
  })
  it('falls back for empty string', () => {
    expect(getSensor('').id).toBe('ff')
  })
})
