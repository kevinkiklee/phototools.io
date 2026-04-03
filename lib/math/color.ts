/**
 * Convert color temperature (Kelvin) to approximate RGB values (0-255).
 * Based on Tanner Helland's algorithm.
 */
export function kelvinToRgb(kelvin: number): { r: number; g: number; b: number } {
  const temp = Math.max(1000, Math.min(40000, kelvin)) / 100

  let r: number
  let g: number
  let b: number

  // Red
  if (temp <= 66) {
    r = 255
  } else {
    r = temp - 60
    r = 329.698727446 * Math.pow(r, -0.1332047592)
    r = Math.max(0, Math.min(255, r))
  }

  // Green
  if (temp <= 66) {
    g = temp
    g = 99.4708025861 * Math.log(g) - 161.1195681661
    g = Math.max(0, Math.min(255, g))
  } else {
    g = temp - 60
    g = 288.1221695283 * Math.pow(g, -0.0755148492)
    g = Math.max(0, Math.min(255, g))
  }

  // Blue
  if (temp >= 66) {
    b = 255
  } else if (temp <= 19) {
    b = 0
  } else {
    b = temp - 10
    b = 138.5177312231 * Math.log(b) - 305.0447927307
    b = Math.max(0, Math.min(255, b))
  }

  return {
    r: Math.round(r),
    g: Math.round(g),
    b: Math.round(b),
  }
}

/**
 * Convert HSL to RGB.
 * h: 0-360, s: 0-100, l: 0-100
 * Returns r, g, b: 0-255
 */
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sn = s / 100
  const ln = l / 100

  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2

  let r1 = 0
  let g1 = 0
  let b1 = 0

  if (h < 60) {
    r1 = c; g1 = x; b1 = 0
  } else if (h < 120) {
    r1 = x; g1 = c; b1 = 0
  } else if (h < 180) {
    r1 = 0; g1 = c; b1 = x
  } else if (h < 240) {
    r1 = 0; g1 = x; b1 = c
  } else if (h < 300) {
    r1 = x; g1 = 0; b1 = c
  } else {
    r1 = c; g1 = 0; b1 = x
  }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  }
}

/**
 * Convert RGB to HSL.
 * r, g, b: 0-255
 * Returns h: 0-360, s: 0-100, l: 0-100
 */
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255

  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const delta = max - min

  const l = (max + min) / 2

  let s = 0
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1))
  }

  let h = 0
  if (delta !== 0) {
    if (max === rn) {
      h = 60 * (((gn - bn) / delta) % 6)
    } else if (max === gn) {
      h = 60 * ((bn - rn) / delta + 2)
    } else {
      h = 60 * ((rn - gn) / delta + 4)
    }
  }

  if (h < 0) h += 360

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/** Normalize hue to 0-360 range */
function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360
}

/** Complementary harmony: [hue, hue+180] */
export function complementary(hue: number): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 180)]
}

/** Analogous harmony: [hue-30, hue, hue+30] */
export function analogous(hue: number): number[] {
  return [normalizeHue(hue - 30), normalizeHue(hue), normalizeHue(hue + 30)]
}

/** Triadic harmony: [hue, hue+120, hue+240] */
export function triadic(hue: number): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 120), normalizeHue(hue + 240)]
}

/** Split-complementary harmony: [hue, hue+150, hue+210] */
export function splitComplementary(hue: number): number[] {
  return [normalizeHue(hue), normalizeHue(hue + 150), normalizeHue(hue + 210)]
}
