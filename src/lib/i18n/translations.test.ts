import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { locales, defaultLocale } from './routing'

const MESSAGES_DIR = join(__dirname, 'messages')

function getKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? getKeys(v as Record<string, unknown>, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

function getJsonFiles(dir: string): string[] {
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...getJsonFiles(join(dir, entry.name)).map(f => join(entry.name, f)))
    } else if (entry.name.endsWith('.json')) {
      files.push(entry.name)
    }
  }
  return files
}

const baseDir = join(MESSAGES_DIR, defaultLocale)
const jsonFiles = getJsonFiles(baseDir)
const nonDefaultLocales = locales.filter(l => l !== defaultLocale)

describe('Translation file completeness', () => {
  it('base locale (en) has translation files', () => {
    expect(jsonFiles.length).toBeGreaterThan(0)
  })

  for (const locale of nonDefaultLocales) {
    describe(`locale: ${locale}`, () => {
      it('has all JSON files that en has', () => {
        const missing: string[] = []
        for (const file of jsonFiles) {
          const localePath = join(MESSAGES_DIR, locale, file)
          if (!existsSync(localePath)) {
            missing.push(file)
          }
        }
        expect(missing).toEqual([])
      })

      it('has all translation keys that en has', () => {
        const missingKeys: { file: string; keys: string[] }[] = []
        for (const file of jsonFiles) {
          const localePath = join(MESSAGES_DIR, locale, file)
          if (!existsSync(localePath)) continue
          const enKeys = getKeys(JSON.parse(readFileSync(join(baseDir, file), 'utf8')))
          const localeKeys = new Set(getKeys(JSON.parse(readFileSync(localePath, 'utf8'))))
          const missing = enKeys.filter(k => !localeKeys.has(k))
          if (missing.length > 0) {
            missingKeys.push({ file, keys: missing })
          }
        }
        expect(missingKeys).toEqual([])
      })
    })
  }
})
