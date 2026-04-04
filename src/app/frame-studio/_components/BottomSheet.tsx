'use client'

import { useState, useRef, useCallback, type ReactNode } from 'react'
import styles from './BottomSheet.module.css'

interface BottomSheetProps {
  children: ReactNode
  open: boolean
}

export function BottomSheet({ children, open }: BottomSheetProps) {
  const [expanded, setExpanded] = useState(false)
  const startY = useRef(0)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaY = e.changedTouches[0].clientY - startY.current
    if (deltaY < -30) setExpanded(true)
    if (deltaY > 30) setExpanded(false)
  }, [])

  if (!open) return null

  return (
    <div
      className={`${styles.sheet} ${expanded ? styles.expanded : ''}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className={styles.handle}>
        <div className={styles.handleBar} />
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
