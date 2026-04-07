import { describe, it, expect } from 'vitest'
import type {
  AnalyticsEvent,
  ToolInteractionEvent,
  GlobalProperties,
  InputType,
  ConsentCategory,
} from './types'

describe('analytics types', () => {
  it('ToolInteractionEvent is well-typed', () => {
    const event: ToolInteractionEvent = {
      param_name: 'aperture',
      param_value: 'f/2.8',
      input_type: 'select',
    }
    expect(event.input_type).toBe('select')
  })

  it('InputType covers all input types', () => {
    const types: InputType[] = ['slider', 'select', 'toggle', 'button', 'scene-picker', 'text-input']
    expect(types).toHaveLength(6)
  })

  it('ConsentCategory covers analytics and marketing', () => {
    const cats: ConsentCategory[] = ['analytics', 'marketing']
    expect(cats).toHaveLength(2)
  })

  it('GlobalProperties has required fields', () => {
    const props: GlobalProperties = {
      locale: 'en',
      page_path: '/en/fov-simulator',
      viewport_type: 'desktop',
      tool_slug: 'fov-simulator',
      tool_category: 'visualizer',
    }
    expect(props.locale).toBe('en')
  })

  it('AnalyticsEvent discriminated union compiles', () => {
    const event: AnalyticsEvent = {
      name: 'tool_interaction',
      properties: { param_name: 'focal_length', param_value: '85', input_type: 'slider' },
    }
    expect(event.name).toBe('tool_interaction')
  })
})
