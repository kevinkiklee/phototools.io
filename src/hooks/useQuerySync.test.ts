import { describe, it, expect, beforeEach } from 'vitest'
import { parseQueryParams, stateToQueryString } from './useQuerySync'
import type { AppState } from '../types'
import { DEFAULT_STATE } from '../types'

describe('parseQueryParams', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/')
  })

  it('returns empty object for no params', () => {
    const result = parseQueryParams()
    expect(result.lenses).toBeUndefined()
    expect(result.theme).toBeUndefined()
  })

  it('parses lens A focal length', () => {
    window.history.replaceState(null, '', '/?a=50')
    const result = parseQueryParams()
    expect(result.lenses).toBeDefined()
    expect(result.lenses![0].focalLength).toBe(50)
  })

  it('parses lens B focal length', () => {
    window.history.replaceState(null, '', '/?a=35&b=85')
    const result = parseQueryParams()
    expect(result.lenses!.length).toBeGreaterThanOrEqual(2)
    expect(result.lenses![1].focalLength).toBe(85)
  })

  it('rejects focal length below 8', () => {
    window.history.replaceState(null, '', '/?a=2')
    const result = parseQueryParams()
    expect(result.lenses).toBeUndefined()
  })

  it('rejects focal length above 800', () => {
    window.history.replaceState(null, '', '/?a=1200')
    const result = parseQueryParams()
    expect(result.lenses).toBeUndefined()
  })

  it('rounds focal length to integer', () => {
    window.history.replaceState(null, '', '/?a=50.7')
    const result = parseQueryParams()
    expect(result.lenses![0].focalLength).toBe(51)
  })

  it('parses sensor IDs', () => {
    window.history.replaceState(null, '', '/?a=50&sa=apsc_n&b=85&sb=m43')
    const result = parseQueryParams()
    expect(result.lenses![0].sensorId).toBe('apsc_n')
    expect(result.lenses![1].sensorId).toBe('m43')
  })

  it('rejects invalid sensor IDs and falls back to ff', () => {
    window.history.replaceState(null, '', '/?a=50&sa=bogus')
    const result = parseQueryParams()
    expect(result.lenses![0].sensorId).toBe('ff')
  })

  it('parses image index', () => {
    window.history.replaceState(null, '', '/?img=3')
    const result = parseQueryParams()
    expect(result.imageIndex).toBe(3)
  })

  it('rejects out-of-range image index', () => {
    window.history.replaceState(null, '', '/?img=10')
    const result = parseQueryParams()
    expect(result.imageIndex).toBeUndefined()
  })

  it('parses theme', () => {
    window.history.replaceState(null, '', '/?theme=light')
    const result = parseQueryParams()
    expect(result.theme).toBe('light')
  })

  it('rejects invalid theme', () => {
    window.history.replaceState(null, '', '/?theme=blue')
    const result = parseQueryParams()
    expect(result.theme).toBeUndefined()
  })

  it('parses full URL with all params', () => {
    window.history.replaceState(null, '', '/?a=35&sa=ff&b=85&sb=apsc_n&img=2&theme=light')
    const result = parseQueryParams()
    expect(result.lenses![0].focalLength).toBe(35)
    expect(result.lenses![0].sensorId).toBe('ff')
    expect(result.lenses![1].focalLength).toBe(85)
    expect(result.lenses![1].sensorId).toBe('apsc_n')
    expect(result.imageIndex).toBe(2)
    expect(result.theme).toBe('light')
  })

  it('parses three lenses', () => {
    window.history.replaceState(null, '', '/?a=24&b=50&c=135')
    const result = parseQueryParams()
    expect(result.lenses!.length).toBe(3)
    expect(result.lenses![2].focalLength).toBe(135)
  })

  it('parses third lens sensor (sc)', () => {
    window.history.replaceState(null, '', '/?a=24&b=50&c=135&sc=m43')
    const result = parseQueryParams()
    expect(result.lenses!.length).toBe(3)
    expect(result.lenses![2].sensorId).toBe('m43')
  })

  it('collects only c lens if a and b are missing', () => {
    // parser skips invalid/missing entries and collects valid ones
    window.history.replaceState(null, '', '/?c=135')
    const result = parseQueryParams()
    expect(result.lenses!.length).toBe(1)
    expect(result.lenses![0].focalLength).toBe(135)
  })

  it('skips invalid b and still collects a and c', () => {
    // b is out of range, but a and c are valid — both get collected
    window.history.replaceState(null, '', '/?a=50&b=9999&c=135')
    const result = parseQueryParams()
    expect(result.lenses!.length).toBe(2)
    expect(result.lenses![0].focalLength).toBe(50)
    expect(result.lenses![1].focalLength).toBe(135)
  })
})

