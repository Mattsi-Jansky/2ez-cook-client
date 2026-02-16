import type { CSSProperties } from 'react'
import css from './ProgressBar.module.css'

interface ProgressBarProps {
  current: number
  total: number
  color: string
  viewIndex?: number
}

function segmentState(i: number, current: number, viewIndex?: number): string {
  if (viewIndex !== undefined && i === viewIndex) return 'viewed'
  if (i < current) return 'done'
  if (i === current) return 'current'
  return 'future'
}

export function ProgressBar({
  current,
  total,
  color,
  viewIndex,
}: ProgressBarProps) {
  const isReviewing = viewIndex !== undefined
  return (
    <div
      className={css.container}
      style={{ '--bar-color': color } as CSSProperties}
    >
      {Array.from({ length: total }).map((_, i) => {
        const state = segmentState(i, current, viewIndex)
        return (
          <div key={i} className={css.segment} data-state={state}>
            {state === 'current' && !isReviewing && (
              <div className={css.pulse} />
            )}
          </div>
        )
      })}
    </div>
  )
}
