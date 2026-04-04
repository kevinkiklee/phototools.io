import type { Metadata } from 'next'
import { Glossary } from './_components/Glossary'
import { GLOSSARY } from '@/lib/data/glossary'
import { AdUnit } from '@/components/shared/AdUnit'
import styles from './page.module.css'

export const metadata: Metadata = {
  title: 'Photography Glossary',
  description: 'Searchable glossary of 50+ photography terms with definitions and links to interactive tools.',
}

export default function GlossaryPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GLOSSARY.map((entry) => ({
      '@type': 'Question',
      name: `What is ${entry.term} in photography?`,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.definition,
      },
    })),
  }

  return (
    <div className={styles.outer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.main}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Photography Glossary</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
          Searchable reference of photography terms. Click any term to see its definition.
        </p>
        <Glossary />
      </div>
      <div className={styles.sidebar}>
        <AdUnit slot="" format="rectangle" channel="glossary_sidebar" />
      </div>
    </div>
  )
}
