import { calcFOV, calcFrameWidth } from '../utils/fov'
import { getSensor } from '../data/sensors'
import type { LensConfig } from '../types'

interface FrameRulerProps {
  lensA: LensConfig
  lensB: LensConfig
  distance: number
  onDistanceChange: (d: number) => void
}

export function FrameRuler({ lensA, lensB, distance, onDistanceChange }: FrameRulerProps) {
  const sensorA = getSensor(lensA.sensorId)
  const sensorB = getSensor(lensB.sensorId)
  const fovA = calcFOV(lensA.focalLength, sensorA.cropFactor)
  const fovB = calcFOV(lensB.focalLength, sensorB.cropFactor)
  const widthA = calcFrameWidth(fovA.horizontal, distance)
  const widthB = calcFrameWidth(fovB.horizontal, distance)

  return (
    <div className="frame-ruler">
      <div className="frame-ruler__title">Frame Width at Distance</div>
      <div className="frame-ruler__distance-row">
        <span className="frame-ruler__sublabel">Distance</span>
        <span className="frame-ruler__value">{distance}m</span>
      </div>
      <input
        type="range"
        className="frame-ruler__slider"
        min={1}
        max={1000}
        step={1}
        value={distance}
        onChange={(e) => onDistanceChange(Number(e.target.value))}
      />
      <div className="frame-ruler__results">
        <span style={{ color: 'var(--lens-a)' }}>A: {widthA.toFixed(1)}m wide</span>
        <span style={{ color: 'var(--lens-b)' }}>B: {widthB.toFixed(1)}m wide</span>
      </div>
    </div>
  )
}
