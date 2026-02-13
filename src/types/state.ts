/* ─────────────────────────────────────────────────────────────────────────────
   Application state types
   ───────────────────────────────────────────────────────────────────────────── */

export type AppPhase = "intro" | "stageTransition" | "cooking" | "done";

/** Maps track ID → current step index within that track. */
export type TrackStepMap = Record<string, number>;
