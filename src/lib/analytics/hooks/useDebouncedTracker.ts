import { useRef, useEffect, useCallback } from 'react'
import { trackToolInteraction } from '../index'
import type { ToolInteractionEvent } from '../types'

const DEBOUNCE_MS = 500
const DEBOUNCED_TYPES = new Set(['slider'])

export function useDebouncedTracker() {
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const pendingRef = useRef<Map<string, ToolInteractionEvent>>(new Map())

  const flush = useCallback(() => {
    for (const [, timer] of timersRef.current) clearTimeout(timer)
    timersRef.current.clear()
    for (const [, event] of pendingRef.current) trackToolInteraction(event)
    pendingRef.current.clear()
  }, [])

  useEffect(() => flush, [flush])

  return useCallback((event: ToolInteractionEvent) => {
    if (!DEBOUNCED_TYPES.has(event.input_type)) {
      trackToolInteraction(event)
      return
    }

    const key = event.param_name
    const existing = timersRef.current.get(key)
    if (existing) clearTimeout(existing)

    pendingRef.current.set(key, event)
    timersRef.current.set(key, setTimeout(() => {
      const pending = pendingRef.current.get(key)
      if (pending) trackToolInteraction(pending)
      pendingRef.current.delete(key)
      timersRef.current.delete(key)
    }, DEBOUNCE_MS))
  }, [])
}
