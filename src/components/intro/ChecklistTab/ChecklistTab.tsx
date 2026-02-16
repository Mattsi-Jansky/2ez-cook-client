import type { Recipe } from '../../../types'
import { formatIngredientAmount } from '../../../utils'
import { ChecklistItem } from '../../common'
import css from './ChecklistTab.module.css'

interface ChecklistTabProps {
  recipe: Recipe
  checked: Record<string, boolean>
  onToggle: (id: string) => void
  portionMultiplier: number
}

export function ChecklistTab({
  recipe,
  checked,
  onToggle,
  portionMultiplier,
}: ChecklistTabProps) {
  return (
    <div className={css.checklistContainer}>
      <p className={css.checklistIntro}>
        Check off each item to confirm you have it. Tap the ▾ arrow for more
        detail on any item.
      </p>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div className={css.sectionGroup}>
          <div className={css.sectionLabel}>
            <span>🥘</span> Ingredients
          </div>
          <div className={css.itemList}>
            {recipe.ingredients.map((it) => (
              <ChecklistItem
                key={it.id}
                item={it}
                displayAmount={formatIngredientAmount(it, portionMultiplier)}
                checked={checked[it.id]}
                onToggle={() => onToggle(it.id)}
              />
            ))}
          </div>
        </div>
      )}

      {recipe.equipment && recipe.equipment.length > 0 && (
        <div>
          <div className={css.sectionLabel}>
            <span>🍳</span> Equipment
          </div>
          <div className={css.itemList}>
            {recipe.equipment.map((it) => (
              <ChecklistItem
                key={it.id}
                item={it}
                checked={checked[it.id]}
                onToggle={() => onToggle(it.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
