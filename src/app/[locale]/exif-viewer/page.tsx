import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { getAlternates } from '@/lib/i18n/metadata'
import { ExifViewer } from './_components/ExifViewer'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata.exif-viewer')
  const title = t('title')
  const description = t('description')
  return { title, description, openGraph: { title, description }, alternates: getAlternates('/exif-viewer') }
}

export default function ExifViewerPage() {
  return <ExifViewer />
}
