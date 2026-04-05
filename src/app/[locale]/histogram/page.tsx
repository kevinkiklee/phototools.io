import { redirect } from '@/lib/i18n/navigation'

export default async function HistogramRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/exif-viewer', locale })
}
