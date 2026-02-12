import type { Recipe } from "../../types";
import { Btn } from "../common";

interface CompletedScreenProps {
  recipe: Recipe;
  onRestart: () => void;
}

export function CompletedScreen({ recipe, onRestart }: CompletedScreenProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 32,
        animation: "fadeIn 0.8s ease",
      }}
    >
      <div
        style={{
          fontSize: 72,
          marginBottom: 24,
          animation: "bounceIn 0.6s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        🎉
      </div>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 32,
          color: "var(--color-heading-dark)",
          fontWeight: 700,
          marginBottom: 12,
        }}
      >
        {recipe.title}
      </h1>
      <p
        style={{
          fontSize: 18,
          color: "var(--color-text)",
          maxWidth: 400,
          lineHeight: 1.6,
          marginBottom: 36,
        }}
      >
        All steps complete. Enjoy your meal!
      </p>
      <Btn onClick={onRestart} ghost style={{ marginTop: 0 }}>
        ← Back to start
      </Btn>
    </div>
  );
}
