import { useState, useEffect, useRef, useCallback } from "react";
import { playChime } from "../utils";
import type { BackgroundTimerMap } from "../types";

/**
 * Manages a set of background timers that tick independently.
 */
export function useBackgroundTimers() {
  const [timers, setTimers] = useState<BackgroundTimerMap>({});
  const intervals = useRef<Record<string, ReturnType<typeof setInterval>>>({});

  /** Register a new background timer. */
  const add = useCallback((trackId: string, duration: number) => {
    setTimers((prev) => ({
      ...prev,
      [trackId]: { timeLeft: duration, total: duration, done: false, dismissed: false },
    }));
  }, []);

  /** Dismiss a finished timer. Returns true if dismissed. */
  const dismiss = useCallback((trackId: string) => {
    setTimers((prev) => {
      if (!prev[trackId]) return prev;
      return { ...prev, [trackId]: { ...prev[trackId], dismissed: true } };
    });
    if (intervals.current[trackId]) {
      clearInterval(intervals.current[trackId]);
      delete intervals.current[trackId];
    }
  }, []);

  /** Skip (force-finish) a running background timer. */
  const skip = useCallback((trackId: string) => {
    if (intervals.current[trackId]) {
      clearInterval(intervals.current[trackId]);
      delete intervals.current[trackId];
    }
    setTimers((prev) => {
      if (!prev[trackId]) return prev;
      return { ...prev, [trackId]: { ...prev[trackId], timeLeft: 0, done: true } };
    });
    playChime();
  }, []);

  /** Start ticking any timers that aren't already running. */
  useEffect(() => {
    Object.entries(timers).forEach(([tid, bt]) => {
      if (bt.done || bt.dismissed || intervals.current[tid]) return;
      intervals.current[tid] = setInterval(() => {
        setTimers((prev) => {
          const cur = prev[tid];
          if (!cur || cur.done) {
            clearInterval(intervals.current[tid]);
            delete intervals.current[tid];
            return prev;
          }
          if (cur.timeLeft <= 1) {
            clearInterval(intervals.current[tid]);
            delete intervals.current[tid];
            playChime();
            return { ...prev, [tid]: { ...cur, timeLeft: 0, done: true } };
          }
          return { ...prev, [tid]: { ...cur, timeLeft: cur.timeLeft - 1 } };
        });
      }, 1000);
    });
  }, [timers]);

  /** Cleanup on unmount. */
  useEffect(
    () => () => {
      Object.values(intervals.current).forEach(clearInterval);
    },
    [],
  );

  /** Active (non-dismissed) timers. */
  const active = Object.entries(timers).filter(([, bt]) => !bt.dismissed);

  return { timers, active, add, dismiss, skip };
}
