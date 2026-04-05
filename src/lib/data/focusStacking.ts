export const OVERLAP_PRESETS = [
  { value: 0.1, label: '10% (minimal)' },
  { value: 0.2, label: '20% (recommended)' },
  { value: 0.3, label: '30% (safe)' },
  { value: 0.5, label: '50% (maximum overlap)' },
]

export function formatStackingExport(
  focalLength: number,
  aperture: number,
  sensorName: string,
  shots: Array<{ number: number; focusDistance: number }>
): string {
  const header = `Focus Stacking Sequence (${focalLength}mm f/${aperture} ${sensorName})`
  const lines = shots.map((s) => {
    const dist = s.focusDistance < 1
      ? `${(s.focusDistance * 100).toFixed(0)} cm`
      : `${s.focusDistance.toFixed(2)} m`
    return `${s.number}. ${dist}`
  })
  return [header, ...lines].join('\n')
}
