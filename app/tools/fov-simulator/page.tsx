import type { Metadata } from 'next'
import { FovSimulator } from '@/components/tools/fov-simulator/FovSimulator'

export const metadata: Metadata = {
  title: 'FOV Simulator — Compare Focal Lengths',
  description: 'Compare field of view across different focal lengths and sensor sizes. Free, interactive, shareable.',
}

export default function FovSimulatorPage() {
  return <FovSimulator />
}
