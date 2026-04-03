import type { Metadata } from 'next'
import { FovViewer } from '@/components/tools/fov-viewer/FovViewer'

export const metadata: Metadata = {
  title: 'FOV Viewer — Compare Focal Lengths',
  description: 'Compare field of view across different focal lengths and sensor sizes. Free, interactive, shareable.',
}

export default function FovViewerPage() {
  return <FovViewer />
}
