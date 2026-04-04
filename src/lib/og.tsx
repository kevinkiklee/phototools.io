import { ImageResponse } from 'next/og'
import { getToolBySlug } from '@/lib/data/tools'

const TOOL_EMOJIS: Record<string, string> = {
  'fov-simulator': '🔭',
  'color-scheme-generator': '🎨',
  'exposure-simulator': '📸',
  'dof-calculator': '🌿',
  'hyperfocal-simulator': '🎯',
  'shutter-speed-visualizer': '⏱️',
  'nd-filter-calculator': '🕶️',
  'diffraction-limit': '🔬',
  'star-trail-calculator': '⭐',
  'white-balance-visualizer': '🌡️',
  'sensor-size-comparison': '📏',
  'exif-viewer': '🗂️',
  'perspective-compression-simulator': '🏔️',
}

const CATEGORY_LABELS: Record<string, string> = {
  visualizer: 'Visualizer',
  calculator: 'Calculator',
  'file-tool': 'File Tool',
}

export async function generateOgImage(slug: string) {
  const tool = getToolBySlug(slug)
  if (!tool) return new Response('Not Found', { status: 404 })

  const emoji = TOOL_EMOJIS[slug] ?? '📷'
  const categoryLabel = CATEGORY_LABELS[tool.category] ?? tool.category

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(145deg, #0d0d0d 0%, #141414 60%, #1a1610 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Geometric diamonds — outer */}
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -40,
            width: 400,
            height: 400,
            border: '1.5px solid rgba(245, 158, 11, 0.06)',
            transform: 'rotate(45deg)',
            borderRadius: 40,
          }}
        />
        {/* Geometric diamonds — middle */}
        <div
          style={{
            position: 'absolute',
            right: 30,
            top: 10,
            width: 300,
            height: 300,
            border: '1.5px solid rgba(245, 158, 11, 0.10)',
            transform: 'rotate(45deg)',
            borderRadius: 30,
          }}
        />
        {/* Geometric diamonds — inner with emoji */}
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 60,
            width: 200,
            height: 200,
            background: 'rgba(245, 158, 11, 0.03)',
            border: '1.5px solid rgba(245, 158, 11, 0.14)',
            transform: 'rotate(45deg)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 56, transform: 'rotate(-45deg)' }}>{emoji}</span>
        </div>

        {/* Left content */}
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: '50%',
            transform: 'translateY(-50%)',
            maxWidth: '48%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span
              style={{
                color: '#f59e0b',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase' as const,
              }}
            >
              PHOTOTOOLS.IO
            </span>
          </div>

          {/* Tool name */}
          <div
            style={{
              fontSize: 44,
              fontWeight: 800,
              color: '#e5e5e5',
              lineHeight: 1.1,
              marginBottom: 14,
            }}
          >
            {tool.name}
          </div>

          {/* Description */}
          <div style={{ fontSize: 16, color: '#888888', lineHeight: 1.5 }}>
            {tool.description}
          </div>

          {/* Category pill */}
          <div style={{ display: 'flex', marginTop: 20 }}>
            <span
              style={{
                color: '#f59e0b',
                fontSize: 11,
                textTransform: 'uppercase' as const,
                letterSpacing: 2,
                border: '1px solid rgba(245, 158, 11, 0.25)',
                padding: '4px 14px',
                borderRadius: 100,
              }}
            >
              {categoryLabel}
            </span>
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40%',
            height: 3,
            background: 'linear-gradient(90deg, #f59e0b, transparent)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}

export async function generateHomepageOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: 'linear-gradient(145deg, #0d0d0d 0%, #141414 60%, #1a1610 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Geometric diamonds */}
        <div
          style={{
            position: 'absolute',
            right: -20,
            top: -40,
            width: 400,
            height: 400,
            border: '1.5px solid rgba(245, 158, 11, 0.06)',
            transform: 'rotate(45deg)',
            borderRadius: 40,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 30,
            top: 10,
            width: 300,
            height: 300,
            border: '1.5px solid rgba(245, 158, 11, 0.10)',
            transform: 'rotate(45deg)',
            borderRadius: 30,
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: 80,
            top: 60,
            width: 200,
            height: 200,
            background: 'rgba(245, 158, 11, 0.03)',
            border: '1.5px solid rgba(245, 158, 11, 0.14)',
            transform: 'rotate(45deg)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span style={{ fontSize: 56, transform: 'rotate(-45deg)' }}>📷</span>
        </div>

        {/* Left content */}
        <div
          style={{
            position: 'absolute',
            left: 56,
            top: '50%',
            transform: 'translateY(-50%)',
            maxWidth: '50%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <span
              style={{
                color: '#f59e0b',
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase' as const,
              }}
            >
              PHOTOTOOLS.IO
            </span>
          </div>

          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              color: '#e5e5e5',
              lineHeight: 1.1,
              marginBottom: 16,
            }}
          >
            Free Photography Tools
          </div>

          <div style={{ fontSize: 18, color: '#888888', lineHeight: 1.5 }}>
            Interactive calculators, simulators, and visualizers for photographers. No sign-up required.
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '40%',
            height: 3,
            background: 'linear-gradient(90deg, #f59e0b, transparent)',
          }}
        />
      </div>
    ),
    { width: 1200, height: 630 },
  )
}
