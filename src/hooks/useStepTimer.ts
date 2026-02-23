import { useState, useEffect, useRef, useCallback } from 'react'
import { playChime, playTick } from '../utils'

interface UseStepTimerOptions {
  duration: number
}

export interface StepTimerState {
  timeLeft: number
  running: boolean
  done: boolean
  notStarted: boolean
  paused: boolean
  start: () => void
  pause: () => void
  resume: () => void
  /** Force-finish the timer (skip). */
  forceComplete: () => void
}

/**
 * Manages a single countdown timer bound to a recipe step.
 */
export function useStepTimer({
  duration,
}: UseStepTimerOptions): StepTimerState {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const animationFrameHandle = useRef<number | null>(null)
  const lastTimestamp = useRef<number | null>(null)
  const lastWholeSecond = useRef(duration)

  const cancel = useCallback(() => {
    if (animationFrameHandle.current !== null) {
      cancelAnimationFrame(animationFrameHandle.current)
      animationFrameHandle.current = null
    }
    lastTimestamp.current = null
  }, [])

  useEffect(() => {
    if (!running) return

    const tick = (timestamp: number) => {
      if (lastTimestamp.current === null) {
        lastTimestamp.current = timestamp
        animationFrameHandle.current = requestAnimationFrame(tick)
        return
      }

      const elapsed = (timestamp - lastTimestamp.current) / 1000
      lastTimestamp.current = timestamp

      setTimeLeft((prev) => {
        const next = prev - elapsed
        if (next <= 0) {
          cancel()
          setRunning(false)
          setDone(true)
          playChime()
          return 0
        }

        const currentWholeSecond = Math.ceil(next)
        if (currentWholeSecond < lastWholeSecond.current) {
          lastWholeSecond.current = currentWholeSecond
          if (currentWholeSecond <= 10) playTick()
        }

        return next
      })

      animationFrameHandle.current = requestAnimationFrame(tick)
    }

    animationFrameHandle.current = requestAnimationFrame(tick)
    return cancel
  }, [running, cancel])

  const start = useCallback(() => {
    lastWholeSecond.current = duration
    setRunning(true)
  }, [duration])

  const pause = useCallback(() => {
    setRunning(false)
    cancel()
  }, [cancel])

  const resume = useCallback(() => setRunning(true), [])

  const forceComplete = useCallback(() => {
    cancel()
    setRunning(false)
    setTimeLeft(0)
    setDone(true)
  }, [cancel])

  return {
    timeLeft,
    running,
    done,
    notStarted: !running && timeLeft === duration && !done,
    paused: !running && timeLeft < duration && !done,
    start,
    pause,
    resume,
    forceComplete,
  }
}
