'use client'

import { useState, useRef, useCallback } from 'react'
import { useWbRenderer } from './useWbRenderer'
import styles from './WbPreview.module.css'

const SCENES = [
  { id: 'landscape', label: 'Landscape', src: '/images/scenes/landscape.jpg' },
  { id: 'cityscape', label: 'Cityscape', src: '/images/scenes/cityscape.jpg' },
  { id: 'street', label: 'Street', src: '/images/scenes/street.jpg' },
  { id: 'wildlife', label: 'Wildlife', src: '/images/scenes/wildlife.jpg' },
]

interface WbPreviewProps {
  rgb: { r: number; g: number; b: number }
  kelvin: number
  customSrc: string | null
  onFile: (file: File) => void
}

export function WbPreview({ rgb, kelvin, customSrc, onFile }: WbPreviewProps) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const useCustom = customSrc !== null && sceneIdx === -1
  const activeSrc = useCustom ? customSrc : SCENES[sceneIdx]?.src ?? SCENES[0].src
  const { isLoading, error } = useWbRenderer(canvasRef, activeSrc, rgb)

  const selectScene = useCallback((idx: number) => {
    setSceneIdx(idx)
  }, [])

  const selectCustom = useCallback(() => {
    if (customSrc) {
      setSceneIdx(-1)
    } else {
      fileRef.current?.click()
    }
  }, [customSrc])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFile(file)
      setSceneIdx(-1)
    }
  }, [onFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      onFile(file)
      setSceneIdx(-1)
    }
  }, [onFile])

  return (
    <div className={styles.canvasArea}>
      <div className={styles.topbar}>
        <div className={styles.sceneStrip}>
          <span className={styles.sceneStripLabel}>Scene:</span>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              className={`${styles.sceneThumb} ${idx === sceneIdx ? styles.sceneThumbActive : ''}`}
              onClick={() => selectScene(idx)}
              aria-label={`Select ${scene.label} scene`}
              title={scene.label}
            >
              <img src={scene.src} alt={scene.label} width={48} height={32} />
            </button>
          ))}
          <button
            className={`${styles.sceneThumb} ${styles.uploadThumb} ${sceneIdx === -1 ? styles.sceneThumbActive : ''}`}
            onClick={selectCustom}
            aria-label="Upload your own photo"
            title="Your photo"
          >
            {customSrc ? (
              <img src={customSrc} alt="Your photo" width={48} height={32} />
            ) : (
              <span className={styles.uploadIcon}>+</span>
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            style={{ display: 'none' }}
          />
        </div>
        <span className={styles.kelvinBadge}>{kelvin}K</span>
      </div>

      <div
        className={`${styles.canvasMain} ${dragOver ? styles.canvasMainDragOver : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
      >
        {error ? (
          <div className={styles.fallback}>
            <p>{error}</p>
          </div>
        ) : isLoading ? (
          <div className={styles.loading}>Loading scene...</div>
        ) : null}
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          style={{ display: error || isLoading ? 'none' : 'block' }}
        />
      </div>
    </div>
  )
}
