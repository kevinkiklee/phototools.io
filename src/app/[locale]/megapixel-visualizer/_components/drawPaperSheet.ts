import type { AspectRatio, PrintSizePreset } from '@/lib/types'
import { cropOverlap } from '@/lib/math/megapixel'

export type PaperLayout = {
  paperX: number
  paperY: number
  paperW: number
  paperH: number
  imageX: number
  imageY: number
  imageW: number
  imageH: number
  cropPercent: number
  marginPercent: number
  cropSide: 'top-bottom' | 'left-right' | 'none'
  pxPerMm: number
}

export function layoutPaperSheet(
  canvasWidth: number,
  canvasHeight: number,
  padding: number,
  paper: PrintSizePreset,
  orientation: 'landscape' | 'portrait',
  aspect: AspectRatio,
  fitMode: 'crop' | 'fit',
): PaperLayout {
  // Apply orientation — swap w/h if portrait
  const paperWmm =
    orientation === 'landscape' ? Math.max(paper.wMm, paper.hMm) : Math.min(paper.wMm, paper.hMm)
  const paperHmm =
    orientation === 'landscape' ? Math.min(paper.wMm, paper.hMm) : Math.max(paper.wMm, paper.hMm)

  // Fit paper to canvas
  const availW = canvasWidth - padding * 2
  const availH = canvasHeight - padding * 2 - 60 // reserve for labels/scale bar
  const scaleW = availW / paperWmm
  const scaleH = availH / paperHmm
  const pxPerMm = Math.min(scaleW, scaleH)

  const paperW = paperWmm * pxPerMm
  const paperH = paperHmm * pxPerMm
  const paperX = (canvasWidth - paperW) / 2
  const paperY = padding

  // Image placement inside paper
  const imageAspect = aspect.w / aspect.h
  const paperAspect = paperWmm / paperHmm
  const overlap = cropOverlap(imageAspect, paperAspect)
  const cropPercent = overlap.cropSide === 'none' ? 0 : Math.round((1 - overlap.retained) * 100)

  let imageX: number
  let imageY: number
  let imageW: number
  let imageH: number
  let marginPercent = 0

  if (fitMode === 'crop' || overlap.cropSide === 'none') {
    // Image fills paper entirely (cropping image edges when mismatched)
    imageX = paperX
    imageY = paperY
    imageW = paperW
    imageH = paperH
  } else {
    // Fit: image fits inside paper with margins
    if (imageAspect > paperAspect) {
      imageW = paperW
      imageH = paperW / imageAspect
      imageX = paperX
      imageY = paperY + (paperH - imageH) / 2
    } else {
      imageH = paperH
      imageW = paperH * imageAspect
      imageX = paperX + (paperW - imageW) / 2
      imageY = paperY
    }
    const imageArea = imageW * imageH
    const paperArea = paperW * paperH
    marginPercent = Math.round((1 - imageArea / paperArea) * 100)
  }

  return {
    paperX,
    paperY,
    paperW,
    paperH,
    imageX,
    imageY,
    imageW,
    imageH,
    cropPercent,
    marginPercent,
    cropSide: overlap.cropSide,
    pxPerMm,
  }
}

export function drawPaperSheet(ctx: CanvasRenderingContext2D, layout: PaperLayout) {
  // Paper (white/light)
  ctx.save()
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)'
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 2
  ctx.fillRect(layout.paperX, layout.paperY, layout.paperW, layout.paperH)
  ctx.strokeRect(layout.paperX, layout.paperY, layout.paperW, layout.paperH)

  // Image placeholder (gradient)
  const g = ctx.createLinearGradient(
    layout.imageX,
    layout.imageY,
    layout.imageX + layout.imageW,
    layout.imageY + layout.imageH,
  )
  g.addColorStop(0, '#3b82f6')
  g.addColorStop(0.5, '#8b5cf6')
  g.addColorStop(1, '#ec4899')
  ctx.globalAlpha = 0.6
  ctx.fillStyle = g
  ctx.fillRect(layout.imageX, layout.imageY, layout.imageW, layout.imageH)
  ctx.restore()
}
