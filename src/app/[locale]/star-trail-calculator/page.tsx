import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { StarTrailCalculator } from './_components/StarTrailCalculator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.star-trail-calculator')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/star-trail-calculator') }
}

export default function StarTrailCalculatorPage() {
  return <StarTrailCalculator />
}
