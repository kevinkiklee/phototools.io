'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AnimatedGridProps {
  children: ReactNode
  className?: string
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  )
}

export function AnimatedItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className} style={{ height: '100%' }}>
      {children}
    </motion.div>
  )
}
