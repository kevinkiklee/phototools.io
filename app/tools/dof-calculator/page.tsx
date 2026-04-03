import type { Metadata } from 'next'
import { ToolPageShell } from '@/components/shared/ToolPageShell'
import { DoFCalculator } from '@/components/tools/dof-calculator/DoFCalculator'

export const metadata: Metadata = {
  title: 'Depth of Field Calculator',
  description: 'Calculate near focus, far focus, and total depth of field for any lens and sensor.',
}

export default function DoFCalculatorPage() {
  return (
    <ToolPageShell slug="dof-calculator">
      <DoFCalculator />
    </ToolPageShell>
  )
}
