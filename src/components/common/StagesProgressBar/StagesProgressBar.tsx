import type { RecipeStage } from '../../../types'
import css from './StagesProgressBar.module.css'

interface StagesProgressBarProps {
  stages: RecipeStage[]
  currentStageIdx: number
}

function nodeState(
  i: number,
  currentStageIdx: number,
): 'done' | 'current' | 'future' {
  if (i < currentStageIdx) return 'done'
  if (i === currentStageIdx) return 'current'
  return 'future'
}

export function StagesProgressBar({
  stages,
  currentStageIdx,
}: StagesProgressBarProps) {
  return (
    <div className={css.container}>
      {stages.map((stage, i) => {
        const state = nodeState(i, currentStageIdx)
        return (
          <div key={stage.id} className={css.stageItem} data-state={state}>
            <div className={css.node} data-state={state}>
              {state === 'done' && <span className={css.check}>✓</span>}
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
