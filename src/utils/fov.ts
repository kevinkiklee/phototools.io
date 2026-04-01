const SENSOR_WIDTH = 36 // mm, full-frame
const SENSOR_HEIGHT = 24 // mm, full-frame
const RAD_TO_DEG = 180 / Math.PI

export interface FOVResult {
  horizontal: number // degrees
  vertical: number   // degrees
}

export function calcFOV(focalLength: number, cropFactor: number): FOVResult {
  const effective = focalLength * cropFactor
  return {
    horizontal: 2 * Math.atan(SENSOR_WIDTH / (2 * effective)) * RAD_TO_DEG,
    vertical: 2 * Math.atan(SENSOR_HEIGHT / (2 * effective)) * RAD_TO_DEG,
  }
}

export function calcFrameWidth(horizontalFOVDeg: number, distance: number): number {
  const halfAngleRad = (horizontalFOVDeg / 2) * (Math.PI / 180)
  return 2 * distance * Math.tan(halfAngleRad)
}

export function calcEquivFocalLength(focalLength: number, cropFactor: number): number {
  return Math.round(focalLength * cropFactor)
}

export function calcCropRatio(narrowFOVDeg: number, wideFOVDeg: number): number {
  return Math.tan((narrowFOVDeg / 2) * (Math.PI / 180)) /
         Math.tan((wideFOVDeg / 2) * (Math.PI / 180))
}
