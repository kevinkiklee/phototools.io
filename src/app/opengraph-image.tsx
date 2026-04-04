import { generateHomepageOgImage } from '@/lib/og'

export const alt = 'PhotoTools — Free Photography Tools'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return generateHomepageOgImage()
}
