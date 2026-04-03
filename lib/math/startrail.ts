/**
 * 500 rule: max exposure in seconds = 500 / (focalLength * cropFactor)
 */
export function rule500(focalLength: number, cropFactor: number): number {
  return 500 / (focalLength * cropFactor)
}

/**
 * NPF rule: more accurate formula accounting for aperture and pixel pitch.
 * max exposure = (35 * aperture + 30 * pixelPitchUm) / focalLength
 * pixelPitchUm: pixel pitch in micrometers
 */
export function ruleNPF(aperture: number, focalLength: number, pixelPitchUm: number): number {
  return (35 * aperture + 30 * pixelPitchUm) / focalLength
}

/**
 * Total time for stacking.
 * = numFrames * (exposurePerFrame + gapSeconds)
 * Returns total seconds
 */
export function stackingTime(exposurePerFrame: number, numFrames: number, gapSeconds: number): number {
  return numFrames * (exposurePerFrame + gapSeconds)
}

/**
 * Format seconds as "Xh Ym" or "Xm Ys"
 */
export function formatDuration(totalSeconds: number): string {
  const rounded = Math.round(totalSeconds)
  if (rounded >= 3600) {
    const hours = Math.floor(rounded / 3600)
    const minutes = Math.floor((rounded % 3600) / 60)
    if (minutes === 0) {
      return `${hours}h`
    }
    return `${hours}h ${minutes}m`
  }
  const minutes = Math.floor(rounded / 60)
  const seconds = rounded % 60
  if (seconds === 0) {
    return `${minutes}m`
  }
  return `${minutes}m ${seconds}s`
}
