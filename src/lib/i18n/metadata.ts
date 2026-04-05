import { routing } from './routing'

/**
 * Generate alternates.languages for a given path (without locale prefix).
 * Example: getAlternates('/fov-simulator') → { en: '/en/fov-simulator', es: '/es/fov-simulator', ... }
 */
export function getAlternates(path: string) {
  return {
    languages: Object.fromEntries([
      ...routing.locales.map((l) => [l, `/${l}${path}`]),
      ['x-default', `/${routing.defaultLocale}${path}`],
    ]),
  }
}
