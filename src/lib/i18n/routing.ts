import { defineRouting } from 'next-intl/routing'

export const locales = ['en', 'es', 'ja', 'de', 'fr'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'en'

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',
}

export const localeOpenGraph: Record<Locale, string> = {
  en: 'en_US',
  es: 'es_ES',
  ja: 'ja_JP',
  de: 'de_DE',
  fr: 'fr_FR',
}

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: 'always',
})
