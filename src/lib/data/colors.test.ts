import { describe, it, expect } from 'vitest'
import { CUSTOM_ENTRY_COLORS } from './colors'

describe('CUSTOM_ENTRY_COLORS', () => {
  it('is non-empty', () => {
    expect(CUSTOM_ENTRY_COLORS.length).toBeGreaterThan(0)
  })

  it('all entries are valid 6-digit hex colors', () => {
    for (const c of CUSTOM_ENTRY_COLORS) {
      expect(c).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('has no duplicates', () => {
    expect(new Set(CUSTOM_ENTRY_COLORS).size).toBe(CUSTOM_ENTRY_COLORS.length)
  })
})
