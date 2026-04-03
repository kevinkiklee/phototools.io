import { describe, it, expect } from 'vitest'
import { calcFOV } from '@/lib/math/fov'
import { calcDoF } from '@/lib/math/dof'
import { calcEV, shutterWithNd } from '@/lib/math/exposure'
import { rule500 } from '@/lib/math/startrail'
import { kelvinToRgb, complementary } from '@/lib/math/color'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import { TOOLS, getToolBySlug, getLiveTools } from '@/lib/data/tools'
import { GLOSSARY } from '@/lib/data/glossary'

describe('FOV calculations with real sensor data', () => {
  it('all sensors produce valid FOV at all focal lengths', () => {
    for (const sensor of SENSORS) {
      for (const fl of FOCAL_LENGTHS) {
        const fov = calcFOV(fl.value, sensor.cropFactor)
        expect(fov.horizontal).toBeGreaterThan(0)
        expect(fov.horizontal).toBeLessThan(180)
        expect(fov.vertical).toBeGreaterThan(0)
        expect(fov.vertical).toBeLessThan(fov.horizontal)
      }
    }
  })

  it('larger crop factor narrows FOV at same focal length', () => {
    const ff = calcFOV(50, 1.0)
    const apsc = calcFOV(50, 1.5)
    const m43 = calcFOV(50, 2.0)
    expect(ff.horizontal).toBeGreaterThan(apsc.horizontal)
    expect(apsc.horizontal).toBeGreaterThan(m43.horizontal)
  })
})

describe('DoF calculations with real sensor data', () => {
  it('all sensors produce valid DoF at common settings', () => {
    for (const sensor of SENSORS) {
      const coc = 0.03 / sensor.cropFactor
      const result = calcDoF({ focalLength: 50, aperture: 5.6, distance: 3, coc })
      expect(result.nearFocus).toBeGreaterThan(0)
      expect(result.nearFocus).toBeLessThan(3)
      expect(result.farFocus).toBeGreaterThan(3)
      expect(result.hyperfocal).toBeGreaterThan(0)
    }
  })
})

describe('Exposure math consistency', () => {
  it('EV is consistent across equivalent exposures', () => {
    const ev1 = calcEV(8, 1/125)    // f/8, 1/125s
    const ev2 = calcEV(5.6, 1/250)  // f/5.6, 1/250s - same EV
    expect(ev1).toBeCloseTo(ev2, 0)
  })

  it('ND filter doubles shutter speed per stop', () => {
    const base = 1/125
    const nd1 = shutterWithNd(base, 1)  // 1 stop
    const nd2 = shutterWithNd(base, 2)  // 2 stops
    expect(nd1).toBeCloseTo(base * 2, 6)
    expect(nd2).toBeCloseTo(base * 4, 6)
  })
})

describe('Star trail calculations with real sensor data', () => {
  it('wider lens allows longer exposure', () => {
    const wide = rule500(14, 1.0)
    const tele = rule500(200, 1.0)
    expect(wide).toBeGreaterThan(tele)
  })
})

describe('Tool registry integrity', () => {
  it('every tool has a unique slug', () => {
    const slugs = TOOLS.map(t => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('at least one tool is live', () => {
    expect(getLiveTools().length).toBeGreaterThan(0)
  })

  it('glossary relatedTool references resolve', () => {
    for (const term of GLOSSARY) {
      if (term.relatedTool) {
        expect(getToolBySlug(term.relatedTool)).toBeDefined()
      }
    }
  })
})

describe('Color temperature produces valid RGB', () => {
  it('daylight (6500K) is near-white', () => {
    const { r, g, b } = kelvinToRgb(6500)
    expect(r).toBeGreaterThan(200)
    expect(g).toBeGreaterThan(200)
    expect(b).toBeGreaterThan(200)
  })

  it('complementary hues are 180 degrees apart', () => {
    const hues = complementary(90)
    expect(hues).toHaveLength(2)
    expect(Math.abs(hues[1] - hues[0])).toBeCloseTo(180, 0)
  })
})
