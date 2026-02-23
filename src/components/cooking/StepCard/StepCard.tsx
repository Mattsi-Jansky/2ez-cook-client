import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { RecipeStep, RecipeTrack, StageType } from '../../../types'
import type { StepTimerState } from '../../../hooks/useStepTimerRegistry'
import { Btn, CircularTimer, SkipTimerModal } from '../../common'
import { InstructionText } from '../InstructionText/InstructionText'
import css from './StepCard.module.css'

interface StepCardProps {
  step: RecipeStep
  stepIndex: number
  totalSteps: number
  track: RecipeTrack
  stageType: StageType
  portionsMultiplier?: number
  stepTimers: { getTimer: (key: string, duration: number) => StepTimerState }
  onComplete: () => void
  viewMode: 'current' | 'review' | 'preview'
}

export function StepCard({
  step,
  stepIndex,
  totalSteps,
  track,
  stageType,
  portionsMultiplier,
  stepTimers,
  onComplete,
  viewMode,
}: StepCardProps) {
  const readOnly = viewMode !== 'current'

  const timer = stepTimers.getTimer(
    `${track.id}:${stepIndex}`,
    step.timerDuration || 0,
  )
  const [showSkip, setShowSkip] = useState(false)

  const isFinal = step.completionType === 'final'
  const isTimer = step.completionType === 'timer'
  const timerActive = isTimer && !timer.done

  const handleSkipAttempt = () => {
    if (timerActive && !timer.done) setShowSkip(true)
    else onComplete()
  }

  const handleComplete = () => {
    if (timer.done) timer.pause()
    onComplete()
  }

  const handleSkipConfirm = () => {
    timer.forceComplete()
    setShowSkip(false)
    onComplete()
  }

  return (
    <>
      {showSkip && (
        <SkipTimerModal
          timerLabel={step.timerLabel || 'Timer'}
          timeLeft={timer.timeLeft}
          onConfirm={handleSkipConfirm}
          onCancel={() => setShowSkip(false)}
        />
      )}
      <div
        className={css.card}
        style={{ '--track-color': track.color } as CSSProperties}
      >
        {/* Header */}
        <div className={css.header}>
          <div className={css.stepNumber}>{stepIndex + 1}</div>
          <div className={css.stepLabel}>
            Step {stepIndex + 1} of {totalSteps}
            {stageType === 'cooking' && <span> · {track.label}</span>}
          </div>
          <div className={css.stageBadge} data-stage={stageType}>
            {stageType === 'preparation' ? 'Prep' : 'Cook'}
          </div>
        </div>

        {/* Instruction */}
        <div className={css.instruction}>
          <InstructionText
            text={step.instruction}
            glossary={step.glossary}
            quantities={step.quantities}
            portionsMultiplier={portionsMultiplier}
          />
        </div>

        {/* Hint */}
        {step.hint && (
          <div className={css.hint}>
            <span className={css.hintIcon}>💡</span>
            <span className={css.hintText}>{step.hint}</span>
          </div>
        )}

        {/* Timer ring (show ring in viewMode but hide controls) */}
        {isTimer && (
          <div className={css.timerArea}>
            <CircularTimer
              duration={step.timerDuration!}
              timeLeft={timer.timeLeft}
              running={timer.running}
              color={track.color}
              label={step.timerLabel}
              overtime={timer.overtime}
            />
            {!readOnly && timer.notStarted && (
              <Btn onClick={timer.start} variant="track">
                {step.actionLabel || 'Start timer'}
              </Btn>
            )}
            {!readOnly && timer.running && !timer.done && (
              <Btn onClick={timer.pause} variant="ghost">
                ⏸ Pause
              </Btn>
            )}
            {!readOnly && timer.paused && (
              <Btn onClick={timer.resume} variant="track" size="sm">
                ▶ Resume
              </Btn>
            )}
          </div>
        )}

        {/* Completion area or view-mode indicator */}
        {readOnly ? (
          <div className={css.viewModeIndicator} data-mode={viewMode}>
            {viewMode === 'review' ? 'Reviewing step' : 'Previewing step'}
          </div>
        ) : (
          <div className={css.completionArea}>
            {step.completionHint &&
              (step.completionType === 'manual' || timer.done) &&
              !isFinal && (
                <div className={css.completionHint}>{step.completionHint}</div>
              )}
            {(step.completionType === 'manual' || timer.done || isFinal) && (
              <Btn
                onClick={timer.done ? handleComplete : onComplete}
                variant={isFinal ? 'success' : 'track'}
                size={isFinal ? 'lg' : 'md'}
              >
                {step.actionLabel || 'Next step →'}
              </Btn>
            )}
            {timer.done && !isFinal && !timer.overtime && (
              <div className={css.timerComplete}>Timer complete</div>
            )}
            {timer.running && !timer.done && (
              <button onClick={handleSkipAttempt} className={css.skipBtn}>
                Skip timer →
              </button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
