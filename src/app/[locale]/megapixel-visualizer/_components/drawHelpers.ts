export function drawRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)
  ctx.restore()
}

export function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  alpha: number,
) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.font = 'bold 11px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(text, x, y)
  ctx.restore()
}
