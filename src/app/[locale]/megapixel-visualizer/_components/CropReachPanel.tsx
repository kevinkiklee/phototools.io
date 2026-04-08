'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CROP_TARGETS } from '@/lib/data/megapixelVisualizer'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  cropTargetId: string | null
  onCropTargetChange: (id: string | null) => void
}

export function CropReachPanel({ cropTargetId, onCropTargetChange }: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const [expanded, setExpanded] = useState(cropTargetId !== null)

  return (
    <fieldset className={ss.controlGroup}>
      <legend className={ss.legend}>{t('cropReach')}</legend>
      <button
        type="button"
        onClick={() => {
          const next = !expanded
          setExpanded(next)
          if (!next) onCropTargetChange(null)
        }}
        className={ss.disclosureToggle}
        data-testid="crop-reach-toggle"
      >
        {expanded ? t('cropReachToggle') : t('cropReachDisabled')}
      </button>
      {expanded && (
        <select
          value={cropTargetId ?? ''}
          onChange={(e) => onCropTargetChange(e.target.value || null)}
          className={ss.selectInput}
          data-testid="crop-target-select"
        >
          <option value="">{t('cropReachDisabled')}</option>
          {CROP_TARGETS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      )}
    </fieldset>
  )
}
