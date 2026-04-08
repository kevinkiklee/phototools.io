'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getVisibleTools, getToolStatus, getToolBySlug } from '@/lib/data/tools'
import { ToolIcon } from './ToolIcon'
import styles from './RelatedTools.module.css'

interface RelatedToolsProps {
  currentSlug: string
}

export function RelatedTools({ currentSlug }: RelatedToolsProps) {
  const t = useTranslations('common.relatedTools')
  const toolsT = useTranslations('tools')
  const current = getToolBySlug(currentSlug)
  if (!current) return null

  const related = getVisibleTools()
    .filter((tool) => tool.slug !== currentSlug && tool.category === current.category && getToolStatus(tool) === 'live')
    .slice(0, 3)

  if (related.length === 0) return null

  return (
    <section className={styles.section}>
      <h3 className={styles.heading}>{t('title')}</h3>
      <div className={styles.list}>
        {related.map((tool) => (
          <Link key={tool.slug} href={`/${tool.slug}`} prefetch={false} className={styles.card}>
            <ToolIcon slug={tool.slug} width={16} height={16} className={styles.icon} />
            <div>
              <div className={styles.name}>{toolsT(`${tool.slug}.name`)}</div>
              <div className={styles.desc}>{toolsT(`${tool.slug}.description`)}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
