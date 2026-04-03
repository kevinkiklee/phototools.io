/**
 * Calculate pixel pitch (the physical size of one pixel) from sensor dimensions.
 *
 * Assumes a 3:2 aspect ratio (standard for most cameras). The derivation:
 *   totalPixels = resolutionMp * 1,000,000
 *   widthPixels = sqrt(totalPixels * 3/2)   (from width/height = 3/2)
 *   pixelPitch  = sensorWidth / widthPixels
 *
 * Pixel pitch determines how sensitive the sensor is to diffraction and
 * how much detail it can resolve per pixel.
 *
 * @param sensorWidthMm - Sensor width in mm (e.g. 36 for full frame)
 * @param resolutionMp   - Sensor resolution in megapixels (e.g. 24)
 * @returns Pixel pitch in micrometers (µm)
 */
export function pixelPitch(sensorWidthMm: number, resolutionMp: number): number {
  const totalPixels = resolutionMp * 1e6
  const widthPixels = Math.sqrt(totalPixels * (3 / 2))
  const pitchMm = sensorWidthMm / widthPixels
  return pitchMm * 1000
}

/**
 * Calculate the aperture at which diffraction begins to soften the image
 * beyond what the sensor can resolve.
 *
 * Based on the Airy disk diameter matching the pixel pitch:
 *   f_diff ≈ pixelPitch / 0.67
 *
 * The 0.67 constant comes from the Airy disk formula for green light (~550nm).
 * Stopping down beyond this f-number will reduce per-pixel sharpness due to
 * diffraction, even though overall depth of field increases.
 *
 * @param pixelPitchUm - Pixel pitch in micrometers
 * @returns Diffraction-limited f-number
 */
export function diffractionLimitedAperture(pixelPitchUm: number): number {
  return pixelPitchUm / 0.67
}
