import { readFileSync, readdirSync, existsSync } from 'fs'
import { join } from 'path'

const MESSAGES_DIR = 'src/lib/i18n/messages'
const BASE_LOCALE = 'en'

function getKeys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? getKeys(v, `${prefix}${k}.`)
      : [`${prefix}${k}`]
  )
}

function getJsonFiles(dir) {
  const files = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      files.push(...getJsonFiles(join(dir, entry.name)).map(f => join(entry.name, f)))
    } else if (entry.name.endsWith('.json')) {
      files.push(entry.name)
    }
  }
  return files
}

const baseDir = join(MESSAGES_DIR, BASE_LOCALE)
const jsonFiles = getJsonFiles(baseDir)
const locales = readdirSync(MESSAGES_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== BASE_LOCALE)
  .map(d => d.name)

let totalMissing = 0

for (const locale of locales) {
  const missing = []
  for (const file of jsonFiles) {
    const enPath = join(baseDir, file)
    const localePath = join(MESSAGES_DIR, locale, file)
    if (!existsSync(localePath)) {
      missing.push({ file, keys: ['ENTIRE FILE MISSING'] })
      continue
    }
    const enKeys = getKeys(JSON.parse(readFileSync(enPath, 'utf8')))
    const localeKeys = new Set(getKeys(JSON.parse(readFileSync(localePath, 'utf8'))))
    const missingKeys = enKeys.filter(k => !localeKeys.has(k))
    if (missingKeys.length > 0) {
      missing.push({ file, keys: missingKeys })
    }
  }
  if (missing.length > 0) {
    console.log(`\n${locale}: ${missing.reduce((s, m) => s + m.keys.length, 0)} missing key(s)`)
    for (const { file, keys } of missing) {
      console.log(`  ${file}: ${keys.join(', ')}`)
    }
    totalMissing += missing.reduce((s, m) => s + m.keys.length, 0)
  } else {
    console.log(`${locale}: all keys present`)
  }
}

if (totalMissing > 0) {
  console.log(`\nTotal missing: ${totalMissing}`)
  process.exit(1)
} else {
  console.log('\nAll translations complete.')
}
