export interface HistogramData {
  r: number[] // 256 bins
  g: number[]
  b: number[]
  luma: number[]
}

/**
 * Compute histogram from ImageData pixel array (RGBA format).
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
 * Detect clipping based on luma channel.
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
