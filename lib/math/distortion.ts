/**
 * Barrel/pincushion distortion model using a simplified radial distortion coefficient (k1).
 *
 * k1 < 0 → barrel distortion (wide-angle lenses)
 * k1 = 0 → no distortion (normal ~50mm)
 * k1 > 0 → pincushion distortion (telephoto lenses)
 *
 * Formula: k1 = -0.4 * (1 - focalLength / 50), clamped to [-0.5, 0.3]
 */
export function calcDistortionK1(focalLength: number): number {
  const raw = -0.4 * (1 - focalLength / 50) || 0
  return Math.max(-0.5, Math.min(0.3, raw))
}
