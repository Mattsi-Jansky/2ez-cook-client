import { useState, useEffect, useRef, useCallback } from 'react'
import { playChime, playTick } from '../utils'

const TICK_INTERVAL_MS = 100

export interface StepTimerEntry {
  timeLeft: number
  running: boolean
  done: boolean
  duration: number
  resumedAt: number
  frozenTimeLeft: number
  lastWholeSecond: number
}

export interface StepTimerState {
  timeLeft: number
  running: boolean
  done: boolean
  overtime: number
  notStarted: boolean
  paused: boolean
  start: () => void
  pause: () => void
  resume: () => void
  forceComplete: () => void
}

export type StepTimerMap = Record<string, StepTimerEntry>

export interface ActiveTimerInfo {
  trackId: string
  timerKey: string
  timeLeft: number
  duration: number
  done: boolean
}

export interface StepTimerRegistry {
  getTimer: (key: string, duration: number) => StepTimerState
  startTimer: (key: string, duration: number) => void
  forceComplete: (key: string) => void
  getEntry: (key: string) => StepTimerEntry | null
  isRunning: (key: string) => boolean
  getTimersForOtherTracks: (
    activeTrack: string | null,
    trackSteps: Record<string, number>,
  ) => ActiveTimerInfo[]
}

/**
 * Manages a registry of step timers that persist across component
 * mount/unmount cycles. Timers keep ticking even when their StepCard
 * is not rendered (e.g. after a track switch).
 *
 * Uses a high-frequency interval with timestamp-based elapsed time
 * for smooth sub-second progress updates.
 */
