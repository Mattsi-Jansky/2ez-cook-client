import { useState } from 'react'
import type { CSSProperties } from 'react'
import type { Recipe, RecipeTrack } from '../../../types'
import type { StepTimerRegistry } from '../../../hooks/useStepTimerRegistry'
import { ProgressBar, SkipTimerModal, StagesProgressBar } from '../../common'
import { StepCard } from '../StepCard/StepCard'
import { BackgroundTimerPill } from '../BackgroundTimerPill/BackgroundTimerPill'
import { TrackInterruptCard } from '../TrackInterruptCard/TrackInterruptCard'
import css from './CookingView.module.css'

interface CookingViewProps {
  recipe: Recipe
  portionsMultiplier: number
  currentStageIdx: number
  trackSteps: Record<string, number>
  activeTrack: string | null
  pendingTrackStart: string | null
  allTracks: RecipeTrack[]
  startedTracks: Set<string>
  stepTimers: StepTimerRegistry
  onAdvanceStep: (trackId: string) => void
  onSwitchTrack: (tid: string) => void
  onSetActiveTrack: (tid: string) => void
  onExit: () => void
}

function getActiveTimersNotOnActiveViewedStep(
  stepTimers: StepTimerRegistry,
  activeTrack: string | null,
  trackSteps: Record<string, number>,
  curStepIdx: number,
  isReviewing: boolean,
) {
  const otherTrackPills = stepTimers.getTimersForOtherTracks(
    activeTrack,
    trackSteps,
  )

  const currentStepTimerKey = `${activeTrack}:${curStepIdx}`
  const currentStepTimerEntry = stepTimers.getEntry(currentStepTimerKey)
  const showCurrentStepPill =
    isReviewing &&
    currentStepTimerEntry &&
    (currentStepTimerEntry.running || currentStepTimerEntry.done)

  const toastPills: typeof otherTrackPills = [
    ...(showCurrentStepPill
      ? [
          {
            trackId: activeTrack!,
            timerKey: currentStepTimerKey,
            timeLeft: currentStepTimerEntry.timeLeft,
            duration: currentStepTimerEntry.duration,
            done: currentStepTimerEntry.done,
          },
        ]
      : []),
    ...otherTrackPills,
  ]
  return toastPills
}

