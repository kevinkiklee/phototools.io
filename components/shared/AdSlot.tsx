import type { CSSProperties } from 'react'

interface AdSlotProps {
  width: number
  height: number
  className?: string
}

export function AdSlot({ width, height, className }: AdSlotProps) {
  const style: CSSProperties = {
    minWidth: width,
    minHeight: height,
    maxWidth: '100%',
    margin: '0 auto',
  }
  return <div className={className} style={style} data-ad-slot aria-hidden="true" />
}
