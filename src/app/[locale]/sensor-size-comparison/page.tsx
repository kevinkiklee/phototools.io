import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { SensorSize } from './_components/SensorSize'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.sensor-size-comparison')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/sensor-size-comparison') }
}

export default function SensorSizePage() {
  return <SensorSize />
}
