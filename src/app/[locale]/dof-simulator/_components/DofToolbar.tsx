'use client'

import { useTranslations } from 'next-intl'
import { ModeToggle } from '@/components/shared/ModeToggle'
import { DOF_SCENES } from '@/lib/data/dofSimulator'
import type { SubjectMode, ABMode } from '@/lib/data/dofSimulator'
import s from './DofToolbar.module.css'

interface DofToolbarProps {
  sceneKey: string
  onSceneChange: (key: string) => void
  subjectMode: SubjectMode
  onSubjectModeChange: (mode: SubjectMode) => void
  abMode: ABMode
  onABModeChange: (mode: ABMode) => void
  blurPct: number
}

const SUBJECT_OPTIONS: { value: SubjectMode; labelKey: string }[] = [
  { value: 'figure', labelKey: 'subjectFigure' },
  { value: 'target', labelKey: 'subjectTarget' },
]

const AB_OPTIONS: { value: 'off' | 'ab'; label: string }[] = [
  { value: 'off', label: 'Single' },
  { value: 'ab', label: 'A/B' },
]

const AB_SUB_OPTIONS: { value: 'wipe' | 'split'; labelKey: string }[] = [
  { value: 'wipe', labelKey: 'modeWipe' },
  { value: 'split', labelKey: 'modeSplit' },
]

export function DofToolbar({
  sceneKey,
  onSceneChange,
  subjectMode,
  onSubjectModeChange,
  abMode,
  onABModeChange,
  blurPct,
}: DofToolbarProps) {
  const t = useTranslations('toolUI.dof-simulator')

  const abToggleValue: 'off' | 'ab' = abMode === 'off' ? 'off' : 'ab'

  const handleABToggle = (value: 'off' | 'ab') => {
    if (value === 'off') {
      onABModeChange('off')
    } else {
      // Default to wipe when enabling A/B
      onABModeChange('wipe')
    }
  }

  const handleABSubToggle = (value: 'wipe' | 'split') => {
    onABModeChange(value)
  }

  return (
    <div className={s.toolbar}>
      <div className={s.scenePicker}>
        {DOF_SCENES.map((scene) => (
          <button
            key={scene.key}
            className={`${s.sceneBtn} ${sceneKey === scene.key ? s.sceneBtnActive : ''}`}
            onClick={() => onSceneChange(scene.key)}
            aria-pressed={sceneKey === scene.key}
          >
            {scene.name}
          </button>
        ))}
      </div>

      <div className={s.toggleGroup}>
        <ModeToggle
          options={SUBJECT_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
          value={subjectMode}
          onChange={onSubjectModeChange}
        />
      </div>

      <div className={s.toggleGroup}>
        <ModeToggle
          options={AB_OPTIONS.map((o) => ({ value: o.value, label: o.value === 'off' ? t('modeSingle') : o.label }))}
          value={abToggleValue}
          onChange={handleABToggle}
        />
      </div>

      {abMode !== 'off' && (
        <div className={s.toggleGroup}>
          <ModeToggle
            options={AB_SUB_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
            value={abMode as 'wipe' | 'split'}
            onChange={handleABSubToggle}
          />
        </div>
      )}

      <div className={s.blurReadout}>
        {t('blurReadout', { value: `${blurPct.toFixed(2)}%` })}
      </div>
    </div>
  )
}