export function useStepTimerRegistry() {
  const [timers, setTimers] = useState<StepTimerMap>({})
  const tickInterval = useRef<ReturnType<typeof setInterval> | null>(null)

  const start = useCallback((key: string) => {
    setTimers((prev) => {
      const cur = prev[key]
      if (!cur || cur.running || cur.done) return prev
      return {
        ...prev,
        [key]: {
          ...cur,
          running: true,
          resumedAt: Date.now(),
          frozenTimeLeft: cur.timeLeft,
          lastWholeSecond: Math.ceil(cur.timeLeft),
        },
      }
    })
  }, [])

  const pause = useCallback((key: string) => {
    setTimers((prev) => {
      const cur = prev[key]
      if (!cur || !cur.running) return prev
      const elapsed = (Date.now() - cur.resumedAt) / 1000
      const newTimeLeft = cur.frozenTimeLeft - elapsed
      return {
        ...prev,
        [key]: {
          ...cur,
          running: false,
          timeLeft: newTimeLeft,
          frozenTimeLeft: newTimeLeft,
        },
      }
    })
  }, [])

  const resume = useCallback(
    (key: string) => {
      start(key)
    },
    [start],
  )

  const forceComplete = useCallback((key: string) => {
    setTimers((prev) => {
      const cur = prev[key]
      if (!cur) return prev
      return {
        ...prev,
        [key]: {
          ...cur,
          timeLeft: 0,
          running: false,
          done: true,
          frozenTimeLeft: 0,
        },
      }
    })
  }, [])

  const ensureTimer = useCallback((key: string, duration: number) => {
    setTimers((prev) => {
      if (prev[key]) return prev
      return {
        ...prev,
        [key]: {
          timeLeft: duration,
          running: false,
          done: false,
          duration,
          resumedAt: 0,
          frozenTimeLeft: duration,
          lastWholeSecond: duration,
        },
      }
    })
  }, [])

  const startTimer = useCallback((key: string, duration: number) => {
    const now = Date.now()
    setTimers((prev) => {
      const existing = prev[key]
      if (existing) {
        if (existing.running || existing.done) return prev
        return {
          ...prev,
          [key]: {
            ...existing,
            running: true,
            resumedAt: now,
            frozenTimeLeft: existing.timeLeft,
            lastWholeSecond: Math.ceil(existing.timeLeft),
          },
        }
      }
      return {
        ...prev,
        [key]: {
          timeLeft: duration,
          running: true,
          done: false,
          duration,
          resumedAt: now,
          frozenTimeLeft: duration,
          lastWholeSecond: duration,
        },
      }
    })
  }, [])

  useEffect(() => {
    const hasRunning = Object.values(timers).some((e) => e.running)

    if (hasRunning && !tickInterval.current) {
      tickInterval.current = setInterval(() => {
        const now = Date.now()
        setTimers((prev) => {
          let changed = false
          const next = { ...prev }

          for (const [key, cur] of Object.entries(next)) {
            if (!cur.running) continue

            const elapsed = (now - cur.resumedAt) / 1000
            const newTimeLeft = cur.frozenTimeLeft - elapsed

            if (!cur.done && newTimeLeft <= 0) {
              playChime()
              next[key] = {
                ...cur,
                timeLeft: 0,
                done: true,
                frozenTimeLeft: 0,
                resumedAt: now,
                lastWholeSecond: 0,
              }
              changed = true
              continue
            }

            const currentWholeSecond = Math.ceil(newTimeLeft)
            let lastWholeSecond = cur.lastWholeSecond
            if (!cur.done && currentWholeSecond < lastWholeSecond) {
              if (currentWholeSecond <= 10 && currentWholeSecond > 0) {
                playTick()
              }
              lastWholeSecond = currentWholeSecond
            }

            if (
              newTimeLeft !== cur.timeLeft ||
              lastWholeSecond !== cur.lastWholeSecond
            ) {
              next[key] = {
                ...cur,
                timeLeft: newTimeLeft,
                lastWholeSecond,
              }
              changed = true
            }
          }

          return changed ? next : prev
        })
      }, TICK_INTERVAL_MS)
    } else if (!hasRunning && tickInterval.current) {
      clearInterval(tickInterval.current)
      tickInterval.current = null
    }

    return () => {
      if (tickInterval.current) {
        clearInterval(tickInterval.current)
        tickInterval.current = null
      }
    }
  }, [timers])

  const getEntry = useCallback(
    (key: string): StepTimerEntry | null => timers[key] ?? null,
    [timers],
  )

  const isRunning = useCallback(
    (key: string): boolean => {
      const entry = timers[key]
      return !!entry && entry.running && !entry.done
    },
    [timers],
  )

  const getTimersForOtherTracks = useCallback(
    (
      activeTrack: string | null,
      trackSteps: Record<string, number>,
    ): ActiveTimerInfo[] => {
      const result: ActiveTimerInfo[] = []
      for (const [key, entry] of Object.entries(timers)) {
        const [trackId, stepIdxStr] = key.split(':')
        const stepIdx = Number(stepIdxStr)
        if (
          trackId !== activeTrack &&
          stepIdx === (trackSteps[trackId] ?? 0) &&
          (entry.running || entry.done)
        ) {
          result.push({
            trackId,
            timerKey: key,
            timeLeft: entry.timeLeft,
            duration: entry.duration,
            done: entry.done,
          })
        }
      }
      return result
    },
    [timers],
  )

  const getTimer = useCallback(
    (key: string, duration: number): StepTimerState => {
      ensureTimer(key, duration)
      const entry = timers[key]
      const timeLeft = entry?.timeLeft ?? duration
      const running = entry?.running ?? false
      const done = entry?.done ?? false
      const dur = entry?.duration ?? duration

      return {
        timeLeft,
        running,
        done,
        overtime: done ? Math.max(0, -timeLeft) : 0,
        notStarted: !running && timeLeft === dur && !done,
        paused: !running && timeLeft < dur && !done,
        start: () => start(key),
        pause: () => pause(key),
        resume: () => resume(key),
        forceComplete: () => forceComplete(key),
      }
    },
    [timers, ensureTimer, start, pause, resume, forceComplete],
  )

  return {
    getTimer,
    startTimer,
    forceComplete,
    getEntry,
    isRunning,
    getTimersForOtherTracks,
  } satisfies StepTimerRegistry
}
