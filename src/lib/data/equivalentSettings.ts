import { APERTURES_THIRD_STOP } from './camera'

export function closestRealAperture(target: number): number {
  let closest = APERTURES_THIRD_STOP[0]
  let minDist = Infinity
  for (const a of APERTURES_THIRD_STOP) {
    const dist = Math.abs(Math.log(a) - Math.log(target))
    if (dist < minDist) {
      minDist = dist
      closest = a
    }
  }
  return closest
}

export const COMMON_FOCAL_LENGTHS = [
  8, 10, 12, 14, 16, 18, 20, 24, 28, 35, 40, 50, 56, 70, 85, 100, 105, 135, 200, 300, 400, 500, 600, 800,
]

export function closestRealFL(target: number): number {
  let closest = COMMON_FOCAL_LENGTHS[0]
  let minDist = Infinity
  for (const fl of COMMON_FOCAL_LENGTHS) {
    const dist = Math.abs(fl - target)
    if (dist < minDist) {
      minDist = dist
      closest = fl
    }
  }
  return closest
}
