'use client'

import { getToolBySlug, getToolStatus } from '@/lib/data/tools'
import { DraftBanner } from './DraftBanner'
import { ToolActions } from './ToolActions'
import { ToolIcon } from './ToolIcon'
import { LearnPanel } from './LearnPanel'
import { Breadcrumbs } from './Breadcrumbs'
import type { ReactNode } from 'react'
import styles from './ToolPageShell.module.css'

interface ToolPageShellProps {
  slug: string
  children: ReactNode
}

export function ToolPageShell({ slug, children }: ToolPageShellProps) {
  const tool = getToolBySlug(slug)

  return (
    <>
      {tool && getToolStatus(tool) === 'draft' && <DraftBanner />}
      <article className={styles.outer}>
        <div className={styles.main}>
          {tool && (
            <header className={styles.header}>
              <Breadcrumbs category={tool.category} toolName={tool.name} />
              <h1 className={styles.title}>
                <ToolIcon slug={tool.slug} className={styles.titleIcon} />
                {tool.name}
              </h1>
              <p className={styles.description}>{tool.description}</p>
              <ToolActions toolName={tool.name} toolSlug={tool.slug} />
            </header>
          )}
          {children}
        </div>
        <LearnPanel slug={slug} />
      </article>
    </>
  )
}
