import { useState } from "react";
import type { Recipe, RecipeTrack, BackgroundTimerMap } from "../../types";
import { ProgressBar, SkipTimerModal } from "../common";
import { StepCard } from "./StepCard";
import { BackgroundTimerPill } from "./BackgroundTimerPill";
import { TrackInterruptCard } from "./TrackInterruptCard";

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
    <div style={{ paddingBottom: bgTimers.active.length > 0 ? 100 : 40 }}>
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
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(251,246,240,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-card-border)",
          padding: "16px 20px 14px",
        }}
      >
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-heading)" }}>
                {recipe.title}
              </div>
              <div style={{ fontSize: 12, color: "var(--color-muted)", marginTop: 2 }}>
                {stage.label}
              </div>
            </div>
            <button
              onClick={onExit}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                borderRadius: 10,
                padding: "5px 12px",
                fontSize: 12,
                color: "var(--color-muted)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
            >
              ✕ Exit
            </button>
          </div>

          {/* Track switcher */}
          {visTracks.length > 1 && (
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {visTracks.map((t) => {
                const done = (trackSteps[t.id] || 0) >= t.steps.length;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSetActiveTrack(t.id)}
                    style={{
                      flex: 1,
                      background: activeTrack === t.id ? t.color : "transparent",
                      color: activeTrack === t.id ? "white" : t.color,
                      border: `2px solid ${t.color}`,
                      borderRadius: 12,
                      padding: "8px 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                      opacity: done ? 0.5 : 1,
                      transition: "all 0.2s",
                    }}
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
        <div
          style={{
            position: "fixed",
            bottom: 20,
            left: 20,
            right: 20,
            zIndex: 200,
            maxWidth: 520,
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
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
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "24px 16px" }}>
        {isTrackDone ? (
          <div style={{ textAlign: "center", padding: "48px 24px", animation: "fadeIn 0.5s ease" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <div style={{ fontSize: 18, color: "var(--color-heading)", fontWeight: 600, marginBottom: 8 }}>
              {curTrack?.label} — complete
            </div>
            <div style={{ fontSize: 14, color: "var(--color-muted)" }}>
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
