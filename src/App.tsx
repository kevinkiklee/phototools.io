import { useReducer } from 'react'
import './theme.css'
import './App.css'
import type { AppState, LensConfig, ViewMode } from './types'
import { DEFAULT_STATE } from './types'
import { parseQueryParams, useQuerySync } from './hooks/useQuerySync'

type Action =
  | { type: 'SET_LENS_A'; payload: Partial<LensConfig> }
  | { type: 'SET_LENS_B'; payload: Partial<LensConfig> }
  | { type: 'SET_IMAGE'; payload: number }
  | { type: 'SET_MODE'; payload: ViewMode }
  | { type: 'SET_DISTANCE'; payload: number }
  | { type: 'SET_THEME'; payload: 'dark' | 'light' }
  | { type: 'SET_ACTIVE_LENS'; payload: 'a' | 'b' }
  | { type: 'TOGGLE_SHORTCUTS' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_LENS_A':
      return { ...state, lensA: { ...state.lensA, ...action.payload } }
    case 'SET_LENS_B':
      return { ...state, lensB: { ...state.lensB, ...action.payload } }
    case 'SET_IMAGE':
      return { ...state, imageIndex: action.payload }
    case 'SET_MODE':
      return { ...state, mode: action.payload }
    case 'SET_DISTANCE':
      return { ...state, distance: action.payload }
    case 'SET_THEME':
      return { ...state, theme: action.payload }
    case 'SET_ACTIVE_LENS':
      return { ...state, activeLens: action.payload }
    case 'TOGGLE_SHORTCUTS':
      return { ...state, showShortcuts: !state.showShortcuts }
    default:
      return state
  }
}

function getInitialState(): AppState {
  const savedTheme = localStorage.getItem('fov-theme') as 'dark' | 'light' | null
  const queryOverrides = parseQueryParams()
  return {
    ...DEFAULT_STATE,
    ...(savedTheme ? { theme: savedTheme } : {}),
    ...queryOverrides,
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, undefined, getInitialState)

  useQuerySync(state)

  // Apply theme to document
  document.documentElement.setAttribute('data-theme', state.theme)
  localStorage.setItem('fov-theme', state.theme)

  return (
    <div className="app">
      <div className="sidebar">
        <p>Sidebar — Lens controls go here</p>
        <p>Theme: {state.theme}</p>
        <p>Lens A: {state.lensA.focalLength}mm</p>
        <p>Lens B: {state.lensB.focalLength}mm</p>
      </div>
      <div className="canvas-area">
        <div className="canvas-topbar">Mode: {state.mode}</div>
        <div className="canvas-main">Canvas goes here</div>
        <div className="canvas-bottom">Scene strip goes here</div>
      </div>
    </div>
  )
}

export default App
