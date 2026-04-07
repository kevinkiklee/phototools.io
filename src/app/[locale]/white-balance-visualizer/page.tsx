import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { WhiteBalance } from './_components/WhiteBalance'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.white-balance-visualizer')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/white-balance-visualizer') }
}

export default function WhiteBalancePage() {
  return <WhiteBalance />
}
