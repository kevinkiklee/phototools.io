/** Full-frame (36x24mm) sensor dimensions used as reference for FOV calculations. */
const SENSOR_WIDTH = 36 // mm, full-frame
const SENSOR_HEIGHT = 24 // mm, full-frame
const RAD_TO_DEG = 180 / Math.PI

export interface FOVResult {
  horizontal: number // degrees
  vertical: number   // degrees
}

/**
 * Calculate the horizontal and vertical field of view for a given lens.
 *
 * Uses the standard rectilinear projection formula:
 *   FOV = 2 * atan(sensorDimension / (2 * effectiveFocalLength))
 *
 * The effective focal length accounts for the crop factor:
 *   effective = focalLength * cropFactor
 *
 * @param focalLength - Lens focal length in mm (e.g. 50)
 * @param cropFactor  - Sensor crop factor relative to 36x24mm (1.0 = full frame, 1.5 = APS-C)
 * @returns Horizontal and vertical FOV in degrees
 */
export function calcFOV(focalLength: number, cropFactor: number): FOVResult {
  const effective = focalLength * cropFactor
  return {
    horizontal: 2 * Math.atan(SENSOR_WIDTH / (2 * effective)) * RAD_TO_DEG,
    vertical: 2 * Math.atan(SENSOR_HEIGHT / (2 * effective)) * RAD_TO_DEG,
  }
}

/**
 * Calculate the physical width of the frame at a given distance.
 *
 * Uses trigonometry: frameWidth = 2 * distance * tan(FOV / 2)
 *
 * Useful for understanding how much of a scene a lens covers at a specific
 * shooting distance (e.g. "at 10m, a 50mm lens covers 7.5m of width").
 *
 * @param horizontalFOVDeg - Horizontal field of view in degrees
 * @param distance         - Distance to subject (in any unit; result uses same unit)
 * @returns Frame width in the same unit as distance
 */
export function calcFrameWidth(horizontalFOVDeg: number, distance: number): number {
  const halfAngleRad = (horizontalFOVDeg / 2) * (Math.PI / 180)
  return 2 * distance * Math.tan(halfAngleRad)
}

/**
 * Calculate the 35mm-equivalent focal length for a given sensor.
 *
 * equivalent = focalLength * cropFactor, rounded to nearest integer.
 * For example, 35mm on APS-C (1.5x) = 53mm equivalent.
 *
 * @param focalLength - Actual lens focal length in mm
 * @param cropFactor  - Sensor crop factor
 * @returns Equivalent focal length in mm (rounded)
 */
export function calcEquivFocalLength(focalLength: number, cropFactor: number): number {
  return Math.round(focalLength * cropFactor)
}

/**
 * Calculate the ratio between two FOVs, used to scale overlay rectangles.
 *
 * The ratio compares the tangent of each half-angle rather than the raw degrees,
 * because tangent correctly maps angular FOV to linear frame size on the image plane.
 *
 *   ratio = tan(narrowFOV / 2) / tan(wideFOV / 2)
 *
 * A ratio of 0.5 means the narrow lens sees half the linear width of the wide lens.
 *
 * @param narrowFOVDeg - The narrower (telephoto) FOV in degrees
 * @param wideFOVDeg   - The wider (reference) FOV in degrees
 * @returns Linear size ratio (0 to 1 when narrow <= wide)
 */
export function calcCropRatio(narrowFOVDeg: number, wideFOVDeg: number): number {
  return Math.tan((narrowFOVDeg / 2) * (Math.PI / 180)) /
         Math.tan((wideFOVDeg / 2) * (Math.PI / 180))
}
