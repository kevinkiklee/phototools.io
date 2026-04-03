'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import ExifReader from 'exifreader'
import { FileDropZone } from '@/components/shared/FileDropZone'
import { LearnPanel } from '@/components/shared/LearnPanel'
import { getToolBySlug } from '@/lib/data/tools'
import { calcEV } from '@/lib/math/exposure'
import { diffractionLimitedAperture, pixelPitch } from '@/lib/math/diffraction'
import { computeHistogram, detectClipping } from '@/lib/math/histogram'
import type { HistogramData } from '@/lib/math/histogram'
import styles from './ExifViewer.module.css'

const DASH = '\u2014'

const EXPOSURE_PROGRAMS: Record<string, string> = {
  '0': 'Not defined',
  '1': 'Manual',
  '2': 'Program AE',
  '3': 'Aperture Priority',
  '4': 'Shutter Priority',
  '5': 'Creative',
  '6': 'Action',
  '7': 'Portrait',
  '8': 'Landscape',
}

const METERING_MODES: Record<string, string> = {
  '0': 'Unknown',
  '1': 'Average',
  '2': 'Center-weighted',
  '3': 'Spot',
  '4': 'Multi-spot',
  '5': 'Multi-segment',
  '6': 'Partial',
}

const FLASH_MODES: Record<number, string> = {
  0x00: 'No flash',
  0x01: 'Flash fired',
  0x05: 'Flash fired, strobe return not detected',
  0x07: 'Flash fired, strobe return detected',
  0x08: 'Flash did not fire, compulsory',
  0x09: 'Flash fired, compulsory',
  0x0D: 'Flash fired, compulsory, return not detected',
  0x0F: 'Flash fired, compulsory, return detected',
  0x10: 'Flash did not fire, compulsory suppressed',
  0x18: 'Flash did not fire, auto',
  0x19: 'Flash fired, auto',
  0x1D: 'Flash fired, auto, return not detected',
  0x1F: 'Flash fired, auto, return detected',
  0x20: 'No flash function',
  0x41: 'Flash fired, red-eye reduction',
  0x45: 'Flash fired, red-eye, return not detected',
  0x47: 'Flash fired, red-eye, return detected',
  0x49: 'Flash fired, compulsory, red-eye',
  0x4D: 'Flash fired, compulsory, red-eye, return not detected',
  0x4F: 'Flash fired, compulsory, red-eye, return detected',
  0x59: 'Flash fired, auto, red-eye',
  0x5D: 'Flash fired, auto, red-eye, return not detected',
  0x5F: 'Flash fired, auto, red-eye, return detected',
}

const WHITE_BALANCE: Record<string, string> = {
  '0': 'Auto',
  '1': 'Manual',
}

const COLOR_SPACES: Record<string, string> = {
  '1': 'sRGB',
  '2': 'Adobe RGB',
  '65535': 'Uncalibrated',
}

interface ExifResult {
  camera: { make: string; model: string }
  lens: { model: string; make: string }
  settings: {
    fNumber: string
    fNumberRaw: number | null
    exposureTime: string
    exposureTimeRaw: number | null
    iso: string
    isoRaw: number | null
    focalLength: string
    focalLengthRaw: number | null
    focalLength35: string
    exposureProgram: string
    meteringMode: string
    flash: string
    whiteBalance: string
    focusDistance: string
  }
  image: {
    width: string
    widthRaw: number | null
    height: string
    heightRaw: number | null
    orientation: string
    colorSpace: string
    megapixels: string
    aspectRatio: string
  }
  file: { size: string }
  date: string
  gps: { latitude: string; longitude: string } | null
  software: string
  analysis: {
    ev: string | null
    evDescription: string | null
    diffractionWarning: string | null
  }
}

function getTagValue(tags: ExifReader.Tags, key: string): string | undefined {
  const tag = tags[key]
  if (!tag) return undefined
  if ('description' in tag && typeof tag.description === 'string' && tag.description) {
    return tag.description
  }
  if ('value' in tag) {
    const v = tag.value as unknown
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
    if (Array.isArray(v) && v.length > 0) return String(v[0])
  }
  return undefined
}

function getTagNumeric(tags: ExifReader.Tags, key: string): number | null {
  const raw = getTagValue(tags, key)
  if (!raw) return null
  const num = parseFloat(raw)
  return isNaN(num) ? null : num
}

function formatExposureTime(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  if (num >= 1) return `${num}s`
  const denom = Math.round(1 / num)
  return `1/${denom}s`
}

function formatFNumber(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  return `f/${num}`
}

