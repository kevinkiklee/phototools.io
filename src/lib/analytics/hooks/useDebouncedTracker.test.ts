import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebouncedTracker } from './useDebouncedTracker'

vi.mock('../index', () => ({
  trackToolInteraction: vi.fn(),
}))

import { trackToolInteraction } from '../index'

describe('useDebouncedTracker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces slider changes at 500ms', () => {
    const { result } = renderHook(() => useDebouncedTracker())
    act(() => {
      result.current({ param_name: 'focal_length', param_value: '24', input_type: 'slider' })
      result.current({ param_name: 'focal_length', param_value: '35', input_type: 'slider' })
      result.current({ param_name: 'focal_length', param_value: '50', input_type: 'slider' })
    })
    expect(trackToolInteraction).not.toHaveBeenCalled()
    act(() => { vi.advanceTimersByTime(500) })
    expect(trackToolInteraction).toHaveBeenCalledTimes(1)
    expect(trackToolInteraction).toHaveBeenCalledWith(expect.objectContaining({ param_value: '50' }))
  })

  it('fires immediately for non-slider input types', () => {
    const { result } = renderHook(() => useDebouncedTracker())
    act(() => {
      result.current({ param_name: 'sensor', param_value: 'full-frame', input_type: 'select' })
    })
    expect(trackToolInteraction).toHaveBeenCalledTimes(1)
  })

  it('flushes pending events on unmount', () => {
    const { result, unmount } = renderHook(() => useDebouncedTracker())
    act(() => {
      result.current({ param_name: 'focal_length', param_value: '85', input_type: 'slider' })
    })
    expect(trackToolInteraction).not.toHaveBeenCalled()
    unmount()
    expect(trackToolInteraction).toHaveBeenCalledWith(expect.objectContaining({ param_value: '85' }))
  })
})
