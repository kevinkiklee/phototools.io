import { useReducer, useRef, useCallback, useState } from 'react'
import './theme.css'
import './App.css'
import type { AppState, LensConfig, ViewMode } from './types'
import { DEFAULT_STATE } from './types'
import { parseQueryParams, useQuerySync } from './hooks/useQuerySync'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { copyCanvasToClipboard, copyLinkToClipboard } from './utils/export'
import { Sidebar } from './components/Sidebar'
import { LensPanel } from './components/LensPanel'
import { ModeToggle } from './components/ModeToggle'
import { ThemeToggle } from './components/ThemeToggle'
import { SceneStrip } from './components/SceneStrip'
import { FrameRuler } from './components/FrameRuler'
import { ActionBar } from './components/ActionBar'
import { Canvas } from './components/Canvas'
import { ShortcutOverlay } from './components/ShortcutOverlay'
import { Toast } from './components/Toast'

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
  const [toast, setToast] = useState<string | null>(null)
  const [collapsedA, setCollapsedA] = useState(false)
  const [collapsedB, setCollapsedB] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useQuerySync(state)
  useKeyboardShortcuts(state, dispatch)

  document.documentElement.setAttribute('data-theme', state.theme)
  localStorage.setItem('fov-theme', state.theme)

  const handleCopyImage = useCallback(async () => {
    if (!canvasRef.current) return
    const success = await copyCanvasToClipboard(canvasRef.current)
    setToast(success ? 'Copied image!' : 'Failed to copy')
  }, [])

  const handleCopyLink = useCallback(() => {
    const success = copyLinkToClipboard()
    setToast(success ? 'Link copied!' : 'Failed to copy')
  }, [])

  return (
    <div className="app">
      <Sidebar>
        <div className="sidebar__header">
          <div className="sidebar__logo">
            <div className="sidebar__logo-icon" />
            <span className="sidebar__logo-text">FOV Viewer</span>
          </div>
          <div className="sidebar__actions">
            <ThemeToggle
              theme={state.theme}
              onChange={(t) => dispatch({ type: 'SET_THEME', payload: t })}
            />
            <button className="icon-btn" onClick={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })} title="Keyboard shortcuts">
              ⌨️
            </button>
          </div>
        </div>

        <LensPanel
          label="Lens A"
          color="var(--lens-a)"
          config={state.lensA}
          isActive={state.activeLens === 'a'}
          collapsed={collapsedA}
          onChange={(u) => dispatch({ type: 'SET_LENS_A', payload: u })}
          onFocus={() => dispatch({ type: 'SET_ACTIVE_LENS', payload: 'a' })}
          onToggleCollapse={() => setCollapsedA((v) => !v)}
        />

        <LensPanel
          label="Lens B"
          color="var(--lens-b)"
          config={state.lensB}
          isActive={state.activeLens === 'b'}
          collapsed={collapsedB}
          onChange={(u) => dispatch({ type: 'SET_LENS_B', payload: u })}
          onFocus={() => dispatch({ type: 'SET_ACTIVE_LENS', payload: 'b' })}
          onToggleCollapse={() => setCollapsedB((v) => !v)}
        />

        <FrameRuler
          lensA={state.lensA}
          lensB={state.lensB}
          distance={state.distance}
          onDistanceChange={(d) => dispatch({ type: 'SET_DISTANCE', payload: d })}
        />

        <ActionBar
          onCopyImage={handleCopyImage}
          onCopyLink={handleCopyLink}
        />
      </Sidebar>

      <div className="canvas-area">
        <div className="canvas-topbar">
          <ModeToggle
            mode={state.mode}
            onChange={(m) => dispatch({ type: 'SET_MODE', payload: m })}
          />
        </div>

        <div className="canvas-main">
          <Canvas
            lensA={state.lensA}
            lensB={state.lensB}
            imageIndex={state.imageIndex}
            mode={state.mode}
            canvasRef={canvasRef}
          />
        </div>

        <div className="canvas-bottom">
          <SceneStrip
            selectedIndex={state.imageIndex}
            onChange={(i) => dispatch({ type: 'SET_IMAGE', payload: i })}
          />
        </div>
      </div>

      <ShortcutOverlay
        visible={state.showShortcuts}
        onClose={() => dispatch({ type: 'TOGGLE_SHORTCUTS' })}
      />

      <Toast message={toast} onDone={() => setToast(null)} />
    </div>
  )
}

export default App
