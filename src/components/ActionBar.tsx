interface ActionBarProps {
  onCopyImage: () => void
  onCopyLink: () => void
}

export function ActionBar({ onCopyImage, onCopyLink }: ActionBarProps) {
  return (
    <div className="action-bar">
      <button className="action-bar__btn action-bar__btn--primary" onClick={onCopyImage}>
        Copy image
      </button>
      <button className="action-bar__btn" onClick={onCopyLink}>
        Copy link
      </button>
    </div>
  )
}
