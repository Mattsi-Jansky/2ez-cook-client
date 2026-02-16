import type { Recipe } from "../../../types";
import { RecipeIntro } from "../../intro";
import css from "./RecipeEntry.module.css";

interface RecipeEntryProps {
  recipe: Recipe;
  isExpanded: boolean;
  onClick: () => void;
  onStart: (multiplier: number) => void;
}

export function RecipeEntry({
  recipe,
  isExpanded,
  onClick,
  onStart,
}: RecipeEntryProps) {
  return (
    <div className={css.entry} data-expanded={isExpanded || undefined}>
      <button className={css.header} onClick={onClick}>
        <div className={css.info}>
          <h2 className={css.title}>{recipe.title}</h2>
          <div className={css.meta}>
            <span>{recipe.totalTime}</span>
            <span className={css.dot} />
            <span>{recipe.servings} servings</span>
            <span className={css.dot} />
            <span>— kcal</span>
          </div>
        </div>
        <span className={css.chevron}>{isExpanded ? "▲" : "▼"}</span>
      </button>

      {isExpanded && (
        <div className={css.body}>
          <RecipeIntro recipe={recipe} onStart={onStart} />
        </div>
      )}
    </div>
  );
}
