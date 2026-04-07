import { useRef, useEffect, useCallback } from 'react'
import { dispatch } from '../index'
import { useDebouncedTracker } from './useDebouncedTracker'
import type { ToolInteractionEvent } from '../types'

const ENGAGED_THRESHOLD_MS = 30_000

export function useToolSession() {
  const startTimeRef = useRef(Date.now())
  const interactionCountRef = useRef(0)
  const engagedFiredRef = useRef(false)
  const paramsRef = useRef<Record<string, string>>({})
  const debouncedTrack = useDebouncedTracker()

  const trackParam = useCallback((event: ToolInteractionEvent) => {
    interactionCountRef.current++
    paramsRef.current[event.param_name] = event.param_value
    debouncedTrack(event)
  }, [debouncedTrack])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (engagedFiredRef.current) return
      engagedFiredRef.current = true
      dispatch('tool_engaged', { duration_seconds: 30 })
    }, ENGAGED_THRESHOLD_MS)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    function sendSummary() {
      const duration = Math.round((Date.now() - startTimeRef.current) / 1000)
      dispatch('tool_session_summary', {
        duration_seconds: duration,
        interaction_count: interactionCountRef.current,
        final_params: paramsRef.current,
        param_count: Object.keys(paramsRef.current).length,
        primary_param: Object.keys(paramsRef.current).pop() || '',
      })
    }

    function handleBeforeUnload() {
      sendSummary()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      sendSummary()
    }
  }, [])

  return { trackParam, paramsRef }
}
