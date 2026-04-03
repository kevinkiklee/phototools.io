'use client'

import { useState, useMemo } from 'react'
import { rule500, ruleNPF, stackingTime, formatDuration } from '@/lib/math/startrail'
import { pixelPitch } from '@/lib/math/diffraction'
import { SENSORS } from '@/lib/data/sensors'
import { FOCAL_LENGTHS } from '@/lib/data/focalLengths'
import styles from '../shared/Calculator.module.css'

const APERTURES = [1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

/** Derive sensor width from crop factor (FF = 36mm) */
function sensorWidth(cropFactor: number): number {
  return 36 / cropFactor
}

export function StarTrailCalculator() {
  const [focalLength, setFocalLength] = useState(24)
  const [sensorId, setSensorId] = useState('ff')
  const [resolution, setResolution] = useState(24)
  const [aperture, setAperture] = useState(2.8)
  const [mode, setMode] = useState<'sharp' | 'trails'>('sharp')

  // Trail mode inputs
  const [exposurePerFrame, setExposurePerFrame] = useState(30)
  const [numFrames, setNumFrames] = useState(60)
  const [gap, setGap] = useState(2)

  const sensor = SENSORS.find((s) => s.id === sensorId) ?? SENSORS[1]
  const width = sensorWidth(sensor.cropFactor)
  const pitch = pixelPitch(width, resolution)

  const sharpResults = useMemo(() => {
    const max500 = rule500(focalLength, sensor.cropFactor)
    const maxNPF = ruleNPF(aperture, focalLength, pitch)
    return { max500, maxNPF }
  }, [focalLength, sensor.cropFactor, aperture, pitch])

  const trailResult = useMemo(
    () => stackingTime(exposurePerFrame, numFrames, gap),
    [exposurePerFrame, numFrames, gap],
  )

  return (
    <div>
      <div className={styles.layout}>
        <div className={styles.controls}>
          <div className={styles.field}>
            <label className={styles.label}>Focal Length</label>
            <select
              className={styles.select}
              value={focalLength}
              onChange={(e) => setFocalLength(Number(e.target.value))}
            >
              {FOCAL_LENGTHS.map((fl) => (
                <option key={fl.value} value={fl.value}>
                  {fl.value}mm{fl.label ? ` — ${fl.label}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Sensor</label>
            <select
              className={styles.select}
              value={sensorId}
              onChange={(e) => setSensorId(e.target.value)}
            >
              {SENSORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Resolution (MP)</label>
            <input
              type="number"
              className={styles.input}
              value={resolution}
              min={1}
              max={200}
              onChange={(e) => setResolution(Number(e.target.value) || 1)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Aperture</label>
            <select
              className={styles.select}
              value={aperture}
              onChange={(e) => setAperture(Number(e.target.value))}
            >
              {APERTURES.map((a) => (
                <option key={a} value={a}>
                  f/{a}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mode</label>
            <select
              className={styles.select}
              value={mode}
              onChange={(e) => setMode(e.target.value as 'sharp' | 'trails')}
            >
              <option value="sharp">Sharp Stars</option>
              <option value="trails">Star Trails</option>
            </select>
          </div>

          {mode === 'trails' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Exposure per Frame</label>
                <select
                  className={styles.select}
                  value={exposurePerFrame}
                  onChange={(e) => setExposurePerFrame(Number(e.target.value))}
                >
                  {[15, 30, 60, 120].map((s) => (
                    <option key={s} value={s}>
                      {s}s
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Number of Frames</label>
                <input
                  type="number"
                  className={styles.input}
                  value={numFrames}
                  min={1}
                  onChange={(e) => setNumFrames(Number(e.target.value) || 1)}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Gap Between Frames (s)</label>
                <input
                  type="number"
                  className={styles.input}
                  value={gap}
                  min={0}
                  onChange={(e) => setGap(Number(e.target.value) || 0)}
                />
              </div>
            </>
          )}
        </div>

        <div className={styles.results}>
          {mode === 'sharp' ? (
            <>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>500 Rule</span>
                <span className={styles.resultValue}>
                  {sharpResults.max500.toFixed(1)}s
                </span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>NPF Rule (more accurate)</span>
                <span className={styles.resultValue}>
                  {sharpResults.maxNPF.toFixed(1)}s
                </span>
              </div>
              <div className={styles.resultCard} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.resultLabel}>Recommendation</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                  Use the NPF rule ({sharpResults.maxNPF.toFixed(1)}s) for pixel-level sharpness.
                  The 500 rule ({sharpResults.max500.toFixed(1)}s) is a quick estimate but may show
                  trailing on high-resolution sensors.
                </span>
              </div>
            </>
          ) : (
            <>
              <div className={styles.resultCard} style={{ gridColumn: '1 / -1' }}>
                <span className={styles.resultLabel}>Total Shooting Time</span>
                <span className={styles.resultValue}>{formatDuration(trailResult)}</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Total Frames</span>
                <span className={styles.resultValue}>{numFrames}</span>
              </div>
              <div className={styles.resultCard}>
                <span className={styles.resultLabel}>Total Exposure</span>
                <span className={styles.resultValue}>
                  {formatDuration(exposurePerFrame * numFrames)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
