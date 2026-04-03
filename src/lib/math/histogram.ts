export interface HistogramData {
  r: number[] // 256 bins
  g: number[]
  b: number[]
  luma: number[]
}

/**
 * Compute per-channel histograms from raw image pixel data.
 *
 * Iterates through each pixel of an RGBA pixel array and tallies the
 * brightness distribution into 256 bins per channel (R, G, B, and Luma).
 * Luma is computed using Rec. 709 coefficients: 0.2126R + 0.7152G + 0.0722B.
 *
 * @param data   - Uint8ClampedArray from ImageData (RGBA format, 4 bytes per pixel)
 * @param width  - Image width in pixels
 * @param height - Image height in pixels
 * @returns Histogram with 256 bins for each of R, G, B, and luma channels
 */
export function computeHistogram(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): HistogramData {
  const r = new Array<number>(256).fill(0)
  const g = new Array<number>(256).fill(0)
  const b = new Array<number>(256).fill(0)
  const luma = new Array<number>(256).fill(0)

  const totalPixels = width * height

  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4
    const rv = data[offset]
    const gv = data[offset + 1]
    const bv = data[offset + 2]
    // Skip alpha channel (offset + 3)

    r[rv]++
    g[gv]++
    b[bv]++

    // Luma using standard Rec. 709 coefficients
    const lumaVal = Math.round(0.2126 * rv + 0.7152 * gv + 0.0722 * bv)
    luma[Math.min(255, Math.max(0, lumaVal))]++
  }

  return { r, g, b, luma }
}

/**
 * Detect shadow and highlight clipping from a histogram.
 *
 * Clipping occurs when a significant percentage of pixels are pushed to
 * pure black (luma=0) or pure white (luma=255), indicating lost detail.
 * A threshold of 1% is used to flag potential clipping.
 *
 * @param hist - Histogram data from computeHistogram
 * @returns Clipping percentages and boolean flags for black/white clipping
 */
export function detectClipping(hist: HistogramData): {
  blackClipPercent: number
  whiteClipPercent: number
  hasBlackClip: boolean
  hasWhiteClip: boolean
} {
  const totalPixels = hist.luma.reduce((sum, v) => sum + v, 0)

  if (totalPixels === 0) {
    return {
      blackClipPercent: 0,
      whiteClipPercent: 0,
      hasBlackClip: false,
      hasWhiteClip: false,
    }
  }

  const blackClipPercent = (hist.luma[0] / totalPixels) * 100
  const whiteClipPercent = (hist.luma[255] / totalPixels) * 100

  return {
    blackClipPercent,
    whiteClipPercent,
    hasBlackClip: blackClipPercent > 1,
    hasWhiteClip: whiteClipPercent > 1,
  }
}
