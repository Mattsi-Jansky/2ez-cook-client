import type { RecipeStage } from '../../../types'
import css from './StagesProgressBar.module.css'

interface StagesProgressBarProps {
  stages: RecipeStage[]
  currentStageIdx: number
  viewStageIdx?: number
  onClickStage?: (idx: number) => void
}

function nodeState(
  i: number,
  currentStageIdx: number,
  viewStageIdx?: number,
): 'done' | 'viewed' | 'current' | 'future' {
  if (i === viewStageIdx && viewStageIdx !== currentStageIdx) return 'viewed'
  if (i < currentStageIdx) return 'done'
  if (i === currentStageIdx) return 'current'
  return 'future'
}

export function StagesProgressBar({
  stages,
  currentStageIdx,
  viewStageIdx,
  onClickStage,
}: StagesProgressBarProps) {
  const isReviewingPastStage =
    viewStageIdx !== undefined && viewStageIdx !== currentStageIdx

  return (
    <div className={css.container}>
      {stages.map((stage, i) => {
        const state = nodeState(i, currentStageIdx, viewStageIdx)
        const isCompleted = i < currentStageIdx
        const isClickable =
          i < currentStageIdx || (i === currentStageIdx && isReviewingPastStage)

        return (
          <div
            key={stage.id}
            className={css.stageItem}
            data-state={state}
            data-completed={isCompleted || undefined}
            data-clickable={isClickable || undefined}
            onClick={isClickable ? () => onClickStage?.(i) : undefined}
          >
            <div className={css.node} data-state={state}>
              {(state === 'done' || state === 'viewed') && (
                <span className={css.check}>✓</span>
              )}
              {state === 'current' && <div className={css.pulse} />}
            </div>
            <div className={css.label} data-state={state}>
              {stage.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
