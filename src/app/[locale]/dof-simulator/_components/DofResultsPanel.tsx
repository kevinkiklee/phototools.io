'use client'

import { useTranslations } from 'next-intl'
import { InfoTooltip } from '@/components/shared/InfoTooltip'
import { getSkeletonBySlug } from '@/lib/data/education'
import { formatDistance } from './dof-helpers'
import s from './DofSimulator.module.css'

interface DofResultsPanelProps {
  nearFocus: number
  farFocus: number
  totalDoF: number
  hyperfocal: number
  backgroundBlurMm: number
  backgroundBlurPct: number
  coc: number
  isolationScore: number
  isDiffractionLimited: boolean
}

function getIsolationColor(score: number): string {
  if (score < 30) return '#ef4444'
  if (score < 60) return '#f59e0b'
  return '#22c55e'
}

function formatBlur(mm: number): string {
  if (mm < 0.01) return '<0.01 mm'
  return `${mm.toFixed(2)} mm`
}

export function DofResultsPanel({
  nearFocus, farFocus, totalDoF, hyperfocal,
  backgroundBlurMm, backgroundBlurPct, coc,
  isolationScore, isDiffractionLimited,
}: DofResultsPanelProps) {
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

  const isolationColor = getIsolationColor(isolationScore)

  return (
    <div className={s.panel}>
      <h3 className={s.panelTitle}>{t('results')}</h3>

      {/* Primary 2x2 grid */}
      <div className={s.resultsGrid}>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>
            {t('nearFocus')}
            {tooltips?.nearFocus && <InfoTooltip tooltip={tooltips.nearFocus} />}
          </span>
          <span className={s.resultValue}>{formatDistance(nearFocus)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>
            {t('farFocus')}
            {tooltips?.farFocus && <InfoTooltip tooltip={tooltips.farFocus} />}
          </span>
          <span className={s.resultValue}>{formatDistance(farFocus)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>
            {t('totalDoF')}
            {tooltips?.totalDoF && <InfoTooltip tooltip={tooltips.totalDoF} />}
          </span>
          <span className={s.resultValue}>{formatDistance(totalDoF)}</span>
        </div>
        <div className={s.resultCard}>
          <span className={s.resultLabel}>
            {t('hyperfocal')}
            {tooltips?.hyperfocal && <InfoTooltip tooltip={tooltips.hyperfocal} />}
          </span>
          <span className={s.resultValue}>{formatDistance(hyperfocal)}</span>
        </div>
      </div>

      {/* Extended results */}
      <div className={s.resultCard}>
        <span className={s.resultLabel}>
          {t('backgroundBlur')}
          {tooltips?.backgroundBlur && <InfoTooltip tooltip={tooltips.backgroundBlur} />}
        </span>
        <span className={s.resultValue}>
          {formatBlur(backgroundBlurMm)} ({backgroundBlurPct.toFixed(1)}%)
        </span>
      </div>

      <div className={s.resultCard}>
        <span className={s.resultLabel}>
          {t('coc')}
          {tooltips?.coc && <InfoTooltip tooltip={tooltips.coc} />}
        </span>
        <span className={s.resultValue}>{coc.toFixed(4)} mm</span>
      </div>

      <div className={s.resultCard}>
        <span className={s.resultLabel}>
          {t('isolationScore')}
          {tooltips?.isolationScore && (
            <InfoTooltip tooltip={tooltips.isolationScore} />
          )}
        </span>
        <span className={s.resultValue}>
          <span
            className={s.isolationBadge}
            style={{ background: isolationColor, color: '#fff' }}
          >
            {Math.round(isolationScore)}
          </span>
        </span>
      </div>

      {isDiffractionLimited && (
        <div className={s.warningBanner}>
          {tooltips?.diffractionWarning && (
            <InfoTooltip tooltip={tooltips.diffractionWarning} />
          )}
          {t('diffractionWarning')}
        </div>
      )}
    </div>
  )
}
