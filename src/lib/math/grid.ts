export const GOLDEN_RATIO = (1 + Math.sqrt(5)) / 2

export function drawRuleOfThirds(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const third_w = w / 3
  const third_h = h / 3

  ctx.beginPath()
  ctx.moveTo(third_w, 0)
  ctx.lineTo(third_w, h)
  ctx.moveTo(third_w * 2, 0)
  ctx.lineTo(third_w * 2, h)
  ctx.moveTo(0, third_h)
  ctx.lineTo(w, third_h)
  ctx.moveTo(0, third_h * 2)
  ctx.lineTo(w, third_h * 2)
  ctx.stroke()
}

export function drawGoldenRatio(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const phiW = w / GOLDEN_RATIO
  const phiH = h / GOLDEN_RATIO

  ctx.beginPath()
  ctx.moveTo(phiW, 0)
  ctx.lineTo(phiW, h)
  ctx.moveTo(w - phiW, 0)
  ctx.lineTo(w - phiW, h)
  ctx.moveTo(0, phiH)
  ctx.lineTo(w, phiH)
  ctx.moveTo(0, h - phiH)
  ctx.lineTo(w, h - phiH)
  ctx.stroke()
}

export function drawGoldenSpiral(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  rotation: 0 | 90 | 180 | 270,
): void {
  ctx.save()
  ctx.translate(w / 2, h / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.translate(-w / 2, -h / 2)

  ctx.beginPath()

  let x = 0
  let y = 0
  let rw = w
  let rh = h

  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? rh : rw
    const corner = i % 4

    let cx: number, cy: number
    let startAngle: number

    switch (corner) {
      case 0:
        cx = x + rw
        cy = y + rh
        startAngle = Math.PI
        break
      case 1:
        cx = x
        cy = y + rh
        startAngle = -Math.PI / 2
        break
      case 2:
        cx = x
        cy = y
        startAngle = 0
        break
      default:
        cx = x + rw
        cy = y
        startAngle = Math.PI / 2
        break
    }

    ctx.arc(cx, cy, r, startAngle, startAngle + Math.PI / 2)

    if (i % 2 === 0) {
      const newH = rh / GOLDEN_RATIO
      if (corner === 0) y += rh - newH
      rh = newH
    } else {
      const newW = rw / GOLDEN_RATIO
      if (corner === 3) x += rw - newW
      rw = newW
    }
  }

  ctx.stroke()
  ctx.restore()
}

export function drawDiagonalLines(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w, h)
  ctx.moveTo(w, 0)
  ctx.lineTo(0, h)
  ctx.stroke()
}

export function drawCenterCross(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  const cx = w / 2
  const cy = h / 2

  ctx.beginPath()
  ctx.moveTo(cx, 0)
  ctx.lineTo(cx, h)
  ctx.moveTo(0, cy)
  ctx.lineTo(w, cy)
  ctx.stroke()
}

export function drawSquareGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  density: number,
): void {
  const stepX = w / density
  const stepY = h / density

  ctx.beginPath()
  for (let i = 1; i < density; i++) {
    ctx.moveTo(stepX * i, 0)
    ctx.lineTo(stepX * i, h)
  }
  for (let i = 1; i < density; i++) {
    ctx.moveTo(0, stepY * i)
    ctx.lineTo(w, stepY * i)
  }
  ctx.stroke()
}

export function drawTriangles(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
): void {
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(w, h)
  ctx.moveTo(w, 0)
  ctx.lineTo(0, h)
  ctx.moveTo(0, h)
  ctx.lineTo(w, 0)
  ctx.moveTo(w, h)
  ctx.lineTo(0, 0)
  ctx.stroke()
}