describe('stateToQueryString', () => {
  it('serializes default state', () => {
    const qs = stateToQueryString(DEFAULT_STATE)
    const params = new URLSearchParams(qs)
    expect(params.get('a')).toBe(String(DEFAULT_STATE.lenses[0].focalLength))
    expect(params.get('sa')).toBe('ff')
    expect(params.get('b')).toBe(String(DEFAULT_STATE.lenses[1].focalLength))
    expect(params.get('sb')).toBe('ff')
    expect(params.get('img')).toBe('0')
    expect(params.get('theme')).toBe('dark')
  })

  it('serializes custom state', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      lenses: [
        { focalLength: 24, sensorId: 'apsc_n' },
        { focalLength: 200, sensorId: 'm43' },
      ],
      theme: 'light',
      imageIndex: 3,
    }
    const qs = stateToQueryString(state)
    const params = new URLSearchParams(qs)
    expect(params.get('a')).toBe('24')
    expect(params.get('sa')).toBe('apsc_n')
    expect(params.get('b')).toBe('200')
    expect(params.get('sb')).toBe('m43')
    expect(params.get('theme')).toBe('light')
    expect(params.get('img')).toBe('3')
  })

  it('round-trips with parseQueryParams', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      lenses: [
        { focalLength: 50, sensorId: 'ff' },
        { focalLength: 135, sensorId: 'apsc_c' },
      ],
      imageIndex: 2,
      theme: 'light',
    }
    const qs = stateToQueryString(state)
    window.history.replaceState(null, '', `/?${qs}`)
    const parsed = parseQueryParams()

    expect(parsed.lenses![0].focalLength).toBe(50)
    expect(parsed.lenses![0].sensorId).toBe('ff')
    expect(parsed.lenses![1].focalLength).toBe(135)
    expect(parsed.lenses![1].sensorId).toBe('apsc_c')
    expect(parsed.imageIndex).toBe(2)
    expect(parsed.theme).toBe('light')
  })

  it('serializes three lenses', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      lenses: [
        { focalLength: 24, sensorId: 'ff' },
        { focalLength: 85, sensorId: 'apsc_n' },
        { focalLength: 200, sensorId: 'm43' },
      ],
    }
    const qs = stateToQueryString(state)
    const params = new URLSearchParams(qs)
    expect(params.get('a')).toBe('24')
    expect(params.get('sa')).toBe('ff')
    expect(params.get('b')).toBe('85')
    expect(params.get('sb')).toBe('apsc_n')
    expect(params.get('c')).toBe('200')
    expect(params.get('sc')).toBe('m43')
  })

  it('three-lens state round-trips with parseQueryParams', () => {
    const state: AppState = {
      ...DEFAULT_STATE,
      lenses: [
        { focalLength: 14, sensorId: 'mf' },
        { focalLength: 50, sensorId: 'ff' },
        { focalLength: 400, sensorId: '1in' },
      ],
      theme: 'dark',
      imageIndex: 1,
    }
    const qs = stateToQueryString(state)
    window.history.replaceState(null, '', `/?${qs}`)
    const parsed = parseQueryParams()

    expect(parsed.lenses!.length).toBe(3)
    expect(parsed.lenses![0].focalLength).toBe(14)
    expect(parsed.lenses![0].sensorId).toBe('mf')
    expect(parsed.lenses![1].focalLength).toBe(50)
    expect(parsed.lenses![1].sensorId).toBe('ff')
    expect(parsed.lenses![2].focalLength).toBe(400)
    expect(parsed.lenses![2].sensorId).toBe('1in')
    expect(parsed.imageIndex).toBe(1)
    expect(parsed.theme).toBe('dark')
  })
})
