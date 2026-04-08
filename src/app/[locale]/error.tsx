'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary, #e0e0e0)' }}>
      <h2>Something went wrong</h2>
      <p style={{ color: 'var(--text-secondary, #999)', marginBottom: '1rem' }}>
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        style={{
          padding: '0.5rem 1.5rem',
          background: 'var(--accent, #3b82f6)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        Try again
      </button>
    </div>
  )
}
