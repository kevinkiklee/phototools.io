'use client'

import { useTranslations } from 'next-intl'
import { FRAMING_PRESETS } from '@/lib/data/dofSimulator'
import { ModeToggle } from '@/components/shared/ModeToggle'
import s from './DofSimulator.module.css'

interface FramingPanelProps {
  activePreset: string | null
  lockMode: 'constantFL' | 'constantDistance'
  onPresetClick: (presetKey: string) => void
  onLockModeChange: (mode: 'constantFL' | 'constantDistance') => void
}

const PRESET_LABEL_KEYS: Record<string, string> = {
  face: 'framingPresetFace',
  portrait: 'framingPresetPortrait',
  medium: 'framingPresetMedium',
  american: 'framingPresetAmerican',
  full: 'framingPresetFull',
}

export function FramingPanel({
  activePreset, lockMode, onPresetClick, onLockModeChange,
}: FramingPanelProps) {
  const t = useTranslations('toolUI.dof-simulator')

  const lockOptions = [
    { value: 'constantFL' as const, label: t('lockConstantFL') },
    { value: 'constantDistance' as const, label: t('lockConstantDistance') },
  ]

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('framing')}</h3>

      <div className={s.framingPresets}>
        {FRAMING_PRESETS.map((preset) => (
          <button
            key={preset.key}
            className={`${s.presetBtn} ${activePreset === preset.key ? s.presetBtnActive : ''}`}
            onClick={() => onPresetClick(preset.key)}
            aria-pressed={activePreset === preset.key}
          >
            {t(PRESET_LABEL_KEYS[preset.key] ?? preset.name)}
          </button>
        ))}
      </div>

      <ModeToggle
        options={lockOptions}
        value={lockMode}
        onChange={onLockModeChange}
      />
    </div>
  )
}
