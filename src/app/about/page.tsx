import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About',
  description: 'PhotoTools is a free collection of browser-based photography calculators, simulators, and references for photographers of all skill levels.',
  alternates: {
    canonical: 'https://www.phototools.io/about',
  },
}

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About PhotoTools',
    url: 'https://www.phototools.io/about',
  }

  return (
    <div
      style={{
        padding: 'var(--space-xl) var(--space-md)',
        maxWidth: 800,
        margin: '0 auto',
        overflowY: 'auto',
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 'var(--space-sm)' }}>
        About PhotoTools
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Free photography education, right in your browser.
      </p>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          What is PhotoTools?
        </h2>
        <p>
          PhotoTools is a free collection of interactive photography calculators, simulators, and
          reference tools. Whether you&apos;re learning the exposure triangle for the first time or
          calculating hyperfocal distance for a landscape shoot, PhotoTools gives you hands-on
          visual tools to deepen your understanding of photography.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Who is it for?
        </h2>
        <p>
          Photographers of all skill levels — from beginners exploring how aperture affects depth of
          field to experienced shooters planning a star trail session. Every tool includes a learning
          panel with explanations, key factors, pro tips, and interactive challenges to test your
          knowledge.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Privacy first
        </h2>
        <p>
          All calculations and simulations run entirely in your browser. Your photos never leave
          your device — the EXIF Viewer, for example, processes images 100% client-side. No
          sign-up is required, and no personal data is collected beyond anonymous analytics.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Built by photographers
        </h2>
        <p>
          PhotoTools is built and maintained by a photographer and software engineer who wanted
          better visual tools for understanding the technical side of photography. The tools are
          grounded in real optics and physics — not approximations — so you can trust the results
          in the field.
        </p>
      </section>

      <section style={{ marginBottom: 'var(--space-xl)' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 'var(--space-sm)' }}>
          Get in touch
        </h2>
        <p>
          Have a suggestion, bug report, or tool idea? Reach out via the{' '}
          <a href="/contact" style={{ color: 'var(--accent)' }}>
            contact page
          </a>
          .
        </p>
      </section>
    </div>
  )
}
