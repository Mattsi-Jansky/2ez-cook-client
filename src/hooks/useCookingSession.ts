import { useState, useCallback } from "react";
import type { Recipe, AppPhase, TrackStepMap, RecipeTrack } from "../types";
import { useStepTimerRegistry } from "./useStepTimerRegistry";

/**
 * Central hook that drives the entire cooking session:
 * – tracks which phase (intro / stageTransition / cooking / done)
 * – which stage and step the user is on
 * – active and pending tracks
 * – background timers
 */
interface CookingSessionOptions {
  skipIntro?: boolean;
}

export function useCookingSession(
  recipe: Recipe,
  options?: CookingSessionOptions,
) {
  const skipIntro = options?.skipIntro ?? false;
  const [phase, setPhase] = useState<AppPhase>(
    skipIntro ? "stageTransition" : "intro",
  );
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [trackSteps, setTrackSteps] = useState<TrackStepMap>({});
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [pendingTrackStart, setPendingTrackStart] = useState<string | null>(null);
  const [startedTracks, setStartedTracks] = useState<Set<string>>(new Set());
  const [stageTransitionTarget, setStageTransitionTarget] = useState(0);

  const stepTimers = useStepTimerRegistry();
  const allTracks: RecipeTrack[] = recipe.stages.flatMap((s) => s.tracks);

  /* ── Initialise a stage ──────────────────────────────────────────────── */
  const initStage = useCallback(
    (idx: number) => {
      const stage = recipe.stages[idx];
      const init: TrackStepMap = {};
      stage.tracks.forEach((t) => {
        init[t.id] = 0;
      });
      setTrackSteps((prev) => ({ ...prev, ...init }));
      setStartedTracks(new Set(stage.tracks.filter((t) => !t.isParallel).map((t) => t.id)));
      setActiveTrack(
        (stage.tracks.find((t) => !t.isParallel) || stage.tracks[0]).id,
      );
      setCurrentStageIdx(idx);
    },
    [recipe.stages],
  );

  /* ── Start cooking from the intro ────────────────────────────────────── */
  const handleStart = useCallback(() => {
    setStageTransitionTarget(0);
    setPhase("stageTransition");
  }, []);

  /* ── Continue past a stage-transition screen ─────────────────────────── */
  const handleStageContinue = useCallback(() => {
    initStage(stageTransitionTarget);
    setPhase("cooking");
  }, [initStage, stageTransitionTarget]);

  /* ── Move to the next stage (or finish) ──────────────────────────────── */
  const transitionToNextStage = useCallback(() => {
    const next = currentStageIdx + 1;
    if (next >= recipe.stages.length) {
      setPhase("done");
    } else {
      setStageTransitionTarget(next);
      setPhase("stageTransition");
    }
  }, [currentStageIdx, recipe.stages.length]);

  /* ── Advance one step in a track ─────────────────────────────────────── */
  const advanceStep = useCallback(
    (trackId: string) => {
      const track = allTracks.find((t) => t.id === trackId);
      if (!track) return;

      setTrackSteps((prev) => {
        const curIdx = prev[trackId] || 0;
        const curStep = track.steps[curIdx];
        const nextIdx = curIdx + 1;

        // trigger parallel track — start it immediately
        if (curStep?.onComplete?.startTrack) {
          const tid = curStep.onComplete.startTrack;
          setPendingTrackStart(tid);
          setStartedTracks((prev) => {
            if (prev.has(tid)) return prev;
            const next = new Set(prev);
            next.add(tid);
            return next;
          });
        }

        // track finished?
        if (nextIdx >= track.steps.length) {
          const newSteps = { ...prev, [trackId]: nextIdx };
          const stage = recipe.stages[currentStageIdx];
          const allDone = stage.tracks.every(
            (t) => (newSteps[t.id] ?? prev[t.id] ?? 0) >= t.steps.length,
          );

          if (allDone) {
            transitionToNextStage();
          } else {
            const nxt = stage.tracks.find((t) => {
              const i =
                t.id === trackId ? nextIdx : (newSteps[t.id] ?? prev[t.id] ?? 0);
              return i < t.steps.length;
            });
            if (nxt) setActiveTrack(nxt.id);
          }
          return newSteps;
        }

        // is the *next* step a background timer? Auto-start it and switch back to main track
        const nextStep = track.steps[nextIdx];
        if (nextStep?.isBackground && nextStep?.completionType === "timer") {
          const timerKey = `${trackId}:${nextIdx}`;
          stepTimers.startTimer(timerKey, nextStep.timerDuration!);
          const stage = recipe.stages[currentStageIdx];
          const main = stage.tracks.find((t) => !t.isParallel);
          if (
            main &&
            main.id !== trackId &&
            (prev[main.id] ?? 0) < main.steps.length
          ) {
            setActiveTrack(main.id);
          }
          return { ...prev, [trackId]: nextIdx };
        }

        return { ...prev, [trackId]: nextIdx };
      });
    },
    [allTracks, currentStageIdx, recipe.stages, stepTimers, transitionToNextStage],
  );

  /* ── Switch to a different track ─────────────────────────────────────── */
  const switchToTrack = useCallback(
    (tid: string) => {
      setActiveTrack(tid);
      setPendingTrackStart((prev) => (prev === tid ? null : prev));
    },
    [],
  );

  /* ── Reset everything ────────────────────────────────────────────────── */
  const restart = useCallback(() => setPhase("intro"), []);

  return {
    phase,
    currentStageIdx,
    trackSteps,
    activeTrack,
    pendingTrackStart,
    startedTracks,
    stageTransitionTarget,
    stepTimers,
    allTracks,

    handleStart,
    handleStageContinue,
    advanceStep,
    switchToTrack,
    restart,
  };
}
