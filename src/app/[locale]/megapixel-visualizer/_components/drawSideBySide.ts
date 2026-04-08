import type { MegapixelPreset, UnitSystem, AspectRatio } from '@/lib/types'
import { mpToPixelDimensions } from '@/lib/math/resolution'
import { printSizeMm } from '@/lib/math/megapixel'
import { drawRect, drawLabel } from './drawHelpers'

export function drawSideBySide(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  visibleMps: MegapixelPreset[],
  aspect: AspectRatio,
  dpi: number,
  _units: UnitSystem,
): { contentHeight: number; pxPerMm: number } {
  if (visibleMps.length === 0) {
    return { contentHeight: 300, pxPerMm: 0 }
  }

  // Compute print sizes
  const sized = visibleMps
    .map(m => {
      const { pxW, pxH } = mpToPixelDimensions(m.mp, aspect)
      const { wMm, hMm } = printSizeMm(pxW, pxH, dpi)
      return { mp: m, wMm, hMm }
    })
    .sort((a, b) => b.wMm * b.hMm - (a.wMm * a.hMm))

  const gap = 20
  const labelH = 30
  const totalMmW = sized.reduce((acc, s) => acc + s.wMm, 0)
  const availW = canvasWidth - padding * 2 - gap * (sized.length - 1)
  const maxHMm = Math.max(...sized.map(s => s.hMm))

  const scaleByW = availW / totalMmW
  const scaleByH = (canvasHeight - padding * 2 - labelH - 40) / maxHMm
  const pxPerMm = Math.min(scaleByW, scaleByH)

  let x = padding
  const baseY = padding + maxHMm * pxPerMm
  for (const { mp, wMm, hMm } of sized) {
    const w = wMm * pxPerMm
    const h = hMm * pxPerMm
    const y = baseY - h
    drawRect(ctx, x, y, w, h, mp.color, 1)
    drawLabel(ctx, mp.name, x + w / 2, baseY + 6, mp.color, 1)
    x += w + gap
  }

  const contentHeight = Math.max(400, baseY + labelH + padding + 40)
  return { contentHeight, pxPerMm }
}
