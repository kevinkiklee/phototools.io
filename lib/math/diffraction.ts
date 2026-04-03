/**
 * Calculate pixel pitch in micrometers from sensor width and resolution.
 * Assumes 3:2 aspect ratio.
 * sensorWidthMm: sensor width in mm
 * resolutionMp: resolution in megapixels
 * Returns pitch in micrometers (µm)
 */
export function pixelPitch(sensorWidthMm: number, resolutionMp: number): number {
  // 3:2 ratio: totalPixels = width * height, width/height = 3/2
  // totalPixels = resolutionMp * 1e6
  // widthPixels = sqrt(totalPixels * 3/2)
  // pixelPitch (mm) = sensorWidthMm / widthPixels
  // pixelPitch (µm) = pixelPitch (mm) * 1000
  const totalPixels = resolutionMp * 1e6
  const widthPixels = Math.sqrt(totalPixels * (3 / 2))
  const pitchMm = sensorWidthMm / widthPixels
  return pitchMm * 1000
}

/**
 * Diffraction-limited aperture.
 * f_diff ≈ pixelPitchUm / 0.67
 * pixelPitchUm: pixel pitch in micrometers
 * Returns f-number
 */
export function diffractionLimitedAperture(pixelPitchUm: number): number {
  return pixelPitchUm / 0.67
}
