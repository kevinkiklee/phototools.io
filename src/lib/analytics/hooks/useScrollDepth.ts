import { useRef, useCallback, useEffect } from 'react'
import { dispatch } from '../index'

const THRESHOLDS = [25, 50, 75, 100] as const

type ScrollDepthOptions = {
  event: 'page_scroll_depth' | 'learn_panel_scroll_depth'
}

export function useScrollDepth({ event }: ScrollDepthOptions) {
  const firedRef = useRef<Set<number>>(new Set())
  const elementRef = useRef<HTMLElement | null>(null)
  const rafRef = useRef<number | null>(null)

  const checkScroll = useCallback(() => {
    const el = elementRef.current
    if (!el) return

    const scrollable = el.scrollHeight - el.clientHeight
    if (scrollable <= 0) return

    const percent = (el.scrollTop / scrollable) * 100

    for (const threshold of THRESHOLDS) {
      if (percent >= threshold && !firedRef.current.has(threshold)) {
        firedRef.current.add(threshold)
        dispatch(event, { depth_percent: threshold })
      }
    }
  }, [event])

  const handleScroll = useCallback(() => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      checkScroll()
      rafRef.current = null
    })
  }, [checkScroll])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const setRef = useCallback((node: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('scroll', handleScroll)
    }

    elementRef.current = node
    firedRef.current.clear()

    if (node) {
      node.addEventListener('scroll', handleScroll, { passive: true })
    }
  }, [handleScroll])

  return setRef
}
