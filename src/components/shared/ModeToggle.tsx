import { useRef, useEffect, useState } from 'react'
import styles from './ModeToggle.module.css'

interface ModeOption<T extends string> {
  value: T
  label: string
}

interface ModeToggleProps<T extends string> {
  options: ModeOption<T>[]
  value: T
  onChange: (value: T) => void
  sticky?: boolean
  title?: string
}

export function ModeToggle<T extends string>({ options, value, onChange, sticky, title }: ModeToggleProps<T>) {
  const toggleRef = useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const container = toggleRef.current
    if (!container) return
    const idx = options.findIndex((o) => o.value === value)
    const btn = container.children[idx + 1] as HTMLElement | undefined // +1 for the indicator div
    if (!btn) return
    setIndicator({ left: btn.offsetLeft, width: btn.offsetWidth })
  }, [value, options])

  return (
    <div className={`${styles.wrapper} ${sticky ? styles.sticky : ''}`}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.toggle} ref={toggleRef}>
        <div
          className={styles.indicator}
          style={{ left: indicator.left, width: indicator.width }}
        />
        {options.map((opt) => (
        <button
          key={opt.value}
          className={`${styles.btn} ${value === opt.value ? styles.btnActive : ''}`}
          onClick={() => onChange(opt.value)}
          aria-pressed={value === opt.value}
        >
          {opt.label}
        </button>
      ))}
      </div>
    </div>
  )
}
