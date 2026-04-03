/**
 * Calculate maximum exposure time for point-like stars using the 500 rule.
 *
 * A simple rule of thumb used by astrophotographers:
 *   maxExposure = 500 / (focalLength * cropFactor)
 *
 * Stars appear as points below this time; above it, Earth's rotation causes
 * visible trailing. Less accurate on high-resolution sensors -- use NPF rule instead.
 *
 * @param focalLength - Focal length in mm
 * @param cropFactor  - Sensor crop factor
 * @returns Maximum exposure in seconds before star trailing becomes visible
 */
export function rule500(focalLength: number, cropFactor: number): number {
  return 500 / (focalLength * cropFactor)
}

/**
 * Calculate maximum exposure time using the NPF rule (more accurate than the 500 rule).
 *
 * Accounts for aperture and pixel pitch to give a sensor-specific limit:
 *   maxExposure = (35 * aperture + 30 * pixelPitch) / focalLength
 *
 * Developed by Frédéric Michaud for the Société Astronomique du Havre.
 * More reliable than the 500 rule on modern high-resolution sensors.
 *
 * @param aperture     - F-number (e.g. 2.8)
 * @param focalLength  - Focal length in mm
 * @param pixelPitchUm - Pixel pitch in micrometers (from diffraction.pixelPitch)
 * @returns Maximum exposure in seconds before star trailing is visible
 */
export function ruleNPF(aperture: number, focalLength: number, pixelPitchUm: number): number {
  return (35 * aperture + 30 * pixelPitchUm) / focalLength
}

/**
 * Calculate total shooting time for a star trail stacking session.
 *
 * Star trail images are created by stacking many shorter exposures.
 * Total time includes the gap between frames (for camera buffer/processing).
 *
 *   totalTime = numFrames * (exposurePerFrame + gapSeconds)
 *
 * @param exposurePerFrame - Exposure time per frame in seconds
 * @param numFrames        - Number of frames to capture
 * @param gapSeconds       - Pause between frames in seconds (for buffer clearing)
 * @returns Total shooting time in seconds
 */
export function stackingTime(exposurePerFrame: number, numFrames: number, gapSeconds: number): number {
  return numFrames * (exposurePerFrame + gapSeconds)
}

/**
 * Format a duration in seconds to a human-readable string.
 * Uses "Xh Ym" for durations >= 1 hour, "Xm Ys" otherwise.
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
