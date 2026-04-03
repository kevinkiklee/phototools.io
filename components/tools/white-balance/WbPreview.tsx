'use client'

import { useState, useRef } from 'react'
import { useWbRenderer } from './useWbRenderer'
import styles from './WbPreview.module.css'

const SCENES = [
  { id: 'landscape', label: 'Landscape', src: '/images/scenes/landscape-boat-lake.jpg' },
  { id: 'portrait', label: 'Portrait', src: '/images/scenes/portrait-woman.jpg' },
  { id: 'city', label: 'City Street', src: '/images/scenes/city-street.jpg' },
  { id: 'wildlife', label: 'Wildlife', src: '/images/scenes/wildlife-condor.jpg' },
  { id: 'milkyway', label: 'Milky Way', src: '/images/scenes/milky-way-night-sky.jpg' },
]

interface WbPreviewProps {
  rgb: { r: number; g: number; b: number }
  kelvin: number
}

export function WbPreview({ rgb, kelvin }: WbPreviewProps) {
  const [sceneIdx, setSceneIdx] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const currentScene = SCENES[sceneIdx]
  const { isLoading, error } = useWbRenderer(canvasRef, currentScene.src, rgb)

  return (
    <div className={styles.canvasArea}>
      <div className={styles.topbar}>
        <div className={styles.sceneStrip}>
          <span className={styles.sceneStripLabel}>Scene:</span>
          {SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              className={`${styles.sceneThumb} ${idx === sceneIdx ? styles.sceneThumbActive : ''}`}
              onClick={() => setSceneIdx(idx)}
              aria-label={`Select ${scene.label} scene`}
              title={scene.label}
            >
              <img src={scene.src} alt={scene.label} width={48} height={32} />
            </button>
          ))}
        </div>
        <span className={styles.kelvinBadge}>{kelvin}K</span>
      </div>

      <div className={styles.canvasMain}>
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
