import type { Metadata } from 'next'
import { ShutterSpeedGuide } from './_components/ShutterSpeedGuide'

export const metadata: Metadata = {
  title: 'Shutter Speed Visualizer',
  description: 'Find the minimum shutter speed for sharp handheld photos. Accounts for focal length, sensor size, and image stabilization.',
  openGraph: {
    images: ['/images/og/shutter-speed-visualizer.jpg'],
  },
}

export default function ShutterSpeedVisualizerPage() {
  return <ShutterSpeedGuide />
}
