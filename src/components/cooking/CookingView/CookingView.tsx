import { useState } from "react";
import type { CSSProperties } from "react";
import type { Recipe, RecipeTrack, BackgroundTimerMap } from "../../../types";
import type { StepTimerState } from "../../../hooks/useStepTimerRegistry";
import { ProgressBar, SkipTimerModal } from "../../common";
import { StepCard } from "../StepCard/StepCard";
import { BackgroundTimerPill } from "../BackgroundTimerPill/BackgroundTimerPill";
import { TrackInterruptCard } from "../TrackInterruptCard/TrackInterruptCard";
import css from "./CookingView.module.css";

interface CookingViewProps {
  recipe: Recipe;
  currentStageIdx: number;
  trackSteps: Record<string, number>;
  activeTrack: string | null;
  pendingTrackStart: string | null;
  allTracks: RecipeTrack[];
  bgTimers: {
    timers: BackgroundTimerMap;
    active: [string, BackgroundTimerMap[string]][];
    dismiss: (tid: string) => void;
    skip: (tid: string) => void;
  };
  stepTimers: {
    getTimer: (key: string, duration: number) => StepTimerState;
  };
  onAdvanceStep: (trackId: string) => void;
  onDismissBgTimer: (tid: string) => void;
  onSwitchTrack: (tid: string) => void;
  onSetActiveTrack: (tid: string) => void;
  onExit: () => void;
}

export function CookingView({
  recipe,
  currentStageIdx,
  trackSteps,
  activeTrack,
  pendingTrackStart,
  allTracks,
  bgTimers,
  stepTimers,
  onAdvanceStep,
  onDismissBgTimer,
  onSwitchTrack,
  onSetActiveTrack,
  onExit,
}: CookingViewProps) {
  const [showBgSkipFor, setShowBgSkipFor] = useState<string | null>(null);

  const stage = recipe.stages[currentStageIdx];
  const curTrack = stage.tracks.find((t) => t.id === activeTrack);
  const curStepIdx = trackSteps[activeTrack || ""] || 0;
  const curStep = curTrack?.steps[curStepIdx];
  const isTrackDone = !curStep || curStepIdx >= (curTrack?.steps.length ?? 0);
  const visTracks = stage.tracks.filter(
    (t) => !t.isParallel || (trackSteps[t.id] || 0) > 0,
  );
  const nonBgSteps = curTrack?.steps.filter((s) => !s.isBackground) || [];
  const pendingTrack = pendingTrackStart
    ? allTracks.find((t) => t.id === pendingTrackStart)
    : null;

  return (
    <div
      className={css.container}
      data-has-bg-timers={bgTimers.active.length > 0 || undefined}
    >
      {/* Background skip confirmation */}
      {showBgSkipFor &&
        bgTimers.timers[showBgSkipFor] &&
        !bgTimers.timers[showBgSkipFor].done && (
          <SkipTimerModal
            timerLabel={allTracks.find((t) => t.id === showBgSkipFor)?.label || "Background timer"}
            timeLeft={bgTimers.timers[showBgSkipFor].timeLeft}
            onConfirm={() => {
              bgTimers.skip(showBgSkipFor);
              setShowBgSkipFor(null);
            }}
            onCancel={() => setShowBgSkipFor(null)}
          />
        )}

      {/* Sticky header */}
      <div className={css.stickyHeader}>
        <div className={css.headerInner}>
          <div className={css.headerRow}>
            <div>
              <div className={css.recipeTitle}>{recipe.title}</div>
              <div className={css.stageLabel}>{stage.label}</div>
            </div>
            <button onClick={onExit} className={css.exitBtn}>
              ✕ Exit
            </button>
          </div>

          {/* Track switcher */}
          {visTracks.length > 1 && (
            <div className={css.trackSwitcher}>
              {visTracks.map((t) => {
                const done = (trackSteps[t.id] || 0) >= t.steps.length;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSetActiveTrack(t.id)}
                    className={css.trackBtn}
                    data-active={activeTrack === t.id || undefined}
                    data-done={done || undefined}
                    style={{ "--track-color": t.color } as CSSProperties}
                  >
                    {t.label} {done && "✓"}
                  </button>
                );
              })}
            </div>
          )}

          <ProgressBar
            current={Math.min(curStepIdx, nonBgSteps.length)}
            total={nonBgSteps.length}
            color={curTrack?.color || "var(--color-primary)"}
          />
        </div>
      </div>

      {/* Background timer pills — fixed bottom */}
      {bgTimers.active.length > 0 && (
        <div className={css.bgTimerTray}>
          {bgTimers.active.map(([tid, bt]) => {
            const tr = allTracks.find((x) => x.id === tid);
            if (!tr) return null;
            return (
              <BackgroundTimerPill
                key={tid}
                track={tr}
                timeLeft={bt.timeLeft}
                total={bt.total}
                done={bt.done}
                onDismiss={() => onDismissBgTimer(tid)}
                onSkip={() => setShowBgSkipFor(tid)}
              />
            );
          })}
        </div>
      )}

      {/* Main content */}
      <div className={css.mainContent}>
        {isTrackDone ? (
          <div className={css.trackComplete}>
            <div className={css.trackCompleteEmoji}>✅</div>
            <div className={css.trackCompleteTitle}>
              {curTrack?.label} — complete
            </div>
            <div className={css.trackCompleteMsg}>
              {bgTimers.active.some(([, bt]) => !bt.dismissed)
                ? "Waiting for background timers to finish."
                : "Moving on..."}
            </div>
          </div>
        ) : (
          curTrack &&
          curStep && (
            <StepCard
              key={`${activeTrack}-${curStepIdx}`}
              step={curStep}
              stepIndex={curStepIdx}
              totalSteps={nonBgSteps.length}
              track={curTrack}
              stageType={stage.type}
              stepTimers={stepTimers}
              onComplete={() => onAdvanceStep(activeTrack!)}
            />
          )
        )}

        {/* Parallel track trigger */}
        {pendingTrack && pendingTrackStart !== activeTrack && (
          <TrackInterruptCard
            track={pendingTrack}
            onSwitch={() => onSwitchTrack(pendingTrackStart!)}
          />
        )}
      </div>
    </div>
  );
}
