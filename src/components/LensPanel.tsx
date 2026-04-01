import type { LensConfig } from '../types'
import { FOCAL_LENGTHS, FOCAL_MIN, FOCAL_MAX } from '../data/focalLengths'
import { SENSORS, getSensor } from '../data/sensors'
import { calcFOV, calcEquivFocalLength } from '../utils/fov'

interface LensPanelProps {
  label: string
  color: string
  config: LensConfig
  isActive: boolean
  collapsed: boolean
  onChange: (updates: Partial<LensConfig>) => void
  onFocus: () => void
  onToggleCollapse: () => void
}

export function LensPanel({
  label, color, config, isActive, collapsed, onChange, onFocus, onToggleCollapse,
}: LensPanelProps) {
  const sensor = getSensor(config.sensorId)
  const fov = calcFOV(config.focalLength, sensor.cropFactor)
  const equiv = calcEquivFocalLength(config.focalLength, sensor.cropFactor)

  return (
    <div
      className={`lens-panel ${isActive ? 'lens-panel--active' : ''}`}
      style={{ borderLeftColor: color }}
      onClick={onFocus}
    >
      <div className="lens-panel__header" onClick={onToggleCollapse}>
        <span className="lens-panel__label" style={{ color }}>{label}</span>
        <span className="lens-panel__equiv">
          {sensor.cropFactor !== 1 ? `≡ ${equiv}mm equiv` : ''}
        </span>
      </div>

      <div className="lens-panel__focal">
        <div className="lens-panel__focal-row">
          <span className="lens-panel__sublabel">Focal length</span>
          <span className="lens-panel__value">{config.focalLength}mm</span>
        </div>
        <input
          type="range"
          className="lens-panel__slider"
          min={FOCAL_MIN}
          max={FOCAL_MAX}
          step={1}
          value={config.focalLength}
          onChange={(e) => onChange({ focalLength: Number(e.target.value) })}
          style={{ accentColor: color }}
        />
      </div>

      {!collapsed && (
        <>
          <div className="lens-panel__presets">
            {FOCAL_LENGTHS.map((fl) => (
              <button
                key={fl.value}
                className={`lens-panel__preset ${config.focalLength === fl.value ? 'lens-panel__preset--active' : ''}`}
                style={config.focalLength === fl.value ? { background: color, color: '#fff' } : undefined}
                onClick={(e) => { e.stopPropagation(); onChange({ focalLength: fl.value }) }}
              >
                {fl.value}
              </button>
            ))}
          </div>

          <div className="lens-panel__sensor-row">
            <span className="lens-panel__sublabel">Sensor</span>
            <select
              className="lens-panel__select"
              value={config.sensorId}
              onChange={(e) => onChange({ sensorId: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            >
              {SENSORS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.cropFactor}×)
                </option>
              ))}
            </select>
          </div>

          <div className="lens-panel__fov">
            FOV: {fov.horizontal.toFixed(1)}° × {fov.vertical.toFixed(1)}°
          </div>
        </>
      )}
    </div>
  )
}
