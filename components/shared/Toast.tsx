'use client'

import { useEffect } from 'react'

interface ToastProps {
  message: string | null
  onDone: () => void
}

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onDone, 2000)
    return () => clearTimeout(timer)
  }, [message, onDone])

  if (!message) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'var(--bg-surface)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      padding: '8px 16px',
      fontSize: 'var(--text-sm)',
      boxShadow: 'var(--shadow-md)',
      zIndex: 1000,
    }}>
      {message}
    </div>
  )
}
