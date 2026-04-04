'use client'

import * as Tooltip from '@radix-ui/react-tooltip'
import type { Tooltip as TooltipData } from '@/lib/data/education/types'
import styles from './InfoTooltip.module.css'

interface InfoTooltipProps {
  tooltip: TooltipData
}

export function InfoTooltip({ tooltip }: InfoTooltipProps) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            className={styles.trigger}
            aria-label={`Info: ${tooltip.term}`}
            type="button"
          >
            &#9432;
          </button>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className={styles.popover} sideOffset={6} side="top">
            <div className={styles.term}>{tooltip.term}</div>
            <div className={styles.definition}>{tooltip.definition}</div>
            <Tooltip.Arrow className={styles.arrow} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}
