import type { Metadata } from 'next'
import { ContactForm } from './_components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | PhotoTools',
  description: 'Get in touch with the PhotoTools team — questions, feedback, or suggestions about our photography tools.',
  alternates: { canonical: 'https://www.phototools.io/contact' },
}

export default function ContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact PhotoTools',
    url: 'https://www.phototools.io/contact',
  }

  return (
    <div style={{ padding: 'var(--space-xl) var(--space-md)', maxWidth: 800, margin: '0 auto', overflowY: 'auto' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>Contact Us</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Have a question, found a bug, or want to suggest a new tool? We&apos;d love to hear from you.
      </p>
      <ContactForm />
    </div>
  )
}
