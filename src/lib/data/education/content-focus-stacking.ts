import type { ToolEducationSkeleton } from './types'

export const FOCUS_STACKING_SKELETON: ToolEducationSkeleton = {
  slug: 'focus-stacking-calculator',
  deeperSections: 3,
  keyFactorCount: 3,
  tipCount: 3,
  tooltipKeys: ['focalLength', 'aperture', 'sensor', 'nearLimit', 'farLimit', 'overlap', 'shotCount'],
  challenges: [
    {
      id: 'stacking-macro-count',
      difficulty: 'beginner',
      targetField: 'aperture',
      optionValues: ['f/2.8 — 25 shots', 'f/8 — 8 shots', 'f/16 — 4 shots', 'f/22 — 2 shots'],
      correctOption: 'f/8 — 8 shots',
    },
    {
      id: 'stacking-landscape-technique',
      difficulty: 'intermediate',
      targetField: 'focusDistance',
      optionValues: ['Focus at infinity', 'Focus at hyperfocal', 'Stack from 1m to infinity', 'Use f/22'],
      correctOption: 'Stack from 1m to infinity',
    },
    {
      id: 'stacking-overlap-purpose',
      difficulty: 'beginner',
      targetField: 'overlap',
      optionValues: ['Sharper image', 'Alignment tolerance', 'More bokeh', 'Wider field of view'],
      correctOption: 'Alignment tolerance',
    },
  ],
}
