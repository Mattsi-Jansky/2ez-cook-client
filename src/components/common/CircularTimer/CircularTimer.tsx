import { formatTime } from '../../../utils'
import css from './CircularTimer.module.css'

interface CircularTimerProps {
  duration: number
  timeLeft: number
  running: boolean
  size?: number
  color?: string
  label?: string
  overtime?: number
}

export function CircularTimer({
  duration,
  timeLeft,
  running,
  size = 180,
  color = 'var(--color-primary)',
  label,
  overtime = 0,
}: CircularTimerProps) {
  const r = (size - 16) / 2
  const c = 2 * Math.PI * r
  const isOvertime = overtime > 0
  const off = isOvertime
    ? 0
    : c * (1 - (duration > 0 ? (duration - timeLeft) / duration : 0))

  return (
    <div className={css.container} data-overtime={isOvertime || undefined}>
      <svg width={size} height={size} className={css.svg}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-track-bg)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={isOvertime ? 'var(--color-overtime)' : color}
          strokeWidth={10}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          className={css.progressCircle}
          data-running={running || undefined}
          data-overtime={isOvertime || undefined}
        />
      </svg>
      <div
        className={css.overlay}
        style={{ marginTop: -size + 10, height: size - 20 }}
      >
        {isOvertime ? (
          <div
            className={css.overtimeTime}
            style={{ fontSize: size > 120 ? 42 : 28 }}
          >
            +{formatTime(overtime)}
          </div>
        ) : (
          <div className={css.time} style={{ fontSize: size > 120 ? 42 : 28 }}>
            {formatTime(timeLeft)}
          </div>
        )}
        {label && (
          <div className={isOvertime ? css.overtimeLabel : css.label}>
            {isOvertime ? 'overtime' : label}
          </div>
        )}
      </div>
    </div>
  )
}
