import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { SensorSize } from '@/components/tools/sensor-size/SensorSize'

export const metadata: Metadata = {
  title: 'Sensor Size Comparison',
  description: 'Compare camera sensor sizes visually with an interactive overlay.',
}

export default function SensorSizePage() {
  return (
    <ToolPageShell slug="sensor-size">
      <SensorSize />
    </ToolPageShell>
  )
}
