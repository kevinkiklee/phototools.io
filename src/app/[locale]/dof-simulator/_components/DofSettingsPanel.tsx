'use client'

import { useTranslations } from 'next-intl'
import { SENSORS } from '@/lib/data/sensors'
import { FocalLengthField } from '@/components/shared/FocalLengthField'
import { ApertureField } from '@/components/shared/ApertureField'
import { DistanceField } from '@/components/shared/DistanceField'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { getSkeletonBySlug } from '@/lib/data/education'
import s from './DofSimulator.module.css'

interface DofSettingsPanelProps {
  focalLength: number
  aperture: number
  subjectDistance: number
  sensorId: string
  orientation: 'landscape' | 'portrait'
  sweetSpot: number | null
  onFocalLengthChange: (v: number) => void
  onApertureChange: (v: number) => void
  onDistanceChange: (v: number) => void
  onSensorChange: (v: string) => void
  onOrientationChange: (v: 'landscape' | 'portrait') => void
}

export function DofSettingsPanel({
  focalLength, aperture, subjectDistance, sensorId,
  orientation, sweetSpot,
  onFocalLengthChange, onApertureChange, onDistanceChange,
  onSensorChange, onOrientationChange,
}: DofSettingsPanelProps) {
  const t = useTranslations('toolUI.dof-simulator')
  const sensorsT = useTranslations('common.sensors')
  const et = useTranslations('education.dof-simulator')
  const skel = getSkeletonBySlug('dof-simulator')
  const tooltips = skel
    ? Object.fromEntries(
        skel.tooltipKeys.map((key) => [
          key,
          { term: et(`tooltips.${key}.term`), definition: et(`tooltips.${key}.definition`) },
        ]),
      )
    : undefined

  const orientationOptions = [
    { value: 'landscape' as const, label: t('landscape') },
    { value: 'portrait' as const, label: t('portrait') },
  ]

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('cameraLens')}</h3>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('focalLength')}
          {tooltips?.focalLength && <InfoTooltip tooltip={tooltips.focalLength} />}
        </label>
        <FocalLengthField value={focalLength} onChange={onFocalLengthChange} />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('aperture')}
          {tooltips?.aperture && <InfoTooltip tooltip={tooltips.aperture} />}
        </label>
        <ApertureField
          value={aperture}
          onChange={onApertureChange}
          sweetSpot={sweetSpot}
        />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('subjectDistance')}
          {tooltips?.subjectDistance && <InfoTooltip tooltip={tooltips.subjectDistance} />}
        </label>
        <DistanceField
          value={subjectDistance}
          onChange={onDistanceChange}
          min={0.1}
          max={100}
        />
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('sensor')}
          {tooltips?.sensor && <InfoTooltip tooltip={tooltips.sensor} />}
        </label>
        <select
          className={s.select}
          value={sensorId}
          onChange={(e) => onSensorChange(e.target.value)}
        >
          {SENSORS.map((sensor) => (
            <option key={sensor.id} value={sensor.id}>
              {sensorsT.has(sensor.id) ? sensorsT(sensor.id) : sensor.name}
            </option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('orientation')}
          {tooltips?.orientation && <InfoTooltip tooltip={tooltips.orientation} />}
        </label>
        <ModeToggle
          options={orientationOptions}
          value={orientation}
          onChange={onOrientationChange}
        />
      </div>
    </div>
  )
}