function formatFocalLength(raw: string | undefined): string {
  if (!raw) return DASH
  const num = parseFloat(raw)
  if (isNaN(num)) return raw
  return `${num}mm`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatAspectRatio(w: number, h: number): string {
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b)
  const d = gcd(w, h)
  const rw = w / d
  const rh = h / d
  // Simplify common ratios
  if (rw === 3 && rh === 2) return '3:2'
  if (rw === 2 && rh === 3) return '2:3'
  if (rw === 4 && rh === 3) return '4:3'
  if (rw === 3 && rh === 4) return '3:4'
  if (rw === 16 && rh === 9) return '16:9'
  if (rw === 9 && rh === 16) return '9:16'
  if (rw === 1 && rh === 1) return '1:1'
  // For large numbers, approximate
  const ratio = w / h
  if (Math.abs(ratio - 1.5) < 0.02) return '3:2'
  if (Math.abs(ratio - 1.333) < 0.02) return '4:3'
  if (Math.abs(ratio - 1.778) < 0.02) return '16:9'
  return `${rw}:${rh}`
}

function evDescription(ev: number): string {
  if (ev >= 15) return 'Bright sunlight'
  if (ev >= 13) return 'Overcast / hazy sun'
  if (ev >= 11) return 'Open shade'
  if (ev >= 8) return 'Bright indoor'
  if (ev >= 6) return 'Indoor'
  if (ev >= 4) return 'Dim indoor'
  if (ev >= 2) return 'Night street'
  if (ev >= 0) return 'Dim night'
  return 'Very dark'
}

function parseFlash(tags: ExifReader.Tags): string {
  const tag = tags['Flash']
  if (!tag) return DASH
  if ('value' in tag) {
    const v = tag.value as unknown
    const num = typeof v === 'number' ? v : typeof v === 'string' ? parseInt(v) : Array.isArray(v) ? parseInt(String(v[0])) : NaN
    if (!isNaN(num) && num in FLASH_MODES) return FLASH_MODES[num]
  }
  if ('description' in tag && typeof tag.description === 'string') return tag.description
  return DASH
}

function parseGps(tags: ExifReader.Tags): { latitude: string; longitude: string } | null {
  const lat = tags['GPSLatitude']
  const lon = tags['GPSLongitude']
  if (!lat || !lon) return null
  const latDesc = 'description' in lat ? lat.description : undefined
  const lonDesc = 'description' in lon ? lon.description : undefined
  if (typeof latDesc === 'string' && typeof lonDesc === 'string' && latDesc && lonDesc) {
    return { latitude: `${latDesc}\u00B0`, longitude: `${lonDesc}\u00B0` }
  }
  return null
}

