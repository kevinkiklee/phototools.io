'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'
import { ThemeToggle } from './ThemeToggle'
import styles from './Nav.module.css'

interface NavProps {
  theme: string
  onThemeChange: (theme: 'dark' | 'light') => void
}

export function Nav({ theme, onThemeChange }: NavProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const tools = getLiveTools()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className={styles.nav}>
      <Link href="/" className={styles.logo}>Photo Tools</Link>
      <div className={styles.dropdownWrapper} ref={ref}>
        <button
          className={styles.dropdownButton}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-haspopup="true"
        >
          Tools {open ? '\u25B2' : '\u25BC'}
        </button>
        {open && (
          <div className={styles.dropdownMenu}>
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className={styles.dropdownItem}
                onClick={() => setOpen(false)}
              >
                {tool.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className={styles.spacer} />
      <ThemeToggle theme={theme} onChange={onThemeChange} />
    </nav>
  )
}