export function CookingView({
  recipe,
  portionsMultiplier,
  currentStageIdx,
  trackSteps,
  activeTrack,
  pendingTrackStart,
  allTracks,
  startedTracks,
  stepTimers,
  onAdvanceStep,
  onSwitchTrack,
  onSetActiveTrack,
  onExit,
}: CookingViewProps) {
  const [showSkipFor, setShowSkipFor] = useState<string | null>(null)
  const [viewStepIdx, setViewStepIdx] = useState(0)
  const [prevStepKey, setPrevStepKey] = useState(`${activeTrack}:0`)
  const [reviewedStageIdx, setReviewedStageIdx] = useState<number | null>(null)
  const [reviewedTrackId, setReviewedTrackId] = useState<string | null>(null)

  const isReviewingStage = reviewedStageIdx !== null
  const currentStage = recipe.stages[currentStageIdx]
  const stage = isReviewingStage
    ? recipe.stages[reviewedStageIdx!]
    : currentStage
  const displayTrackId = isReviewingStage ? reviewedTrackId : activeTrack
  const curTrack = stage.tracks.find((t) => t.id === displayTrackId)
  const activeTrackIdx = trackSteps[activeTrack || ''] || 0
  const curStepIdx = trackSteps[displayTrackId || ''] || 0

  const curStep = curTrack?.steps[curStepIdx]
  const isTrackStarted =
    isReviewingStage || (curTrack ? startedTracks.has(curTrack.id) : false)
  const isTrackDone =
    !isReviewingStage &&
    (!curStep || curStepIdx >= (curTrack?.steps.length ?? 0))
  const totalSteps = curTrack?.steps.length ?? 0

  const stepKey = `${activeTrack}:${activeTrackIdx}`
  if (stepKey !== prevStepKey && !isReviewingStage) {
    setPrevStepKey(stepKey)
    setViewStepIdx(activeTrackIdx)
  }

  const viewStep = curTrack?.steps[viewStepIdx]
  const isReviewing = viewStepIdx !== curStepIdx
  const canGoBack = viewStepIdx > 0
  const canGoForward = viewStepIdx < totalSteps - 1
  const pendingTrack = pendingTrackStart
    ? allTracks.find((t) => t.id === pendingTrackStart)
    : null
  const toastPills = getActiveTimersNotOnActiveViewedStep(
    stepTimers,
    activeTrack,
    trackSteps,
    activeTrackIdx,
    isReviewingStage || isReviewing,
  )

  const hasRunningStepTimers = currentStage.tracks.some((t) => {
    const idx = trackSteps[t.id] ?? 0
    return stepTimers.isRunning(`${t.id}:${idx}`)
  })

  function enterStageReview(stageIdx: number) {
    const reviewedStage = recipe.stages[stageIdx]
    const mainTrack =
      reviewedStage.tracks.find((t) => !t.isParallel) || reviewedStage.tracks[0]
    const completedCount = trackSteps[mainTrack.id] || 0
    const lastViewableStepIdx = Math.max(0, completedCount - 1)
    setReviewedStageIdx(stageIdx)
    setReviewedTrackId(mainTrack.id)
    setViewStepIdx(lastViewableStepIdx)
  }

  function exitStageReview() {
    setReviewedStageIdx(null)
    setReviewedTrackId(null)
    setViewStepIdx(activeTrackIdx)
    setPrevStepKey(`${activeTrack}:${activeTrackIdx}`)
  }

  function handleStageClick(idx: number) {
    if (idx < currentStageIdx) {
      enterStageReview(idx)
    } else if (idx === currentStageIdx && isReviewingStage) {
      exitStageReview()
    }
  }

  function stepViewMode(): 'current' | 'review' | 'preview' {
    if (!isReviewing && !isReviewingStage) return 'current'
    if (!isReviewingStage && viewStepIdx > curStepIdx) return 'preview'
    return 'review'
  }

  return (
    <div
      className={css.container}
      data-has-bg-timers={toastPills.length > 0 || undefined}
    >
      {/* Skip confirmation modal */}
      {showSkipFor &&
        (() => {
          const entry = stepTimers.getEntry(showSkipFor)
          if (!entry || entry.done) return null
          const [trackId] = showSkipFor.split(':')
          return (
            <SkipTimerModal
              timerLabel={
                allTracks.find((t) => t.id === trackId)?.label ||
                'Background timer'
              }
              timeLeft={entry.timeLeft}
              onConfirm={() => {
                stepTimers.forceComplete(showSkipFor)
                setShowSkipFor(null)
              }}
              onCancel={() => setShowSkipFor(null)}
            />
          )
        })()}

      {/* Sticky header */}
      <div className={css.stickyHeader}>
        <div className={css.headerInner}>
          <div className={css.headerRow}>
            <div>
              <div className={css.recipeTitle}>{recipe.title}</div>
              <div className={css.stageLabel}>{stage.label}</div>
              {isReviewingStage && (
                <button
                  className={css.returnToCurrentBtn}
                  onClick={exitStageReview}
                >
                  ↩ Back to current stage
                </button>
              )}
            </div>
            <button onClick={onExit} className={css.exitBtn}>
              ✕ Exit
            </button>
          </div>

          {recipe.stages.length > 1 && (
            <StagesProgressBar
              stages={recipe.stages}
              currentStageIdx={currentStageIdx}
              viewStageIdx={isReviewingStage ? reviewedStageIdx! : undefined}
              onClickStage={handleStageClick}
            />
          )}

          {/* Track switcher — current stage only */}
          {!isReviewingStage && stage.tracks.length > 1 && (
            <div className={css.trackSwitcher}>
              {stage.tracks.map((t) => {
                const started = startedTracks.has(t.id)
                const done = (trackSteps[t.id] || 0) >= t.steps.length
                return (
                  <button
                    key={t.id}
                    onClick={() => onSetActiveTrack(t.id)}
                    className={css.trackBtn}
                    data-active={activeTrack === t.id || undefined}
                    data-done={done || undefined}
                    data-pending={(!started && !done) || undefined}
                    style={{ '--track-color': t.color } as CSSProperties}
                  >
                    {t.label} {done ? '✓' : !started && '○'}
                  </button>
                )
              })}
            </div>
          )}

          <ProgressBar
            current={Math.min(curStepIdx, totalSteps)}
            total={totalSteps}
            color={curTrack?.color || 'var(--color-primary)'}
            viewIndex={isReviewing ? viewStepIdx : undefined}
          />

          {totalSteps > 1 && isTrackStarted && !isTrackDone && (
            <div className={css.stepNav}>
              <button
                disabled={!canGoBack}
                onClick={() => setViewStepIdx((i) => i - 1)}
                className={css.stepNavBtn}
              >
                ← Prev
              </button>
              <button
                disabled={!canGoForward}
                onClick={() => setViewStepIdx((i) => i + 1)}
                className={css.stepNavBtn}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast timer pills */}
      {toastPills.length > 0 && (
        <div className={css.bgTimerTray}>
          {toastPills.map((pill) => {
            const tr = allTracks.find((x) => x.id === pill.trackId)
            if (!tr) return null
            return (
              <BackgroundTimerPill
                key={pill.timerKey}
                track={tr}
                timeLeft={pill.timeLeft}
                total={pill.duration}
                done={pill.done}
                onView={() =>
                  pill.trackId === activeTrack
                    ? setViewStepIdx(curStepIdx)
                    : onSetActiveTrack(pill.trackId)
                }
                onSkip={() => setShowSkipFor(pill.timerKey)}
              />
            )
          })}
        </div>
      )}

      {/* Main content */}
      <div className={css.mainContent}>
        {!isTrackStarted ? (
          <div className={css.trackComplete}>
            <div className={css.trackCompleteEmoji}>○</div>
            <div className={css.trackCompleteTitle}>
              {curTrack?.label} — not started yet
            </div>
            <div className={css.trackCompleteMsg}>
              This track will begin later.
            </div>
          </div>
        ) : isTrackDone ? (
          <div className={css.trackComplete}>
            <div className={css.trackCompleteEmoji}>✅</div>
            <div className={css.trackCompleteTitle}>
              {curTrack?.label} — complete
            </div>
            <div className={css.trackCompleteMsg}>
              {hasRunningStepTimers
                ? 'Waiting for timers to finish.'
                : 'Moving on...'}
            </div>
          </div>
        ) : (
          curTrack &&
          viewStep && (
            <StepCard
              key={`${activeTrack}-${viewStepIdx}`}
              step={viewStep}
              stepIndex={viewStepIdx}
              totalSteps={totalSteps}
              track={curTrack}
              stageType={stage.type}
              portionsMultiplier={portionsMultiplier}
              stepTimers={stepTimers}
              onComplete={() => onAdvanceStep(activeTrack!)}
              viewMode={stepViewMode()}
            />
          )
        )}

        {/* Parallel track trigger — not shown when reviewing a past stage */}
        {!isReviewingStage &&
          pendingTrack &&
          pendingTrackStart !== activeTrack && (
            <TrackInterruptCard
              track={pendingTrack}
              onSwitch={() => onSwitchTrack(pendingTrackStart!)}
            />
          )}
      </div>
    </div>
  )
}
