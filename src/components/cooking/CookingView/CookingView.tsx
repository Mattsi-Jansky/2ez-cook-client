import { useState } from "react";
import type { CSSProperties } from "react";
import type { Recipe, RecipeTrack } from "../../../types";
import type { StepTimerRegistry } from "../../../hooks/useStepTimerRegistry";
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
  stepTimers: StepTimerRegistry;
  onAdvanceStep: (trackId: string) => void;
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
  stepTimers,
  onAdvanceStep,
  onSwitchTrack,
  onSetActiveTrack,
  onExit,
}: CookingViewProps) {
  const [showSkipFor, setShowSkipFor] = useState<string | null>(null);

  const stage = recipe.stages[currentStageIdx];
  const curTrack = stage.tracks.find((t) => t.id === activeTrack);
  const curStepIdx = trackSteps[activeTrack || ""] || 0;
  const curStep = curTrack?.steps[curStepIdx];
  const isTrackDone = !curStep || curStepIdx >= (curTrack?.steps.length ?? 0);
  const visTracks = stage.tracks.filter(
    (t) => !t.isParallel || (trackSteps[t.id] || 0) > 0,
  );
  const totalSteps = curTrack?.steps.length ?? 0;
  const pendingTrack = pendingTrackStart
    ? allTracks.find((t) => t.id === pendingTrackStart)
    : null;

  const toastPills = stepTimers.getTimersForOtherTracks(activeTrack, trackSteps);

  const hasRunningStepTimers = stage.tracks.some((t) => {
    const idx = trackSteps[t.id] ?? 0;
    return stepTimers.isRunning(`${t.id}:${idx}`);
  });

  return (
    <div
      className={css.container}
      data-has-bg-timers={toastPills.length > 0 || undefined}
    >
      {/* Skip confirmation modal */}
      {showSkipFor && (() => {
        const entry = stepTimers.getEntry(showSkipFor);
        if (!entry || entry.done) return null;
        const [trackId] = showSkipFor.split(":");
        return (
          <SkipTimerModal
            timerLabel={allTracks.find((t) => t.id === trackId)?.label || "Background timer"}
            timeLeft={entry.timeLeft}
            onConfirm={() => {
              stepTimers.forceComplete(showSkipFor);
              setShowSkipFor(null);
            }}
            onCancel={() => setShowSkipFor(null)}
          />
        );
      })()}

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
            current={Math.min(curStepIdx, totalSteps)}
            total={totalSteps}
            color={curTrack?.color || "var(--color-primary)"}
          />
        </div>
      </div>

      {/* Toast timer pills — fixed bottom */}
      {toastPills.length > 0 && (
        <div className={css.bgTimerTray}>
          {toastPills.map((pill) => {
            const tr = allTracks.find((x) => x.id === pill.trackId);
            if (!tr) return null;
            return (
              <BackgroundTimerPill
                key={pill.timerKey}
                track={tr}
                timeLeft={pill.timeLeft}
                total={pill.duration}
                done={pill.done}
                onView={() => onSetActiveTrack(pill.trackId)}
                onSkip={() => setShowSkipFor(pill.timerKey)}
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
              {hasRunningStepTimers
                ? "Waiting for timers to finish."
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
              totalSteps={totalSteps}
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
