import { localeOpenGraph, type Locale } from '@/lib/i18n/routing'
import type { UnitSystem } from '@/lib/types'

const IMPERIAL_REGIONS = new Set(['US', 'LR', 'MM'])

export function defaultUnitSystemForLocale(locale: Locale): UnitSystem {
  const og = localeOpenGraph[locale]
  const region = og?.split('_')[1]
  return region && IMPERIAL_REGIONS.has(region) ? 'imperial' : 'metric'
}

export function mmToDisplay(mm: number, units: UnitSystem): string {
  if (units === 'imperial') return `${(mm / 25.4).toFixed(2)} in`
  return `${(mm / 10).toFixed(1)} cm`
}

export function formatPrintSize(
  preset: { label: string; wMm: number; hMm: number },
  units: UnitSystem,
): string {
  const w = mmToDisplay(preset.wMm, units).replace(/ (in|cm)$/, '')
  const h = mmToDisplay(preset.hMm, units)
  return `${preset.label} · ${w}×${h}`
}
