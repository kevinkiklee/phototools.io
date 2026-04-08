export type QualityTier = 'excellent' | 'good' | 'acceptable' | 'soft'
export type ViewingDistance = 'arms' | 'near' | 'far'
export type BitDepth = 'jpeg8' | 'raw14' | 'tiff16'

const MM_PER_INCH = 25.4
const BYTES_PER_PIXEL: Record<BitDepth, number> = {
  jpeg8:  0.3,
  raw14:  1.75,
  tiff16: 6,
}

// Approximate minimum PPI for "sharp" at each viewing distance
// based on ~1 arcmin eye acuity.
const THRESHOLD_PPI: Record<ViewingDistance, number> = {
  arms: 300,   // ~12"
  near: 100,   // ~36" (3 ft)
  far:  50,    // ~72" (6 ft)
}

export function printSizeMm(pxW: number, pxH: number, dpi: number): { wMm: number; hMm: number } {
  return {
    wMm: (pxW / dpi) * MM_PER_INCH,
    hMm: (pxH / dpi) * MM_PER_INCH,
  }
}

export function qualityTier(dpi: number, distance: ViewingDistance): QualityTier {
  const threshold = THRESHOLD_PPI[distance]
  const ratio = dpi / threshold
  if (ratio >= 1.0) return 'excellent'
  if (ratio >= 0.8) return 'good'
  if (ratio >= 0.6) return 'acceptable'
  return 'soft'
}

export function effectiveDpi(actualDpi: number, distance: ViewingDistance): number {
  // "Effective" DPI relative to arms-length eye acuity baseline.
  const base = THRESHOLD_PPI.arms
  const scale = base / THRESHOLD_PPI[distance]
  return actualDpi * scale
}

export function fileSizeBytes(mp: number, depth: BitDepth): number {
  return mp * 1e6 * BYTES_PER_PIXEL[depth]
}

export function cropOverlap(
  imageAspect: number,
  paperAspect: number,
): { retained: number; cropSide: 'top-bottom' | 'left-right' | 'none' } {
  if (Math.abs(imageAspect - paperAspect) < 0.01) {
    return { retained: 1, cropSide: 'none' }
  }
  if (imageAspect > paperAspect) {
    return { retained: paperAspect / imageAspect, cropSide: 'left-right' }
  }
  return { retained: imageAspect / paperAspect, cropSide: 'top-bottom' }
}
