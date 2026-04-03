import Link from 'next/link'
import { getLiveTools } from '@/lib/data/tools'

export default function HomePage() {
  const tools = getLiveTools()
  return (
    <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: 1200, margin: '0 auto' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Photo Tools</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Free photography calculators, simulators, and references.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            style={{
              display: 'block',
              padding: 'var(--space-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, marginBottom: 'var(--space-xs)' }}>{tool.name}</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
