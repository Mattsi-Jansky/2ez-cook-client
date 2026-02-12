import { useState } from "react";
import type { RecipeStep, RecipeTrack, StageType } from "../../types";
import { useStepTimer } from "../../hooks";
import { Btn, CircularTimer, SkipTimerModal } from "../common";
import { InstructionText } from "./InstructionText";

interface StepCardProps {
  step: RecipeStep;
  stepIndex: number;
  totalSteps: number;
  track: RecipeTrack;
  stageType: StageType;
  onComplete: () => void;
}

export function StepCard({ step, stepIndex, totalSteps, track, stageType, onComplete }: StepCardProps) {
  const timer = useStepTimer({ duration: step.timerDuration || 0 });
  const [showSkip, setShowSkip] = useState(false);

  const isFinal = step.completionType === "final";
  const isTimer = step.completionType === "timer";
  const timerActive = isTimer && !timer.done;

  const handleSkipAttempt = () => {
    if (timerActive && !timer.done) setShowSkip(true);
    else onComplete();
  };

  const handleSkipConfirm = () => {
    timer.forceComplete();
    setShowSkip(false);
    onComplete();
  };

  return (
    <>
      {showSkip && (
        <SkipTimerModal
          timerLabel={step.timerLabel || "Timer"}
          timeLeft={timer.timeLeft}
          onConfirm={handleSkipConfirm}
          onCancel={() => setShowSkip(false)}
        />
      )}
      <div
        style={{
          background: "white",
          borderRadius: 24,
          padding: "32px 28px",
          boxShadow: "0 4px 24px rgba(90,66,52,0.08)",
          border: "2px solid var(--color-card-border)",
          animation: "slideUp 0.5s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              background: track.color,
              color: "white",
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            {stepIndex + 1}
          </div>
          <div style={{ fontSize: 13, color: "var(--color-muted)", fontWeight: 500, flex: 1 }}>
            Step {stepIndex + 1} of {totalSteps}
            {stageType === "cooking" && <span> · {track.label}</span>}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 1,
              color: stageType === "preparation" ? "#8B7355" : "var(--color-primary)",
              background: stageType === "preparation" ? "#FFF8F0" : "#FFF0E8",
              padding: "3px 10px",
              borderRadius: 8,
            }}
          >
            {stageType === "preparation" ? "Prep" : "Cook"}
          </div>
        </div>

        {/* Instruction */}
        <div
          style={{
            fontSize: 19,
            lineHeight: 1.65,
            color: "var(--color-heading-dark)",
            marginBottom: 24,
            fontFamily: "var(--font-display)",
          }}
        >
          <InstructionText text={step.instruction} glossary={step.glossary} />
        </div>

        {/* Hint */}
        {step.hint && (
          <div
            style={{
              background: "#FFF8F0",
              border: "1px solid #F0E0CC",
              borderRadius: 14,
              padding: "14px 18px",
              marginBottom: 24,
              display: "flex",
              gap: 10,
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
            <span style={{ fontSize: 14, color: "#8B7355", lineHeight: 1.5 }}>{step.hint}</span>
          </div>
        )}

        {/* Timer ring */}
        {isTimer && !timer.done && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 24 }}>
            <CircularTimer
              duration={step.timerDuration!}
              timeLeft={timer.timeLeft}
              running={timer.running}
              color={track.color}
              label={step.timerLabel}
            />
            {timer.notStarted && (
              <Btn onClick={timer.start} color={track.color}>
                {step.actionLabel || "Start timer"}
              </Btn>
            )}
            {timer.running && (
              <Btn onClick={timer.pause} ghost>
                ⏸ Pause
              </Btn>
            )}
            {timer.paused && (
              <Btn onClick={timer.resume} color={track.color} small>
                ▶ Resume
              </Btn>
            )}
          </div>
        )}

        {/* Completion area */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          {step.completionHint && (step.completionType === "manual" || timer.done) && !isFinal && (
            <div
              style={{
                fontSize: 13,
                color: "var(--color-muted)",
                textAlign: "center",
                maxWidth: 340,
                lineHeight: 1.5,
                marginBottom: 4,
              }}
            >
              {step.completionHint}
            </div>
          )}
          {(step.completionType === "manual" || timer.done || isFinal) && (
            <Btn onClick={onComplete} color={isFinal ? "var(--color-success)" : track.color} big={isFinal}>
              {step.actionLabel || "Next step →"}
            </Btn>
          )}
          {timer.done && !isFinal && (
            <div style={{ fontSize: 13, color: "var(--color-success)", fontWeight: 500, marginTop: 4 }}>
              Timer complete
            </div>
          )}
          {timer.running && (
            <button
              onClick={handleSkipAttempt}
              style={{
                marginTop: 8,
                background: "transparent",
                color: "#B8A99A",
                border: "1px solid var(--color-border)",
                borderRadius: 12,
                padding: "8px 20px",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "var(--color-text)";
                (e.target as HTMLElement).style.borderColor = "#CCC0B4";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#B8A99A";
                (e.target as HTMLElement).style.borderColor = "var(--color-border)";
              }}
            >
              Skip timer →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
