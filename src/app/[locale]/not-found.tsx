import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getLiveTools } from '@/lib/data/tools'

export default function NotFoundPage() {
  const t = useTranslations('common.notFound')
  const toolsT = useTranslations('tools')
  const popularSlugs = ['fov-simulator', 'color-scheme-generator', 'exif-viewer', 'star-trail-calculator']
  const tools = getLiveTools().filter((tool) => popularSlugs.includes(tool.slug))

  return (
    <main style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--accent)', marginBottom: 'var(--space-sm)' }}>404</h1>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>{t('title')}</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>{t('message')}</p>
      <Link href="/" style={{ color: 'var(--accent)', fontWeight: 600, display: 'inline-block', marginBottom: 'var(--space-xl)' }}>
        &larr; {t('backHome')}
      </Link>
      <h3 style={{ fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 'var(--space-md)' }}>
        {t('popularTools')}
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tools.map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}`} style={{ color: 'var(--text-primary)' }}>
            {toolsT(`${tool.slug}.name`)}
          </Link>
        ))}
      </div>
    </main>
  )
}
