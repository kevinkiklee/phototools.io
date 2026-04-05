import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { FovSimulator } from './_components/FovSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.fov-simulator')
  return { title: t('title'), description: t('description'), alternates: getAlternates('/fov-simulator') }
}

export default function FovSimulatorPage() {
  return <FovSimulator />
}
