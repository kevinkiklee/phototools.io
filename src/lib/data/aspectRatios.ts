import type { AspectRatio } from '@/lib/types'

export const ASPECT_RATIOS: AspectRatio[] = [
  { id: '1x1',  label: '1:1',  w: 1,  h: 1 },
  { id: '5x4',  label: '5:4',  w: 5,  h: 4 },
  { id: '4x3',  label: '4:3',  w: 4,  h: 3 },
  { id: '3x2',  label: '3:2',  w: 3,  h: 2 },
  { id: '16x9', label: '16:9', w: 16, h: 9 },
  { id: '7x5',  label: '7:5',  w: 7,  h: 5 },
]

export const DEFAULT_ASPECT_ID = '3x2'

export function getAspect(id: string): AspectRatio {
  return ASPECT_RATIOS.find(a => a.id === id)
    ?? ASPECT_RATIOS.find(a => a.id === DEFAULT_ASPECT_ID)!
}
