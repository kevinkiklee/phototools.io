import { redirect } from '@/lib/i18n/navigation'

export default async function ColorHarmonyRedirect({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  redirect({ href: '/color-scheme-generator', locale })
}
