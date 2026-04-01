import type { ViewMode } from '../types'

interface ModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="mode-toggle">
      <button
        className={`mode-toggle__btn ${mode === 'overlay' ? 'mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('overlay')}
      >
        Overlay
      </button>
      <button
        className={`mode-toggle__btn ${mode === 'side' ? 'mode-toggle__btn--active' : ''}`}
        onClick={() => onChange('side')}
      >
        Side by Side
      </button>
    </div>
  )
}
