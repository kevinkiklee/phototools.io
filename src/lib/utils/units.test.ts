import { describe, it, expect } from 'vitest'
import { defaultUnitSystemForLocale, mmToDisplay, formatPrintSize } from './units'

describe('defaultUnitSystemForLocale', () => {
  it('returns imperial for en (en_US)', () => {
    expect(defaultUnitSystemForLocale('en')).toBe('imperial')
  })
  it('returns metric for de', () => {
    expect(defaultUnitSystemForLocale('de')).toBe('metric')
  })
  it('returns metric for ja', () => {
    expect(defaultUnitSystemForLocale('ja')).toBe('metric')
  })
  it('returns metric for es', () => {
    expect(defaultUnitSystemForLocale('es')).toBe('metric')
  })
})

describe('mmToDisplay', () => {
  it('formats mm as cm for metric', () => {
    expect(mmToDisplay(210, 'metric')).toBe('21.0 cm')
  })
  it('formats mm as inches for imperial', () => {
    expect(mmToDisplay(254, 'imperial')).toBe('10.00 in')
  })
})

describe('formatPrintSize', () => {
  it('formats A4 metric', () => {
    const out = formatPrintSize({ label: 'A4', wMm: 210, hMm: 297 }, 'metric')
    expect(out).toContain('A4')
    expect(out).toContain('21.0')
    expect(out).toContain('29.7')
    expect(out).toContain('cm')
  })
  it('formats 8×10 imperial', () => {
    const out = formatPrintSize({ label: '8×10', wMm: 203.2, hMm: 254 }, 'imperial')
    expect(out).toContain('8')
    expect(out).toContain('10')
    expect(out).toContain('in')
  })
})
