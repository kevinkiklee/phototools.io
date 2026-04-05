import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { DofSimulator } from './_components/DofSimulator'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.dof-simulator')
  return { title: t('title'), description: t('description'), alternates: getAlternates('/dof-simulator') }
}

export default function DofSimulatorPage() {
  return <DofSimulator />
}
