import { useState, useEffect, useRef, useCallback } from "react";
import { playChime, playTick } from "../utils";

export interface StepTimerEntry {
  timeLeft: number;
  running: boolean;
  done: boolean;
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
  forceComplete: () => void;
}

export type StepTimerMap = Record<string, StepTimerEntry>;

export interface StepTimerRegistry {
  getTimer: (key: string, duration: number) => StepTimerState;
  startTimer: (key: string, duration: number) => void;
  forceComplete: (key: string) => void;
  timers: StepTimerMap;
}

/**
 * Manages a registry of step timers that persist across component
 * mount/unmount cycles. Timers keep ticking even when their StepCard
 * is not rendered (e.g. after a track switch).
 */
export function useStepTimerRegistry() {
  const [timers, setTimers] = useState<StepTimerMap>({});
  const intervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  const start = useCallback((key: string) => {
    setTimers((prev) => {
      const cur = prev[key];
      if (!cur || cur.running || cur.done) return prev;
      return { ...prev, [key]: { ...cur, running: true } };
    });
  }, []);

  const pause = useCallback((key: string) => {
    if (intervals.current[key]) {
      clearInterval(intervals.current[key]);
      delete intervals.current[key];
    }
    setTimers((prev) => {
      const cur = prev[key];
      if (!cur || !cur.running) return prev;
      return { ...prev, [key]: { ...cur, running: false } };
    });
  }, []);

  const resume = useCallback((key: string) => {
    start(key);
  }, [start]);

  const forceComplete = useCallback((key: string) => {
    if (intervals.current[key]) {
      clearInterval(intervals.current[key]);
      delete intervals.current[key];
    }
    setTimers((prev) => {
      const cur = prev[key];
      if (!cur) return prev;
      return { ...prev, [key]: { ...cur, timeLeft: 0, running: false, done: true } };
    });
  }, []);

  const ensureTimer = useCallback((key: string, duration: number) => {
    setTimers((prev) => {
      if (prev[key]) return prev;
      return { ...prev, [key]: { timeLeft: duration, running: false, done: false, duration } };
    });
  }, []);

  const startTimer = useCallback((key: string, duration: number) => {
    setTimers((prev) => {
      const existing = prev[key];
      if (existing) {
        if (existing.running || existing.done) return prev;
        return { ...prev, [key]: { ...existing, running: true } };
      }
      return { ...prev, [key]: { timeLeft: duration, running: true, done: false, duration } };
    });
  }, []);

  useEffect(() => {
    Object.entries(timers).forEach(([key, entry]) => {
      if (entry.running && !entry.done && !intervals.current[key]) {
        intervals.current[key] = setInterval(() => {
          setTimers((prev) => {
            const cur = prev[key];
            if (!cur || !cur.running || cur.done) {
              clearInterval(intervals.current[key]);
              delete intervals.current[key];
              return prev;
            }
            if (cur.timeLeft <= 1) {
              clearInterval(intervals.current[key]);
              delete intervals.current[key];
              playChime();
              return { ...prev, [key]: { ...cur, timeLeft: 0, running: false, done: true } };
            }
            if (cur.timeLeft <= 10) playTick();
            return { ...prev, [key]: { ...cur, timeLeft: cur.timeLeft - 1 } };
          });
        }, 1000);
      } else if (!entry.running && intervals.current[key]) {
        clearInterval(intervals.current[key]);
        delete intervals.current[key];
      }
    });
  }, [timers]);

  useEffect(
    () => () => {
      Object.values(intervals.current).forEach(clearInterval);
    },
    [],
  );

  /**
   * Get a StepTimerState for a given key. Ensures the timer entry
   * exists and returns current state with bound actions.
   */
  const getTimer = useCallback(
    (key: string, duration: number): StepTimerState => {
      ensureTimer(key, duration);
      const entry = timers[key];
      const timeLeft = entry?.timeLeft ?? duration;
      const running = entry?.running ?? false;
      const done = entry?.done ?? false;
      const dur = entry?.duration ?? duration;

      return {
        timeLeft,
        running,
        done,
        notStarted: !running && timeLeft === dur && !done,
        paused: !running && timeLeft < dur && !done,
        start: () => start(key),
        pause: () => pause(key),
        resume: () => resume(key),
        forceComplete: () => forceComplete(key),
      };
    },
    [timers, ensureTimer, start, pause, forceComplete],
  );

  return { getTimer, startTimer, forceComplete, timers } satisfies StepTimerRegistry;
}
