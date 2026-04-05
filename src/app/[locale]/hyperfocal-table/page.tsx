import { redirect } from '@/lib/i18n/navigation'

export default async function HyperfocalTableRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/hyperfocal-simulator', locale })
}
