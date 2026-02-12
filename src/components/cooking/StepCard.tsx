import { useState } from "react";
import type { CSSProperties } from "react";
import type { RecipeStep, RecipeTrack, StageType } from "../../types";
import { useStepTimer } from "../../hooks";
import { Btn, CircularTimer, SkipTimerModal } from "../common";
import { InstructionText } from "./InstructionText";
import css from "./StepCard.module.css";

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
      <div className={css.card} style={{ "--track-color": track.color } as CSSProperties}>
        {/* Header */}
        <div className={css.header}>
          <div className={css.stepNumber}>{stepIndex + 1}</div>
          <div className={css.stepLabel}>
            Step {stepIndex + 1} of {totalSteps}
            {stageType === "cooking" && <span> · {track.label}</span>}
          </div>
          <div className={css.stageBadge} data-stage={stageType}>
            {stageType === "preparation" ? "Prep" : "Cook"}
          </div>
        </div>

        {/* Instruction */}
        <div className={css.instruction}>
          <InstructionText text={step.instruction} glossary={step.glossary} />
        </div>

        {/* Hint */}
        {step.hint && (
          <div className={css.hint}>
            <span className={css.hintIcon}>💡</span>
            <span className={css.hintText}>{step.hint}</span>
          </div>
        )}

        {/* Timer ring */}
        {isTimer && !timer.done && (
          <div className={css.timerArea}>
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
        <div className={css.completionArea}>
          {step.completionHint && (step.completionType === "manual" || timer.done) && !isFinal && (
            <div className={css.completionHint}>{step.completionHint}</div>
          )}
          {(step.completionType === "manual" || timer.done || isFinal) && (
            <Btn onClick={onComplete} color={isFinal ? "var(--color-success)" : track.color} big={isFinal}>
              {step.actionLabel || "Next step →"}
            </Btn>
          )}
          {timer.done && !isFinal && (
            <div className={css.timerComplete}>Timer complete</div>
          )}
          {timer.running && (
            <button onClick={handleSkipAttempt} className={css.skipBtn}>
              Skip timer →
            </button>
          )}
        </div>
      </div>
    </>
  );
}
