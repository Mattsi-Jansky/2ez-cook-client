import type { RecipeStage } from "../../types";
import { Btn } from "../common";

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
    <div style={{ textAlign: "center", padding: "48px 24px", animation: "fadeIn 0.6s ease" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: toStage.type === "cooking" ? "#FFF0E8" : "#FFF8F0",
          fontSize: 36,
          marginBottom: 20,
        }}
      >
        {STAGE_ICON[toStage.type] || "📋"}
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          color: "var(--color-heading-dark)",
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {toStage.label}
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "var(--color-text)",
          maxWidth: 380,
          margin: "0 auto 28px",
          lineHeight: 1.55,
        }}
      >
        {toStage.description}
      </p>
      <Btn onClick={onContinue} color="var(--color-primary)" style={{ marginTop: 0 }}>
        Continue →
      </Btn>
    </div>
  );
}