function parseExif(tags: ExifReader.Tags, fileSize: number): ExifResult {
  const fNumberRaw = getTagNumeric(tags, 'FNumber')
  const exposureTimeRaw = getTagNumeric(tags, 'ExposureTime')
  const isoRaw = getTagNumeric(tags, 'ISOSpeedRatings') ?? getTagNumeric(tags, 'PhotographicSensitivity')
  const focalLengthRaw = getTagNumeric(tags, 'FocalLength')
  const widthRaw = getTagNumeric(tags, 'ImageWidth') ?? getTagNumeric(tags, 'PixelXDimension')
  const heightRaw = getTagNumeric(tags, 'ImageHeight') ?? getTagNumeric(tags, 'PixelYDimension')

  // Exposure analysis
  let ev: string | null = null
  let evDesc: string | null = null
  if (fNumberRaw && exposureTimeRaw) {
    const evVal = calcEV(fNumberRaw, exposureTimeRaw)
    const totalEV = isoRaw ? evVal + Math.log2(isoRaw / 100) : evVal
    ev = `EV ${totalEV.toFixed(1)}`
    evDesc = evDescription(totalEV)
  }

  // Diffraction check — estimate sensor width from 35mm equiv
  let diffractionWarning: string | null = null
  if (fNumberRaw && focalLengthRaw && widthRaw && heightRaw) {
    const focalLength35Raw = getTagNumeric(tags, 'FocalLengthIn35mmFilm')
    if (focalLength35Raw && focalLength35Raw > 0) {
      const cropFactor = focalLength35Raw / focalLengthRaw
      const sensorWidth = 36 / cropFactor
      const mp = (widthRaw * heightRaw) / 1e6
      const pitch = pixelPitch(sensorWidth, mp)
      const limitAperture = diffractionLimitedAperture(pitch)
      if (fNumberRaw > limitAperture) {
        diffractionWarning = `Shot at f/${fNumberRaw} — past the diffraction limit of f/${limitAperture.toFixed(1)} for this sensor. Sharpness may be reduced.`
      }
    }
  }

  // Megapixels + aspect ratio
  let megapixels = DASH
  let aspectRatio = DASH
  if (widthRaw && heightRaw) {
    megapixels = `${((widthRaw * heightRaw) / 1e6).toFixed(1)} MP`
    aspectRatio = formatAspectRatio(widthRaw, heightRaw)
  }

  const exposureProgramRaw = getTagValue(tags, 'ExposureProgram')
  const meteringModeRaw = getTagValue(tags, 'MeteringMode')
  const whiteBalanceRaw = getTagValue(tags, 'WhiteBalance')
  const colorSpaceRaw = getTagValue(tags, 'ColorSpace')

  return {
    camera: {
      make: getTagValue(tags, 'Make') ?? DASH,
      model: getTagValue(tags, 'Model') ?? DASH,
    },
    lens: {
      model: getTagValue(tags, 'LensModel') ?? DASH,
      make: getTagValue(tags, 'LensMake') ?? DASH,
    },
    settings: {
      fNumber: formatFNumber(getTagValue(tags, 'FNumber')),
      fNumberRaw,
      exposureTime: formatExposureTime(getTagValue(tags, 'ExposureTime')),
      exposureTimeRaw,
      iso: isoRaw ? String(isoRaw) : DASH,
      isoRaw,
      focalLength: formatFocalLength(getTagValue(tags, 'FocalLength')),
      focalLengthRaw,
      focalLength35: formatFocalLength(getTagValue(tags, 'FocalLengthIn35mmFilm')),
      exposureProgram: exposureProgramRaw ? (EXPOSURE_PROGRAMS[exposureProgramRaw] ?? exposureProgramRaw) : DASH,
      meteringMode: meteringModeRaw ? (METERING_MODES[meteringModeRaw] ?? meteringModeRaw) : DASH,
      flash: parseFlash(tags),
      whiteBalance: whiteBalanceRaw ? (WHITE_BALANCE[whiteBalanceRaw] ?? whiteBalanceRaw) : DASH,
      focusDistance: getTagValue(tags, 'SubjectDistance') ?? getTagValue(tags, 'FocusDistance') ?? DASH,
    },
    image: {
      width: widthRaw ? String(widthRaw) : DASH,
      widthRaw,
      height: heightRaw ? String(heightRaw) : DASH,
      heightRaw,
      orientation: getTagValue(tags, 'Orientation') ?? DASH,
      colorSpace: colorSpaceRaw ? (COLOR_SPACES[colorSpaceRaw] ?? colorSpaceRaw) : DASH,
      megapixels,
      aspectRatio,
    },
    file: { size: formatFileSize(fileSize) },
    date: getTagValue(tags, 'DateTimeOriginal') ?? getTagValue(tags, 'DateTime') ?? DASH,
    gps: parseGps(tags),
    software: getTagValue(tags, 'Software') ?? DASH,
    analysis: { ev, evDescription: evDesc, diffractionWarning },
  }
}

// ── UI Components ──

function Row({ label, value }: { label: string; value: string }) {
  const isMissing = value === DASH
  return (
    <tr>
      <td>{label}</td>
      <td className={isMissing ? styles.missing : undefined}>{value}</td>
    </tr>
  )
}

function Section({ title, rows }: { title: string; rows: [string, string][] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>{title}</div>
      <table className={styles.table}>
        <tbody>
          {rows.map(([label, value]) => (
            <Row key={label} label={label} value={value} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function AnalysisCards({ analysis }: { analysis: ExifResult['analysis'] }) {
  if (!analysis.ev && !analysis.diffractionWarning) return null
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Analysis</div>
      {analysis.ev && (
        <div className={styles.analysisCard}>
          <div className={styles.analysisLabel}>Exposure Value</div>
          <div className={styles.analysisValue}>{analysis.ev}</div>
          {analysis.evDescription && (
            <div className={styles.analysisNote}>{analysis.evDescription}</div>
          )}
        </div>
      )}
      {analysis.diffractionWarning && (
        <div className={styles.warningCard}>{analysis.diffractionWarning}</div>
      )}
    </div>
  )
}

function MiniHistogram({ imageUrl }: { imageUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const img = new Image()
    img.onload = () => {
      // Draw image to offscreen canvas to get pixel data
      const offscreen = document.createElement('canvas')
      const maxDim = 400
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1)
      offscreen.width = Math.round(img.width * scale)
      offscreen.height = Math.round(img.height * scale)
      const offCtx = offscreen.getContext('2d')
      if (!offCtx) return
      offCtx.drawImage(img, 0, 0, offscreen.width, offscreen.height)
      const imageData = offCtx.getImageData(0, 0, offscreen.width, offscreen.height)

      const hist = computeHistogram(imageData.data, offscreen.width, offscreen.height)
      const clipping = detectClipping(hist)

      // Draw histogram
      const dpr = window.devicePixelRatio || 1
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)

      ctx.clearRect(0, 0, w, h)

      const maxVal = Math.max(...hist.luma.slice(1, 255))
      if (maxVal === 0) return

      // Luma histogram
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * w
        const barH = (hist.luma[i] / maxVal) * h
        ctx.fillRect(x, h - barH, w / 256 + 0.5, barH)
      }

      // RGB overlay
      const channels: [number[], string][] = [
        [hist.r, 'rgba(239, 68, 68, 0.2)'],
        [hist.g, 'rgba(34, 197, 94, 0.2)'],
        [hist.b, 'rgba(59, 130, 246, 0.2)'],
      ]
      for (const [ch, color] of channels) {
        ctx.fillStyle = color
        for (let i = 0; i < 256; i++) {
          const x = (i / 255) * w
          const barH = (ch[i] / maxVal) * h
          ctx.fillRect(x, h - barH, w / 256 + 0.5, barH)
        }
      }

      // Clipping indicators
      if (clipping.hasBlackClip) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'
        ctx.fillRect(0, 0, 3, h)
      }
      if (clipping.hasWhiteClip) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)'
        ctx.fillRect(w - 3, 0, 3, h)
      }
    }
    img.src = imageUrl
  }, [imageUrl])

  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>Histogram</div>
      <div className={styles.histogramWrap}>
        <canvas
          ref={canvasRef}
          className={styles.histogramCanvas}
          aria-label="Image histogram"
          role="img"
        />
        <div className={styles.histogramLabels}>
          <span>Shadows</span>
          <span>Highlights</span>
        </div>
      </div>
    </div>
  )
}

