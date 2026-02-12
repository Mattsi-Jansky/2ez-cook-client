import { useState, useEffect, useRef, useCallback } from "react";
import { playChime, playTick } from "../utils";

interface UseStepTimerOptions {
  duration: number;
}

export interface StepTimerState {
  timeLeft: number;
  running: boolean;
  done: boolean;
  notStarted: boolean;
  paused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  /** Force-finish the timer (skip). */
  forceComplete: () => void;
}

/**
 * Manages a single countdown timer bound to a recipe step.
 */
export function useStepTimer({ duration }: UseStepTimerOptions): StepTimerState {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const interval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (interval.current) {
      clearInterval(interval.current);
      interval.current = null;
    }
  };

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    interval.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clear();
          setRunning(false);
          setDone(true);
          playChime();
          return 0;
        }
        if (prev <= 10) playTick();
        return prev - 1;
      });
    }, 1000);
    return clear;
  }, [running, timeLeft]);

  const start = useCallback(() => setRunning(true), []);
  const pause = useCallback(() => {
    setRunning(false);
    clear();
  }, []);
  const resume = useCallback(() => setRunning(true), []);

  const forceComplete = useCallback(() => {
    clear();
    setRunning(false);
    setTimeLeft(0);
    setDone(true);
  }, []);

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
  };
}
