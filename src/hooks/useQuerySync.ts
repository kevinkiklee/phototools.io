import { useEffect, useRef } from 'react'
import type { AppState } from '../types'
import { DEFAULT_STATE } from '../types'
import { SENSORS } from '../data/sensors'

const SENSOR_IDS = new Set(SENSORS.map((s) => s.id))

function clampFocal(v: number): number {
  return Math.max(8, Math.min(800, Math.round(v)))
}

export function parseQueryParams(): Partial<AppState> {
  const params = new URLSearchParams(window.location.search)
  const state: Partial<AppState> = {}

  const a = Number(params.get('a'))
  if (a && a >= 8 && a <= 800) state.lensA = { ...DEFAULT_STATE.lensA, focalLength: clampFocal(a) }

  const sa = params.get('sa')
  if (sa && SENSOR_IDS.has(sa)) state.lensA = { ...(state.lensA ?? DEFAULT_STATE.lensA), sensorId: sa }

  const b = Number(params.get('b'))
  if (b && b >= 8 && b <= 800) state.lensB = { ...DEFAULT_STATE.lensB, focalLength: clampFocal(b) }

  const sb = params.get('sb')
  if (sb && SENSOR_IDS.has(sb)) state.lensB = { ...(state.lensB ?? DEFAULT_STATE.lensB), sensorId: sb }

  const img = Number(params.get('img'))
  if (!isNaN(img) && img >= 0 && img <= 4) state.imageIndex = img

  const mode = params.get('mode')
  if (mode === 'overlay' || mode === 'side') state.mode = mode

  const d = Number(params.get('d'))
  if (d && d > 0 && d <= 10000) state.distance = d

  const theme = params.get('theme')
  if (theme === 'dark' || theme === 'light') state.theme = theme

  return state
}

export function stateToQueryString(state: AppState): string {
  const params = new URLSearchParams()
  params.set('a', String(state.lensA.focalLength))
  params.set('sa', state.lensA.sensorId)
  params.set('b', String(state.lensB.focalLength))
  params.set('sb', state.lensB.sensorId)
  params.set('img', String(state.imageIndex))
  params.set('mode', state.mode)
  params.set('d', String(state.distance))
  params.set('theme', state.theme)
  return params.toString()
}

export function useQuerySync(state: AppState): void {
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    const qs = stateToQueryString(state)
    const newUrl = `${window.location.pathname}?${qs}`
    window.history.replaceState(null, '', newUrl)
  }, [state])
}
