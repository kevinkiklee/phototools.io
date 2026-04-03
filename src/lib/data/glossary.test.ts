import { describe, it, expect } from 'vitest'
import { GLOSSARY } from './glossary'
import { TOOLS } from './tools'

describe('GLOSSARY', () => {
  it('has 50+ terms', () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(50)
  })
  it('terms are unique', () => {
    const terms = GLOSSARY.map(g => g.term.toLowerCase())
    expect(new Set(terms).size).toBe(terms.length)
  })
  it('all terms have definitions', () => {
    for (const g of GLOSSARY) {
      expect(g.term).toBeTruthy()
      expect(g.definition).toBeTruthy()
    }
  })
  it('relatedTool slugs match actual tools', () => {
    const toolSlugs = new Set(TOOLS.map(t => t.slug))
    for (const g of GLOSSARY) {
      if (g.relatedTool) {
        expect(toolSlugs.has(g.relatedTool)).toBe(true)
      }
    }
  })
  it('terms are sorted alphabetically', () => {
    for (let i = 1; i < GLOSSARY.length; i++) {
      expect(GLOSSARY[i].term.toLowerCase() >= GLOSSARY[i-1].term.toLowerCase()).toBe(true)
    }
  })
})
