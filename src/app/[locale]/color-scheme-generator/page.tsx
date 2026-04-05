import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { ColorHarmony } from './_components/ColorHarmony'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.color-scheme-generator')
  return { title: t('title'), description: t('description'), alternates: getAlternates('/color-scheme-generator') }
}

export default function ColorSchemeGeneratorPage() {
  return <ColorHarmony />
}
