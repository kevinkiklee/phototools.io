import { useState, useRef, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'

interface TopNavProps {
  theme: 'dark' | 'light'
  onToggleTheme: (theme: 'dark' | 'light') => void
}

const LEARN_ITEMS = [
  { href: '/learn/crop-factor-explained.html', label: 'Crop Factor Explained' },
  { href: '/learn/focal-length-guide.html', label: 'Focal Length Guide' },
  { href: '/learn/equivalent-focal-lengths.html', label: 'Equivalent Focal Lengths' },
  { href: '/learn/full-frame-vs-apsc.html', label: 'Full Frame vs APS-C' },
  { href: '/learn/how-to-choose-a-focal-length.html', label: 'How to Choose a Focal Length' },
  { href: '/learn/understanding-lens-compression.html', label: 'Understanding Lens Compression' },
  { href: '/learn/wide-angle-vs-telephoto.html', label: 'Wide Angle vs Telephoto' },
  { href: '/learn/prime-vs-zoom-lenses.html', label: 'Prime vs Zoom Lenses' },
  { href: '/learn/best-focal-lengths-landscape.html', label: 'Best Lenses for Landscape' },
  { href: '/learn/best-focal-lengths-portrait.html', label: 'Best Lenses for Portrait' },
  { href: '/learn/best-focal-lengths-street.html', label: 'Best Lenses for Street' },
  { href: '/learn/best-focal-lengths-wildlife.html', label: 'Best Lenses for Wildlife' },
  { href: '/learn/best-focal-lengths-astrophotography.html', label: 'Best Lenses for Astrophotography' },
]

interface DropdownProps {
  label: string
  href: string
  items: { href: string; label: string }[]
}

function NavDropdown({ label, href, items }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className="top-nav__dropdown" ref={ref}>
      <button
        className="top-nav__link"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {label} <span className="top-nav__caret">▾</span>
      </button>
      {open && (
        <div className="top-nav__menu">
          <a href={href} className="top-nav__menu-item top-nav__menu-item--header">
            View all {label.toLowerCase()} →
          </a>
          <div className="top-nav__menu-divider" />
          {items.map((item) => (
            <a key={item.href} href={item.href} className="top-nav__menu-item">
              {item.label}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export function TopNav({ theme, onToggleTheme }: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav__left">
        <a href="/" className="top-nav__logo">FOV Viewer</a>
        <nav className="top-nav__links">
          <a href="/" className="top-nav__link top-nav__link--active">Tool</a>
          <NavDropdown label="Learn" href="/learn/" items={LEARN_ITEMS} />
        </nav>
      </div>
      <div className="top-nav__right">
        <ThemeToggle theme={theme} onChange={onToggleTheme} />
      </div>
    </header>
  )
}
