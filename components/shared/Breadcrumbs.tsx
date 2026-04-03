import Link from 'next/link'
import type { ToolCategory } from '@/lib/types'
import styles from './Breadcrumbs.module.css'

interface BreadcrumbsProps {
  category: ToolCategory
  toolName: string
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  visualizer: 'Visualizers',
  calculator: 'Calculators',
  reference: 'Reference',
  'file-tool': 'File Tools',
}

export function Breadcrumbs({ category, toolName }: BreadcrumbsProps) {
  const categoryLabel = CATEGORY_LABELS[category]
  
  return (
    <nav className={styles.nav} aria-label="Breadcrumb">
      <Link href="/" className={styles.link}>Home</Link>
      <span className={styles.separator}>/</span>
      <span className={styles.categoryLabel}>{categoryLabel}</span>
      <span className={styles.separator}>/</span>
      <span className={styles.current} aria-current="page">{toolName}</span>
    </nav>
  )
}
