import type { Recipe } from "../../../types";
import { Btn } from "../../common";
import css from "./CompletedScreen.module.css";

interface CompletedScreenProps {
  recipe: Recipe;
  onRestart: () => void;
}

export function CompletedScreen({ recipe, onRestart }: CompletedScreenProps) {
  return (
    <div className={css.container}>
      <div className={css.emoji}>🎉</div>
      <h1 className={css.title}>{recipe.title}</h1>
      <p className={css.message}>All steps complete. Enjoy your meal!</p>
      <Btn onClick={onRestart} variant="ghost" style={{ marginTop: 0 }}>
        ← Back to start
      </Btn>
    </div>
  );
}
