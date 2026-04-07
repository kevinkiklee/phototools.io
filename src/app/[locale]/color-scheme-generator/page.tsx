import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { ColorHarmony } from './_components/ColorHarmony'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.color-scheme-generator')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/color-scheme-generator') }
}

export default function ColorSchemeGeneratorPage() {
  return <ColorHarmony />
}
