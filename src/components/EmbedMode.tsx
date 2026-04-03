import { useReducer, useRef } from 'react'
import type { AppState, LensConfig, Orientation } from '../types'
import { DEFAULT_STATE } from '../types'
import { parseQueryParams } from '../hooks/useQuerySync'
import { Canvas } from './Canvas'

type Action =
  | { type: 'SET_LENS'; payload: { index: number; updates: Partial<LensConfig> } }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_ORIENTATION'; payload: Orientation }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LENS': {
      const { index, updates } = action.payload
      const lenses = state.lenses.map((l, i) => i === index ? { ...l, ...updates } : l)
      return { ...state, lenses }
    }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_ORIENTATION':
      return { ...state, orientation: action.payload }
    default:
      return state
  }
}

export function EmbedMode() {
  const [state] = useReducer(reducer, undefined, () => ({
    ...DEFAULT_STATE,
    ...parseQueryParams(),
  }))
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  return (
    <div className="embed-mode">
      <div className="embed-mode__canvas">
        <Canvas
          lenses={state.lenses}
          imageIndex={state.imageIndex}
          orientation={state.orientation}
          canvasRef={canvasRef}
        />
      </div>
      <a
        className="embed-mode__attribution"
        href="https://fov-viewer.iser.io/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Powered by FOV Viewer
      </a>
    </div>
  )
}
