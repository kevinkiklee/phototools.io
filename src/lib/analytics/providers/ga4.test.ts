import { describe, it, expect, vi, beforeEach } from 'vitest'
import { trackGA4, updateGA4Consent } from './ga4'

describe('ga4 provider', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    delete (window as unknown as Record<string, unknown>).gtag
  })

  it('no-ops when gtag is not defined', () => {
    trackGA4('tool_interaction', { param_name: 'aperture' })
  })

  it('calls gtag event with correct params', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    trackGA4('tool_interaction', { param_name: 'aperture', param_value: 'f/2.8' })
    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_interaction', {
      param_name: 'aperture',
      param_value: 'f/2.8',
    })
  })

  it('truncates property values longer than 100 chars', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    const longValue = 'a'.repeat(150)
    trackGA4('tool_interaction', { param_name: longValue })
    expect(mockGtag).toHaveBeenCalledWith('event', 'tool_interaction', {
      param_name: longValue.slice(0, 100),
    })
  })

  it('updateGA4Consent updates analytics fields', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    updateGA4Consent('analytics', true)
    expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
      analytics_storage: 'granted',
    })
  })

  it('updateGA4Consent updates marketing fields', () => {
    const mockGtag = vi.fn()
    window.gtag = mockGtag
    updateGA4Consent('marketing', true)
    expect(mockGtag).toHaveBeenCalledWith('consent', 'update', {
      ad_storage: 'granted',
      ad_user_data: 'granted',
      ad_personalization: 'granted',
    })
  })
})
