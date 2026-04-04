import { describe, it, expect } from 'vitest'
import { getEducationBySlug, getAllEducation } from './index'
import { TOOLS } from '../tools'

describe('Education content', () => {
  it('every tool with education has valid structure', () => {
    for (const tool of TOOLS) {
      const edu = getEducationBySlug(tool.slug)
      if (!edu) continue
      expect(edu.slug).toBe(tool.slug)
      expect(edu.beginner).toBeTruthy()
      expect(edu.deeper).toBeTruthy()
      expect(Array.isArray(edu.tips)).toBe(true)
      expect(edu.tips.length).toBeGreaterThan(0)
      expect(typeof edu.tooltips).toBe('object')
    }
  })

  it('challenges have required fields', () => {
    for (const tool of TOOLS) {
      const edu = getEducationBySlug(tool.slug)
      if (!edu || !edu.challenges) continue
      for (const c of edu.challenges) {
        expect(c.id).toBeTruthy()
        expect(['beginner', 'intermediate', 'advanced']).toContain(c.difficulty)
        expect(c.scenario).toBeTruthy()
        expect(c.successMessage).toBeTruthy()
        expect(c.failureMessage).toBeTruthy()
      }
    }
  })

  it('tips have text', () => {
    for (const tool of TOOLS) {
      const edu = getEducationBySlug(tool.slug)
      if (!edu) continue
      for (const tip of edu.tips) {
        expect(tip.text).toBeTruthy()
      }
    }
  })

  it('returns undefined for unknown slug', () => {
    expect(getEducationBySlug('nonexistent-tool')).toBeUndefined()
  })

  it('getAllEducation returns all entries', () => {
    const all = getAllEducation()
    expect(all.length).toBeGreaterThan(0)
    for (const edu of all) {
      expect(edu.slug).toBeTruthy()
      expect(edu.beginner).toBeTruthy()
    }
  })

  it('education slugs are unique', () => {
    const all = getAllEducation()
    const slugs = all.map((e) => e.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('every education slug matches a tool slug or known sub-feature', () => {
    const toolSlugs = new Set(TOOLS.map((t) => t.slug))
    const knownSubFeatures = new Set(['histogram']) // histogram is part of exif-viewer
    const all = getAllEducation()
    for (const edu of all) {
      expect(toolSlugs.has(edu.slug) || knownSubFeatures.has(edu.slug)).toBe(true)
    }
  })

  it('challenge IDs are globally unique', () => {
    const all = getAllEducation()
    const ids: string[] = []
    for (const edu of all) {
      for (const c of edu.challenges) {
        ids.push(c.id)
      }
    }
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('challenges with options have a correctOption that matches one of the option values', () => {
    const all = getAllEducation()
    for (const edu of all) {
      for (const c of edu.challenges) {
        if (c.options && c.correctOption) {
          const values = c.options.map((o) => o.value)
          expect(values).toContain(c.correctOption)
        }
      }
    }
  })

  it('deeper field is either a string or array of sections with heading and text', () => {
    const all = getAllEducation()
    for (const edu of all) {
      if (typeof edu.deeper === 'string') {
        expect(edu.deeper.length).toBeGreaterThan(0)
      } else {
        expect(Array.isArray(edu.deeper)).toBe(true)
        for (const section of edu.deeper) {
          expect(section.heading).toBeTruthy()
          expect(section.text).toBeTruthy()
        }
      }
    }
  })
})
