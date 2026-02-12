import type { RecipeStage } from "../../../types";
import { Btn } from "../../common";
import css from "./StageTransition.module.css";

interface StageTransitionProps {
  toStage: RecipeStage;
  onContinue: () => void;
}

const STAGE_ICON: Record<string, string> = {
  preparation: "🔪",
  cooking: "🍳",
};

export function StageTransition({ toStage, onContinue }: StageTransitionProps) {
  return (
    <div className={css.container}>
      <div className={css.icon} data-stage={toStage.type}>
        {STAGE_ICON[toStage.type] || "📋"}
      </div>
      <h2 className={css.title}>{toStage.label}</h2>
      <p className={css.description}>{toStage.description}</p>
      <Btn onClick={onContinue} style={{ marginTop: 0 }}>
        Continue →
      </Btn>
    </div>
  );
}
