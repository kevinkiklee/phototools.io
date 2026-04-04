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
  return (
    <div className={`${styles.wrapper} ${sticky ? styles.sticky : ''}`}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.toggle}>
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
