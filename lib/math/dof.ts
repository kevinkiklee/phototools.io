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
 * Calculate hyperfocal distance in meters.
 * H = f^2 / (N * c) + f  (all in mm), then convert to meters
 */
export function calcHyperfocal(focalLength: number, aperture: number, coc: number): number {
  const H_mm = (focalLength * focalLength) / (aperture * coc) + focalLength
  return H_mm / 1000
}

/**
 * Calculate depth of field.
 * Uses formulas with distances in mm internally, returns meters.
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
