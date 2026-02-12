/* ─────────────────────────────────────────────────────────────────────────────
   Application state types
   ───────────────────────────────────────────────────────────────────────────── */

export type AppPhase = "intro" | "stageTransition" | "cooking" | "done";

export interface BackgroundTimer {
  timeLeft: number;
  total: number;
  done: boolean;
  dismissed: boolean;
}

/** Maps track ID → current step index within that track. */
export type TrackStepMap = Record<string, number>;

/** Maps track ID → BackgroundTimer state. */
export type BackgroundTimerMap = Record<string, BackgroundTimer>;
