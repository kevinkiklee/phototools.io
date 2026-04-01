export interface SensorPreset {
  id: string
  name: string
  cropFactor: number
}

export interface FocalLengthPreset {
  value: number
  label: string | null
}

export interface LensConfig {
  focalLength: number
  sensorId: string
}

export type ViewMode = 'overlay' | 'side'

export interface AppState {
  lensA: LensConfig
  lensB: LensConfig
  imageIndex: number
  mode: ViewMode
  distance: number
  theme: 'dark' | 'light'
  activeLens: 'a' | 'b'
  showShortcuts: boolean
}

export const DEFAULT_STATE: AppState = {
  lensA: { focalLength: 35, sensorId: 'ff' },
  lensB: { focalLength: 85, sensorId: 'ff' },
  imageIndex: 0,
  mode: 'overlay',
  distance: 10,
  theme: 'dark',
  activeLens: 'a',
  showShortcuts: false,
}
