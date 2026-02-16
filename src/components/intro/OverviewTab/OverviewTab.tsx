import type { Recipe } from '../../../types'
import css from './OverviewTab.module.css'

interface OverviewTabProps {
  recipe: Recipe
}

export function OverviewTab({ recipe }: OverviewTabProps) {
  return (
    <div className={css.overviewContainer}>
      {recipe.stages.map((stage) => {
        const n = stage.tracks.reduce((s, t) => s + t.steps.length, 0)
        return (
          <div key={stage.id} className={css.stageItem}>
            <div className={css.stageIcon} data-stage={stage.type}>
              {stage.type === 'preparation' ? '🔪' : '🍳'}
            </div>
            <div>
              <div className={css.stageName}>{stage.label}</div>
              <div className={css.stageMeta}>
                {n} step{n !== 1 ? 's' : ''}
                {stage.tracks.length > 1
                  ? ` · ${stage.tracks.length} parallel tracks`
                  : ''}
              </div>
            </div>
          </div>
        )
      })}
      <div className={css.howItWorks}>
        <strong>How this works:</strong> One step at a time. Tap{' '}
        <span className={css.underlinedExample}>underlined words</span> for
        explanations. Parallel steps are managed automatically.
      </div>
    </div>
  )
}