// ── Main Component ──

const tool = getToolBySlug('exif-viewer')!

function ControlsPanel({ onFile }: { onFile: (file: File) => void }) {
  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{tool.name}</h1>
        <p className={styles.description}>{tool.description}</p>
      </div>
      <FileDropZone onFile={onFile} />
    </>
  )
}

export function ExifViewer() {
  const [data, setData] = useState<ExifResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  const handleFile = useCallback((file: File) => {
    setError(null)
    setData(null)
    if (imageUrl) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const buffer = reader.result as ArrayBuffer
        const tags = ExifReader.load(buffer)
        setData(parseExif(tags, file.size))
      } catch {
        setError('Could not read EXIF data from this image. The file may not contain metadata.')
      }
    }
    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsArrayBuffer(file)
  }, [imageUrl])

  return (
    <div className={styles.app}>
      <div className={styles.appBody}>
        <div className={styles.sidebar}>
          <ControlsPanel onFile={handleFile} />
        </div>

        <div className={styles.main}>
          {error && <div className={styles.error}>{error}</div>}

          {data ? (
            <>
              <AnalysisCards analysis={data.analysis} />

              {imageUrl && <MiniHistogram imageUrl={imageUrl} />}

              <Section
                title="Camera"
                rows={[
                  ['Make', data.camera.make],
                  ['Model', data.camera.model],
                ]}
              />
              <Section
                title="Lens"
                rows={[
                  ['Lens Model', data.lens.model],
                  ['Lens Make', data.lens.make],
                ]}
              />
              <Section
                title="Exposure"
                rows={[
                  ['Aperture', data.settings.fNumber],
                  ['Shutter Speed', data.settings.exposureTime],
                  ['ISO', data.settings.iso],
                  ['Focal Length', data.settings.focalLength],
                  ['Focal Length (35mm)', data.settings.focalLength35],
                  ['Exposure Program', data.settings.exposureProgram],
                  ['Metering Mode', data.settings.meteringMode],
                  ['Flash', data.settings.flash],
                  ['White Balance', data.settings.whiteBalance],
                  ['Focus Distance', data.settings.focusDistance],
                ]}
              />
              <Section
                title="Image"
                rows={[
                  ['Dimensions', data.image.widthRaw && data.image.heightRaw ? `${data.image.width} × ${data.image.height}` : DASH],
                  ['Megapixels', data.image.megapixels],
                  ['Aspect Ratio', data.image.aspectRatio],
                  ['Color Space', data.image.colorSpace],
                  ['Orientation', data.image.orientation],
                  ['File Size', data.file.size],
                ]}
              />
              <Section title="Date" rows={[['Date Taken', data.date]]} />
              {data.gps && (
                <Section
                  title="GPS"
                  rows={[
                    ['Latitude', data.gps.latitude],
                    ['Longitude', data.gps.longitude],
                  ]}
                />
              )}
              <Section title="Software" rows={[['Software', data.software]]} />
            </>
          ) : !error ? (
            <div className={styles.emptyMain}>Upload an image to view its EXIF data</div>
          ) : null}
        </div>

        <LearnPanel slug="exif-viewer" />
      </div>

      <div className={styles.mobileControls}>
        <ControlsPanel onFile={handleFile} />
      </div>
    </div>
  )
}
