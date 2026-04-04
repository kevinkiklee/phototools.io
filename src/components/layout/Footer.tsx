import Link from 'next/link'
import { getAllTools, getToolStatus } from '@/lib/data/tools'
import styles from './Footer.module.css'

export function Footer() {
  const tools = getAllTools()
  return (
    <footer className={styles.footer}>
      <div className={styles.toolsRow}>
        {tools.map((tool) => {
          const isLive = getToolStatus(tool) === 'live'
          if (isLive) {
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className={styles.link}>
                {tool.name}
              </Link>
            )
          }
          return (
            <span key={tool.slug} className={`${styles.link} ${styles.linkDisabled}`}>
              {tool.name}
            </span>
          )
        })}
      </div>
      <div className={styles.infoRow}>
        <Link href="/learn/glossary" className={styles.link}>Glossary</Link>
        <Link href="/contact" className={styles.link}>Contact</Link>
        <Link href="/privacy" className={styles.link}>Privacy Policy</Link>
        <Link href="/terms" className={styles.link}>Terms of Service</Link>
        <span className={styles.separator} />
        <p>&copy; {new Date().getFullYear()} PhotoTools</p>
      </div>
    </footer>
  )
}
