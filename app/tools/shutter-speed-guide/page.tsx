import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { ShutterSpeedGuide } from '@/components/tools/shutter-speed-guide/ShutterSpeedGuide'

export const metadata: Metadata = {
  title: 'Shutter Speed Guide',
  description: 'Find the minimum safe shutter speed for sharp handheld shots with any lens.',
}

export default function ShutterSpeedGuidePage() {
  return (
    <ToolPageShell slug="shutter-speed-guide">
      <ShutterSpeedGuide />
    </ToolPageShell>
  )
}
