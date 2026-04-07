import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initMeta, trackMeta, trackMetaCustom, setMetaEnabled, isMetaReady, resetMeta } from './meta'

describe('meta provider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete (window as Record<string, unknown>).fbq
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '')
    resetMeta()
  })

  it('no-ops when pixel ID is missing', () => {
    initMeta()
    expect(isMetaReady()).toBe(false)
  })

  it('initializes when pixel ID is set and fbq exists', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    expect(mockFbq).toHaveBeenCalledWith('init', '123456')
    expect(isMetaReady()).toBe(true)
  })

  it('trackMeta calls fbq track', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    trackMeta('ViewContent', { content_name: 'fov-simulator' })
    expect(mockFbq).toHaveBeenCalledWith('track', 'ViewContent', { content_name: 'fov-simulator' })
  })

  it('trackMetaCustom calls fbq trackCustom', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    trackMetaCustom('ToolEngaged', { tool_slug: 'fov-simulator' })
    expect(mockFbq).toHaveBeenCalledWith('trackCustom', 'ToolEngaged', { tool_slug: 'fov-simulator' })
  })

  it('stops tracking after setMetaEnabled(false)', () => {
    vi.stubEnv('NEXT_PUBLIC_META_PIXEL_ID', '123456')
    const mockFbq = vi.fn()
    window.fbq = mockFbq
    initMeta()
    mockFbq.mockClear()
    setMetaEnabled(false)
    trackMeta('PageView', {})
    expect(mockFbq).not.toHaveBeenCalled()
  })
})
