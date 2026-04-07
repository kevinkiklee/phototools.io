import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useScrollDepth } from './useScrollDepth'

vi.mock('../index', () => ({
  dispatch: vi.fn(),
}))

import { dispatch } from '../index'

describe('useScrollDepth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a ref callback', () => {
    const { result } = renderHook(() => useScrollDepth({ event: 'learn_panel_scroll_depth' }))
    expect(typeof result.current).toBe('function')
  })

  it('fires threshold events on scroll', () => {
    const div = document.createElement('div')
    Object.defineProperties(div, {
      scrollHeight: { get: () => 1000, configurable: true },
      clientHeight: { get: () => 200, configurable: true },
      scrollTop: { get: () => 200, configurable: true },
    })

    const { result } = renderHook(() => useScrollDepth({ event: 'learn_panel_scroll_depth' }))
    result.current(div)

    // Mock requestAnimationFrame to fire synchronously
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 0 })

    div.dispatchEvent(new Event('scroll'))

    expect(dispatch).toHaveBeenCalledWith('learn_panel_scroll_depth', expect.objectContaining({
      depth_percent: 25,
    }))
  })
})
