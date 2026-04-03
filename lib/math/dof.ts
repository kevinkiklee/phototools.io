export interface DoFInput {
  focalLength: number // mm
  aperture: number // f-number
  distance: number // meters
  coc: number // circle of confusion in mm
}

export interface DoFResult {
  nearFocus: number // meters
  farFocus: number // meters (Infinity if past hyperfocal)
  totalDoF: number // meters (Infinity if past hyperfocal)
  hyperfocal: number // meters
}

/**
 * Calculate hyperfocal distance -- the focus distance beyond which everything
 * from half that distance to infinity appears acceptably sharp.
 *
 * Formula (all in mm):
 *   H = f^2 / (N * c) + f
 *
 * Where:
 *   f = focal length in mm
 *   N = aperture f-number
 *   c = circle of confusion in mm (sensor-dependent)
 *
 * @param focalLength - Focal length in mm
 * @param aperture    - Aperture f-number (e.g. 8 for f/8)
 * @param coc         - Circle of confusion diameter in mm
 * @returns Hyperfocal distance in meters
 */
export function calcHyperfocal(focalLength: number, aperture: number, coc: number): number {
  const H_mm = (focalLength * focalLength) / (aperture * coc) + focalLength
  return H_mm / 1000
}

/**
 * Calculate depth of field (DoF) -- the range of distances that appear
 * acceptably sharp for given lens parameters.
 *
 * Near limit:  Dn = s * (H - f) / (H + s - 2f)
 * Far limit:   Df = s * (H - f) / (H - s)   (Infinity when s >= H)
 *
 * Where s = subject distance, H = hyperfocal distance, f = focal length.
 * All internal math uses mm; inputs/outputs are in meters.
 *
 * @param input - Focal length (mm), aperture, distance (m), CoC (mm)
 * @returns Near focus, far focus, total DoF, and hyperfocal distance (all in meters)
 */
export function calcDoF(input: DoFInput): DoFResult {
  const { focalLength, aperture, distance, coc } = input
  const f = focalLength // mm
  const s = distance * 1000 // convert meters to mm
  const H = calcHyperfocal(focalLength, aperture, coc) * 1000 // hyperfocal in mm

  // Near focus distance (mm)
  const nearMm = (s * (H - f)) / (H + s - 2 * f)

  // Far focus distance (mm) — Infinity when s >= H
  let farMm: number
  if (s >= H) {
    farMm = Infinity
  } else {
    farMm = (s * (H - f)) / (H - s)
  }

  const nearFocus = nearMm / 1000
  const farFocus = farMm === Infinity ? Infinity : farMm / 1000
  const totalDoF = farFocus === Infinity ? Infinity : farFocus - nearFocus
  const hyperfocal = H / 1000

  return { nearFocus, farFocus, totalDoF, hyperfocal }
}
