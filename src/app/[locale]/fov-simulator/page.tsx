import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { FovSimulator } from './_components/FovSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.fov-simulator')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/fov-simulator') }
}

export default function FovSimulatorPage() {
  return <FovSimulator />
}
