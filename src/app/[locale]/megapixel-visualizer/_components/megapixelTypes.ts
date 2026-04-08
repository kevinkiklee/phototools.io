import type { UnitSystem, CustomMegapixel } from '@/lib/types'
import type { ViewingDistance, BitDepth } from '@/lib/math/megapixel'

export type DisplayMode = 'overlay' | 'side-by-side' | 'print-preset' | 'print-table'

export const ANIM_DURATION = 300

export const STORAGE_KEY = 'phototools:custom-megapixels'
export const STORAGE_VERSION = 1

export type StoredCustomMegapixels = {
  v: number
  entries: CustomMegapixel[]
}

export type MegapixelControlsProps = {
  visible: Set<string>
  mode: DisplayMode
  aspectId: string
  dpi: number
  units: UnitSystem
  viewingDistance: ViewingDistance
  bitDepth: BitDepth
  printPresetId: string
  printOrientation: 'landscape' | 'portrait'
  printFitMode: 'crop' | 'fit'
  cropTargetId: string | null
  customMps: CustomMegapixel[]
  onToggleMp: (id: string) => void
  onModeChange: (m: DisplayMode) => void
  onAspectChange: (id: string) => void
  onDpiChange: (dpi: number) => void
  onUnitsChange: (u: UnitSystem) => void
  onViewingDistanceChange: (d: ViewingDistance) => void
  onBitDepthChange: (b: BitDepth) => void
  onPrintPresetChange: (id: string) => void
  onPrintOrientationChange: (o: 'landscape' | 'portrait') => void
  onPrintFitModeChange: (f: 'crop' | 'fit') => void
  onCropTargetChange: (id: string | null) => void
  onAddCustomMp: (name: string, mp: number) => void
  onEditCustomMp: (id: string, name: string, mp: number) => void
  onRemoveCustomMp: (id: string) => void
  onRemoveAllCustom: () => void
}

export { type UnitSystem, type CustomMegapixel, type ViewingDistance, type BitDepth }
