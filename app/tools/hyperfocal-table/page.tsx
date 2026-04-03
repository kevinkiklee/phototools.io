import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { HyperfocalTable } from '@/components/tools/hyperfocal-table/HyperfocalTable'

export const metadata: Metadata = {
  title: 'Hyperfocal Distance Table',
  description: 'Quick-reference hyperfocal distances for any lens and aperture combination.',
}

export default function HyperfocalTablePage() {
  return (
    <ToolPageShell slug="hyperfocal-table">
      <HyperfocalTable />
    </ToolPageShell>
  )
}
