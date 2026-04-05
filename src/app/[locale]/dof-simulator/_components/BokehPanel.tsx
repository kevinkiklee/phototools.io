'use client'

import { useTranslations } from 'next-intl'
import { BOKEH_SHAPES, type BokehShape } from '@/lib/data/dofSimulator'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { getSkeletonBySlug } from '@/lib/data/education'
import s from './DofSimulator.module.css'

interface BokehPanelProps {
  bokehShape: BokehShape
  useDiffraction: boolean
  onBokehShapeChange: (shape: BokehShape) => void
  onDiffractionChange: (enabled: boolean) => void
}

export function BokehPanel({
  bokehShape, useDiffraction, onBokehShapeChange, onDiffractionChange,
}: BokehPanelProps) {
  const t = useTranslations('toolUI.dof-simulator')
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

  return (
    <details className={s.panel}>
      <summary className={s.panelTitle}>{t('bokeh')}</summary>

      <div className={s.field}>
        <label className={s.fieldLabel}>
          {t('bokehShape')}
          {tooltips?.bokehShape && <InfoTooltip tooltip={tooltips.bokehShape} />}
        </label>
        <select
          className={s.select}
          value={bokehShape}
          onChange={(e) => onBokehShapeChange(e.target.value as BokehShape)}
        >
          {BOKEH_SHAPES.map((shape) => (
            <option key={shape.key} value={shape.key}>
              {shape.name}
            </option>
          ))}
        </select>
      </div>

      <div className={s.field}>
        <label className={s.checkboxLabel}>
          <input
            type="checkbox"
            checked={useDiffraction}
            onChange={(e) => onDiffractionChange(e.target.checked)}
          />
          <span>{t('simulateDiffraction')}</span>
        </label>
      </div>
    </details>
  )
}
