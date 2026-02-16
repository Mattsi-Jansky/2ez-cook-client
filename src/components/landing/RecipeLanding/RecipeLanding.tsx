import { useState } from "react";
import type { Recipe } from "../../../types";
import { RecipeEntry } from "../RecipeEntry/RecipeEntry";
import css from "./RecipeLanding.module.css";

interface RecipeLandingProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe, multiplier: number) => void;
}

export function RecipeLanding({ recipes, onSelectRecipe }: RecipeLandingProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className={css.page}>
      <h1 className={css.heading}>Recipes</h1>
      <div className={css.list}>
        {recipes.map((recipe, i) => (
          <RecipeEntry
            key={recipe.title}
            recipe={recipe}
            isExpanded={expandedIndex === i}
            onClick={() => handleToggle(i)}
            onStart={(portionMultiplier: number) => onSelectRecipe(recipe, portionMultiplier)}
          />
        ))}
      </div>
    </div>
  );
}
