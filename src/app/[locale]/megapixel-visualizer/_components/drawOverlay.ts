import type { MegapixelPreset, UnitSystem, AspectRatio } from '@/lib/types'
import { mpToPixelDimensions } from '@/lib/math/resolution'
import { printSizeMm } from '@/lib/math/megapixel'
import { drawRect, drawLabel } from './drawHelpers'

export type OverlayRect = { id: string; x: number; y: number; w: number; h: number }
export let overlayRects: OverlayRect[] = []

export function drawOverlay(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  visibleMps: MegapixelPreset[],
  aspect: AspectRatio,
  dpi: number,
  _units: UnitSystem,
  hoveredId: string | null,
): { contentHeight: number; pxPerMm: number } {
  overlayRects = []
  if (visibleMps.length === 0) {
    return { contentHeight: 300, pxPerMm: 0 }
  }

  // Compute print size in mm for each MP
  const sized = visibleMps
    .map(m => {
      const { pxW, pxH } = mpToPixelDimensions(m.mp, aspect)
      const { wMm, hMm } = printSizeMm(pxW, pxH, dpi)
      return { mp: m, wMm, hMm }
    })
    .sort((a, b) => b.wMm * b.hMm - (a.wMm * a.hMm))

  // Find largest so we can fit to viewport
  const maxWMm = sized[0].wMm
  const maxHMm = sized[0].hMm

  // Available space
  const availW = canvasWidth - padding * 2
  const availH = canvasHeight - padding * 2 - 40 // reserve 40px for scale bar

  // Fit scale
  const scaleW = availW / maxWMm
  const scaleH = availH / maxHMm
  const pxPerMm = Math.min(scaleW, scaleH)

  const cx = canvasWidth / 2
  const cy = padding + (maxHMm * pxPerMm) / 2

  // Draw largest first, smallest on top
  for (const { mp, wMm, hMm } of sized) {
    const w = wMm * pxPerMm
    const h = hMm * pxPerMm
    const x = cx - w / 2
    const y = cy - h / 2

    const alpha = hoveredId && hoveredId !== mp.id ? 0.3 : 1
    drawRect(ctx, x, y, w, h, mp.color, alpha)

    overlayRects.push({ id: mp.id, x, y, w, h })
  }

  // Draw labels offset to avoid overlap (top-right of each rect)
  for (const { mp, wMm, hMm } of sized) {
    const w = wMm * pxPerMm
    const h = hMm * pxPerMm
    const x = cx - w / 2
    const y = cy - h / 2
    const alpha = hoveredId && hoveredId !== mp.id ? 0.3 : 1
    drawLabel(ctx, mp.name, x + w + 4, y, mp.color, alpha)
  }

  const contentHeight = Math.max(400, maxHMm * pxPerMm + padding * 2 + 40)
  return { contentHeight, pxPerMm }
}
