'use client'

import { FileDropZone } from './FileDropZone'
import styles from './PhotoUploadPanel.module.css'

interface PhotoUploadPanelProps {
  onFile: (file: File) => void
  /** Optional label above the drop zone (default: "Your Photo") */
  label?: string
  /** Custom prompt text for the drop zone */
  prompt?: string
}

export function PhotoUploadPanel({ onFile, label = 'Your Photo', prompt }: PhotoUploadPanelProps) {
  return (
    <div className={styles.panel}>
      <span className={styles.label}>{label}</span>
      <FileDropZone onFile={onFile} prompt={prompt} />
    </div>
  )
}
