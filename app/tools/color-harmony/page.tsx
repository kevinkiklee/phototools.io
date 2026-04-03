import type { Metadata } from 'next'
import { ColorHarmony } from '@/components/tools/color-harmony/ColorHarmony'

export const metadata: Metadata = {
  title: 'Color Harmony Picker',
  description: 'Build color palettes for photography shoots using color theory.',
}

export default function ColorHarmonyPage() {
  return <ColorHarmony />
}
