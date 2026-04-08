'use client'

import { useTranslations } from 'next-intl'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { PRINT_SIZES_METRIC, PRINT_SIZES_IMPERIAL } from '@/lib/data/megapixelVisualizer'
import type { UnitSystem } from '@/lib/types'
import ss from './MegapixelVisualizer.module.css'

interface Props {
  printPresetId: string
  printOrientation: 'landscape' | 'portrait'
  printFitMode: 'crop' | 'fit'
  units: UnitSystem
  onPrintPresetChange: (id: string) => void
  onPrintOrientationChange: (o: 'landscape' | 'portrait') => void
  onPrintFitModeChange: (f: 'crop' | 'fit') => void
}

export function PrintPresetPanel({
  printPresetId,
  printOrientation,
  printFitMode,
  units,
  onPrintPresetChange,
  onPrintOrientationChange,
  onPrintFitModeChange,
}: Props) {
  const t = useTranslations('toolUI.megapixel-visualizer')
  const presets = units === 'imperial' ? PRINT_SIZES_IMPERIAL : PRINT_SIZES_METRIC

  return (
    <>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('paperSizeLabel')}</legend>
        <select
          value={printPresetId}
          onChange={(e) => onPrintPresetChange(e.target.value)}
          className={ss.selectInput}
          data-testid="print-preset-select"
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </fieldset>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('orientation')}</legend>
        <ModeToggle
          options={[
            { value: 'landscape', label: t('orientationLandscape') },
            { value: 'portrait', label: t('orientationPortrait') },
          ]}
          value={printOrientation}
          onChange={(v) => onPrintOrientationChange(v as 'landscape' | 'portrait')}
        />
      </fieldset>
      <fieldset className={ss.controlGroup}>
        <legend className={ss.legend}>{t('printFitMode')}</legend>
        <ModeToggle
          options={[
            { value: 'crop', label: t('fitCrop') },
            { value: 'fit', label: t('fitFit') },
          ]}
          value={printFitMode}
          onChange={(v) => onPrintFitModeChange(v as 'crop' | 'fit')}
        />
      </fieldset>
    </>
  )
}
