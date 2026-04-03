'use client'

import { getToolBySlug } from '@/lib/data/tools'
import { DraftBanner } from './DraftBanner'
import type { ReactNode } from 'react'

interface ToolPageShellProps {
  slug: string
  children: ReactNode
}

export function ToolPageShell({ slug, children }: ToolPageShellProps) {
  const tool = getToolBySlug(slug)
  return (
    <>
      {tool?.status === 'draft' && <DraftBanner />}
      <div style={{ padding: 'var(--space-md)', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
        {tool && (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <h1 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{tool.name}</h1>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{tool.description}</p>
          </div>
        )}
        {children}
      </div>
    </>
  )
}
