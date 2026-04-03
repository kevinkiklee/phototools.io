import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { DiffractionLimit } from '@/components/tools/diffraction-limit/DiffractionLimit'

export const metadata: Metadata = {
  title: 'Diffraction Limit Calculator',
  description: 'Find the sharpest aperture for your sensor before diffraction softening.',
}

export default function DiffractionLimitPage() {
  return (
    <ToolPageShell slug="diffraction-limit">
      <DiffractionLimit />
    </ToolPageShell>
  )
}
