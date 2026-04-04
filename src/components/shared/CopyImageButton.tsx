'use client'

import { useCallback, type RefObject } from 'react'
import { toast } from 'sonner'
import { copyCanvasToClipboard } from '@/lib/utils/export'

interface CopyImageButtonProps {
  canvasRef: RefObject<HTMLCanvasElement | null>
  filename?: string
  className?: string
  label?: string
}

export function CopyImageButton({ canvasRef, filename = 'image.png', className, label = 'Copy image' }: CopyImageButtonProps) {
  const handleCopy = useCallback(async () => {
    if (!canvasRef.current) return
    const ok = await copyCanvasToClipboard(canvasRef.current, filename)
    toast(ok ? 'Copied image!' : 'Failed to copy')
  }, [canvasRef, filename])

  return (
    <button className={className} onClick={handleCopy}>
      {label}
    </button>
  )
}
