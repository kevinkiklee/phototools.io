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

export type Orientation = 'landscape' | 'portrait'

export const LENS_COLORS = ['#3b82f6', '#f59e0b', '#10b981']
export const LENS_LABELS = ['A', 'B', 'C']
export const MAX_LENSES = 3

export interface AppState {
  lenses: LensConfig[]
  imageIndex: number
  orientation: Orientation
  theme: 'dark' | 'light'
  activeLens: number
}

export const DEFAULT_STATE: AppState = {
  lenses: [
    { focalLength: 20, sensorId: 'ff' },
    { focalLength: 35, sensorId: 'ff' },
  ],
  imageIndex: 0,
  orientation: window.innerWidth < 1024 ? 'portrait' : 'landscape',
  theme: 'dark',
  activeLens: 0,
}
