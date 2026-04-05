import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { FocusStacking } from './_components/FocusStacking'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.focus-stacking-calculator')
  return { title: t('title'), description: t('description'), alternates: getAlternates('/focus-stacking-calculator') }
}

export default function FocusStackingPage() {
  return <FocusStacking />
}
