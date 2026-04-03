import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { ExposureSimulator } from '@/components/tools/exposure-simulator/ExposureSimulator'

export const metadata: Metadata = {
  title: 'Exposure Triangle Simulator',
  description: 'See how aperture, shutter speed, and ISO interact to control exposure.',
}

export default function ExposureSimulatorPage() {
  return (
    <ToolPageShell slug="exposure-simulator">
      <ExposureSimulator />
    </ToolPageShell>
  )
}
