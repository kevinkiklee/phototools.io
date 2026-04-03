import type { Metadata } from 'next'
import { StarTrailCalculator } from './_components/StarTrailCalculator'

export const metadata: Metadata = {
  title: 'Star Trail Calculator',
  description: 'Calculate max exposure for sharp stars or plan star trail stacking shots.',
  openGraph: {
    images: ['/images/og/star-trail-calculator.jpg'],
  },
}

export default function StarTrailCalculatorPage() {
  return <StarTrailCalculator />
}
