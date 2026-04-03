/**
 * EV = log2(N^2 / t)
 * where N = aperture (f-number), t = shutter speed in seconds
 */
export function calcEV(aperture: number, shutterSpeed: number): number {
  return Math.log2((aperture * aperture) / shutterSpeed)
}

/**
 * Apply ND filter: multiply shutter speed by 2^stops
 */
export function shutterWithNd(baseShutter: number, ndStops: number): number {
  return baseShutter * Math.pow(2, ndStops)
}

/**
 * Convert ND factor (e.g., ND8 = 8) to stops (e.g., 3)
 */
export function ndFactorToStops(factor: number): number {
  return Math.log2(factor)
}

/**
 * Format shutter speed:
 * - < 1s → "1/N" fraction
 * - >= 1s and < 60s → "Xs"
 * - >= 60s → "Xm Ys" or "Xm" if no remainder
 */
export function formatShutterSpeed(seconds: number): string {
  if (seconds < 1) {
    const denominator = Math.round(1 / seconds)
    return `1/${denominator}`
  }
  if (seconds < 60) {
    const s = Math.round(seconds)
    return `${s}s`
  }
  const totalSeconds = Math.round(seconds)
  const minutes = Math.floor(totalSeconds / 60)
  const remainderSeconds = totalSeconds % 60
  if (remainderSeconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${remainderSeconds}s`
}

/**
 * Reciprocal rule: minimum shutter speed = 1 / (focalLength * cropFactor)
 * stabStops: number of stabilization stops (reduces requirement)
 * Result in seconds
 */
export function reciprocalRule(focalLength: number, cropFactor: number, stabStops: number): number {
  const baseShutter = 1 / (focalLength * cropFactor)
  // Each stop of stabilization allows 2x longer shutter
  return baseShutter * Math.pow(2, stabStops)
}

/**
 * Solve for shutter speed given EV, aperture, and ISO.
 * EV at ISO 100: EV100 = log2(N^2 / t)
 * With ISO: EV = EV100 + log2(ISO/100)
 * So: t = N^2 / (2^(EV - log2(ISO/100)))
 *       = N^2 * 100 / (2^EV * ISO)
 */
export function solveForShutter(ev: number, aperture: number, iso: number): number {
  return (aperture * aperture * 100) / (Math.pow(2, ev) * iso)
}

/**
 * Solve for aperture given EV, shutter speed, and ISO.
 * N^2 = t * 2^(EV - log2(ISO/100))
 *      = t * 2^EV * ISO / 100
 */
export function solveForAperture(ev: number, shutterSpeed: number, iso: number): number {
  return Math.sqrt((shutterSpeed * Math.pow(2, ev) * iso) / 100)
}

/**
 * Solve for ISO given EV, aperture, and shutter speed.
 * ISO = 100 * N^2 / (t * 2^EV)
 */
export function solveForISO(ev: number, aperture: number, shutterSpeed: number): number {
  return (100 * aperture * aperture) / (shutterSpeed * Math.pow(2, ev))
}
