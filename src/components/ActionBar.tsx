interface ActionBarProps {
  onCopyImage: () => void
  onCopyLink: () => void
  onReset: () => void
  onShare: () => void
}

export function ActionBar({ onCopyImage, onCopyLink, onReset, onShare }: ActionBarProps) {
  return (
    <div className="action-bar">
      <button className="action-bar__btn action-bar__btn--primary" onClick={onCopyImage}>
        Copy image
      </button>
      <button className="action-bar__btn" onClick={onCopyLink}>
        Copy link
      </button>
      <button className="action-bar__btn" onClick={onShare}>
        Share / Embed
      </button>
      <button className="action-bar__btn" onClick={onReset}>
        Reset
      </button>
    </div>
  )
}
