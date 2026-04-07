import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { FrameStudio } from './_components/FrameStudio'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.frame-studio')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/frame-studio') }
}

export default function FrameStudioPage() {
  return <FrameStudio />
}
