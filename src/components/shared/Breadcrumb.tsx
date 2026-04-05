'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n/navigation'
import { getToolBySlug } from '@/lib/data/tools'
import styles from './Breadcrumb.module.css'

interface BreadcrumbProps {
  toolSlug: string
}

export function Breadcrumb({ toolSlug }: BreadcrumbProps) {
  const t = useTranslations('common')
  const toolsT = useTranslations('tools')
  const tool = getToolBySlug(toolSlug)
  if (!tool) return null

  const categoryLabel = t(`nav.categories.${tool.category}`)
  const toolName = toolsT(`${toolSlug}.name`)

  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>{t('breadcrumb.home')}</Link>
          <span className={styles.separator} aria-hidden="true">/</span>
        </li>
        <li className={styles.item}>
          <span className={styles.category}>{categoryLabel}</span>
          <span className={styles.separator} aria-hidden="true">/</span>
        </li>
        <li className={styles.item} aria-current="page">
          <span className={styles.current}>{toolName}</span>
        </li>
      </ol>
    </nav>
  )
}
