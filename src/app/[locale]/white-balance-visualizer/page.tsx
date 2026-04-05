import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { WhiteBalance } from './_components/WhiteBalance'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.white-balance-visualizer')
  return { title: t('title'), description: t('description'), alternates: getAlternates('/white-balance-visualizer') }
}

export default function WhiteBalancePage() {
  return <WhiteBalance />
}
