import { useState, useCallback } from "react";
import type { Recipe, AppPhase, TrackStepMap, RecipeTrack } from "../types";
import { useBackgroundTimers } from "./useBackgroundTimers";
import { useStepTimerRegistry } from "./useStepTimerRegistry";

/**
 * Central hook that drives the entire cooking session:
 * – tracks which phase (intro / stageTransition / cooking / done)
 * – which stage and step the user is on
 * – active and pending tracks
 * – background timers
 */
export function useCookingSession(recipe: Recipe) {
  const [phase, setPhase] = useState<AppPhase>("intro");
  const [currentStageIdx, setCurrentStageIdx] = useState(0);
  const [trackSteps, setTrackSteps] = useState<TrackStepMap>({});
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [pendingTrackStart, setPendingTrackStart] = useState<string | null>(null);
  const [stageTransitionTarget, setStageTransitionTarget] = useState(0);

  const bgTimers = useBackgroundTimers();
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

        // trigger parallel track
        if (curStep?.onComplete?.startTrack) {
          setPendingTrackStart(curStep.onComplete.startTrack);
        }

        // track finished?
        if (nextIdx >= track.steps.length) {
          const newSteps = { ...prev, [trackId]: nextIdx };
          const stage = recipe.stages[currentStageIdx];
          const allDone = stage.tracks.every(
            (t) => (newSteps[t.id] ?? prev[t.id] ?? 0) >= t.steps.length,
          );
          const hasBg = bgTimers.active.some(
            ([tid, bt]) =>
              !bt.dismissed &&
              !bt.done &&
              stage.tracks.some((t) => t.id === tid),
          );

          if (allDone && !hasBg) {
            transitionToNextStage();
          } else if (!allDone) {
            const nxt = stage.tracks.find((t) => {
              const i =
                t.id === trackId ? nextIdx : (newSteps[t.id] ?? prev[t.id] ?? 0);
              return i < t.steps.length;
            });
            if (nxt) setActiveTrack(nxt.id);
          }
          return newSteps;
        }

        // is the *next* step a background timer?
        const nextStep = track.steps[nextIdx];
        if (nextStep?.isBackground && nextStep?.completionType === "timer") {
          bgTimers.add(trackId, nextStep.timerDuration!);
          const afterBg = nextIdx + 1;
          const newSteps = { ...prev, [trackId]: afterBg };
          const stage = recipe.stages[currentStageIdx];
          const main = stage.tracks.find((t) => !t.isParallel);
          if (
            main &&
            main.id !== trackId &&
            (newSteps[main.id] ?? prev[main.id] ?? 0) < main.steps.length
          ) {
            setActiveTrack(main.id);
          }
          return newSteps;
        }

        return { ...prev, [trackId]: nextIdx };
      });
    },
    [allTracks, currentStageIdx, recipe.stages, bgTimers, transitionToNextStage],
  );

  /* ── Dismiss a background timer and maybe advance ────────────────────── */
  const dismissBgTimer = useCallback(
    (tid: string) => {
      bgTimers.dismiss(tid);

      // check completion after a tick
      setTimeout(() => {
        setTrackSteps((ts) => {
          const stage = recipe.stages[currentStageIdx];
          const allDone = stage.tracks.every(
            (t) => (ts[t.id] ?? 0) >= t.steps.length,
          );
          const hasBg = bgTimers.active.some(
            ([id, bt]) =>
              id !== tid &&
              !bt.dismissed &&
              !bt.done &&
              stage.tracks.some((t) => t.id === id),
          );
          if (allDone && !hasBg) transitionToNextStage();
          return ts;
        });
      }, 50);
    },
    [bgTimers, currentStageIdx, recipe.stages, transitionToNextStage],
  );

  /* ── Switch to a different track ─────────────────────────────────────── */
  const switchTrack = useCallback(
    (tid: string) => {
      setActiveTrack(tid);
      setPendingTrackStart(null);
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
    stageTransitionTarget,
    bgTimers,
    stepTimers,
    allTracks,

    handleStart,
    handleStageContinue,
    advanceStep,
    dismissBgTimer,
    switchTrack,
    restart,
    setActiveTrack,
  };
}
