import { describe, it, expect } from 'vitest'
import { TOOL_FAQS, getFaqsBySlug } from './faq'
import { getToolBySlug } from './tools'

describe('faq', () => {
  it('every FAQ slug resolves to a registered tool', () => {
    for (const faq of TOOL_FAQS) {
      expect(getToolBySlug(faq.slug)).toBeDefined()
    }
  })

  it('every FAQ entry has at least one question', () => {
    for (const faq of TOOL_FAQS) {
      expect(faq.questions.length).toBeGreaterThan(0)
    }
  })

  it('question ids are unique within each tool', () => {
    for (const faq of TOOL_FAQS) {
      const ids = faq.questions.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('question ids use kebab-case slug format', () => {
    for (const faq of TOOL_FAQS) {
      for (const q of faq.questions) {
        expect(q.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      }
    }
  })

  it('getFaqsBySlug returns the matching tool faqs', () => {
    const fov = getFaqsBySlug('fov-simulator')
    expect(fov).toBeDefined()
    expect(fov?.slug).toBe('fov-simulator')
    expect(fov?.questions.length).toBeGreaterThan(0)
  })

  it('getFaqsBySlug returns undefined for unknown slug', () => {
    expect(getFaqsBySlug('nonexistent-tool')).toBeUndefined()
  })

  it('tool slugs appear at most once in TOOL_FAQS', () => {
    const slugs = TOOL_FAQS.map((f) => f.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})
