import type { Metadata } from 'next'
import { PerspectiveCompressionSimulator } from './_components/PerspectiveCompressionSimulator'

export const metadata: Metadata = {
  title: 'Perspective Compression Simulator',
  description: 'See how focal length affects background compression. Interactive 3D visualization.',
  openGraph: {
    images: ['/images/og/perspective-compression-simulator.jpg'],
  },
}

export default function PerspectiveCompressionSimulatorPage() {
  return <PerspectiveCompressionSimulator />
}
