'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import type { ToolCategory } from '@/lib/types'
import { copyLinkToClipboard } from '@/lib/utils/export'
import { ThemeToggle } from './ThemeToggle'
import { Toast } from '../shared/Toast'
import styles from './Nav.module.css'

interface NavProps {
  theme: string
  onThemeChange: (theme: 'dark' | 'light') => void
}

const CATEGORY_LABELS: Record<ToolCategory, string> = {
  visualizer: 'Visualizers',
  calculator: 'Calculators',
  reference: 'Reference',
  'file-tool': 'File Tools',
}

const CATEGORY_ORDER: ToolCategory[] = ['visualizer', 'calculator', 'reference', 'file-tool']

export function Nav({ theme, onThemeChange }: NavProps) {
  const [toolsOpen, setToolsOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const toolsRef = useRef<HTMLDivElement>(null)
  const tools = getLiveTools()

  const handleCopyImage = useCallback(async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
    if (!canvas) {
      setToast('No image to copy')
      return
    }
    try {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (!blob) { setToast('Failed to copy'); return }
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        setToast('Image copied!')
      } else {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'photo-tools.png'
        document.body.appendChild(a); a.click(); document.body.removeChild(a)
        URL.revokeObjectURL(url)
        setToast('Image downloaded')
      }
    } catch { setToast('Failed to copy') }
  }, [])

  const handleCopyLink = useCallback(async () => {
    const ok = await copyLinkToClipboard()
    setToast(ok ? 'Link copied!' : 'Failed to copy')
  }, [])

  const handleEmbed = useCallback(async () => {
    const iframe = `<iframe src="${window.location.href}" width="800" height="600" frameborder="0"></iframe>`
    try {
      await navigator.clipboard.writeText(iframe)
      setToast('Embed code copied!')
    } catch { setToast('Failed to copy') }
  }, [])

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    tools: tools.filter((t) => t.category === cat),
  })).filter((g) => g.tools.length > 0)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setToolsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>PhotoTools</Link>
      <div
        className={styles.dropdownWrapper}
        ref={toolsRef}
        onMouseEnter={() => setToolsOpen(true)}
        onMouseLeave={() => setToolsOpen(false)}
      >
        <button
          className={`${styles.dropdownButton} ${toolsOpen ? styles.dropdownButtonActive : ''}`}
          onClick={() => setToolsOpen((v) => !v)}
          aria-expanded={toolsOpen}
          aria-haspopup="true"
        >
          Tools {toolsOpen ? '\u25B2' : '\u25BC'}
        </button>
        {toolsOpen && (
          <div className={styles.megaMenu}>
            {grouped.map((group) => (
              <div key={group.category} className={styles.megaColumn}>
                <div className={styles.megaCategoryLabel}>{group.label}</div>
                {group.tools.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className={styles.megaItem}
                    onClick={(e) => { if (!e.metaKey && !e.ctrlKey) setToolsOpen(false) }}
                  >
                    <span className={styles.megaItemName}>{tool.name}</span>
                    <span className={styles.megaItemDesc}>{tool.description}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <Link href="/learn/glossary" className={styles.navLink}>Glossary</Link>
      <div className={styles.spacer} />
      <div className={styles.actions}>
        <button className={styles.actionBtn} onClick={handleCopyImage} aria-label="Copy image">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="9" height="9" rx="1" />
            <path d="M5 5h7a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5z" />
          </svg>
          <span className={styles.actionLabel}>Copy Image</span>
        </button>
        <button className={styles.actionBtn} onClick={handleCopyLink} aria-label="Copy link">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 9.5a3 3 0 0 0 4.2.3l2-2a3 3 0 0 0-4.2-4.3l-1.1 1.1" />
            <path d="M9.5 6.5a3 3 0 0 0-4.2-.3l-2 2a3 3 0 0 0 4.2 4.3l1.1-1.1" />
          </svg>
          <span className={styles.actionLabel}>Copy Link</span>
        </button>
        <button className={styles.actionBtn} onClick={handleEmbed} aria-label="Copy embed code">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="5 4.5 2 8 5 11.5" />
            <polyline points="11 4.5 14 8 11 11.5" />
          </svg>
          <span className={styles.actionLabel}>Embed</span>
        </button>
      </div>
      <ThemeToggle theme={theme} onChange={onThemeChange} />
      <Toast message={toast} onDone={() => setToast(null)} />
    </nav>
  )
}
