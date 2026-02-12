import { useState } from "react";
import type { Recipe } from "../../types";
import { ChecklistItem } from "../common";

interface RecipeIntroProps {
  recipe: Recipe;
  onStart: () => void;
}

type Tab = "overview" | "checklist";

export function RecipeIntro({ recipe, onStart }: RecipeIntroProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const totalSteps = recipe.stages.reduce(
    (sum, st) => sum + st.tracks.reduce((a, t) => a + t.steps.length, 0),
    0,
  );
  const allItems = [...(recipe.ingredients || []), ...(recipe.equipment || [])];
  const checkedCount = allItems.filter((it) => checked[it.id]).length;
  const allChecked = allItems.length > 0 && checkedCount === allItems.length;
  const toggle = (id: string) => setChecked((prev) => ({ ...prev, [id]: !prev[id] }));

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: "overview", label: "Overview" },
    {
      key: "checklist",
      label: "What You'll Need",
      badge:
        allItems.length > 0
          ? allChecked
            ? "✓"
            : `${checkedCount}/${allItems.length}`
          : undefined,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        animation: "fadeIn 0.8s ease",
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 28,
          maxWidth: 500,
          width: "100%",
          boxShadow: "0 8px 40px rgba(90,66,52,0.1)",
          border: "2px solid var(--color-card-border)",
          overflow: "hidden",
        }}
      >
        {/* Hero */}
        <div style={{ padding: "36px 32px 0", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🍝</div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              color: "var(--color-heading-dark)",
              fontWeight: 700,
              lineHeight: 1.3,
              marginBottom: 10,
            }}
          >
            {recipe.title}
          </h1>
          <p style={{ fontSize: 14, color: "var(--color-text)", lineHeight: 1.5, marginBottom: 20 }}>
            {recipe.description}
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            {[
              { l: "Time", v: recipe.totalTime, i: "⏱" },
              { l: "Serves", v: String(recipe.servings), i: "🍽" },
              { l: "Steps", v: String(totalSteps), i: "📋" },
            ].map((x) => (
              <div key={x.l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 20, marginBottom: 2 }}>{x.i}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-heading)" }}>
                  {x.v}
                </div>
                <div style={{ fontSize: 12, color: "var(--color-muted)" }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", borderBottom: "2px solid var(--color-card-border)" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                flex: 1,
                padding: "14px 12px",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                border: "none",
                borderBottom: `3px solid ${tab === t.key ? "var(--color-primary)" : "transparent"}`,
                background: tab === t.key ? "#FDFAF7" : "transparent",
                color: tab === t.key ? "var(--color-heading)" : "var(--color-muted)",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {t.label}
              {t.badge && (
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 10,
                    background: t.badge === "✓" ? "#E8F5E2" : "#FFF0E8",
                    color: t.badge === "✓" ? "var(--color-success)" : "var(--color-primary)",
                  }}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ padding: "24px 28px 8px", minHeight: 200 }}>
          {tab === "overview" && <OverviewTab recipe={recipe} />}
          {tab === "checklist" && (
            <ChecklistTab recipe={recipe} checked={checked} onToggle={toggle} />
          )}
        </div>

        {/* Start button */}
        <div style={{ padding: "16px 28px 32px", textAlign: "center" }}>
          {tab === "checklist" && !allChecked && allItems.length > 0 && (
            <div style={{ fontSize: 13, color: "var(--color-muted)", marginBottom: 12 }}>
              {allItems.length - checkedCount} item
              {allItems.length - checkedCount !== 1 ? "s" : ""} not yet checked
            </div>
          )}
          <button
            onClick={onStart}
            style={{
              width: "100%",
              background: "linear-gradient(135deg,#B07D62,#C4956F)",
              color: "white",
              border: "none",
              borderRadius: 18,
              padding: "16px 40px",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--font-body)",
              boxShadow: "0 6px 24px rgba(176,125,98,0.35)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "scale(1)";
            }}
          >
            Start cooking →
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────────────────── */

function OverviewTab({ recipe }: { recipe: Recipe }) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      {recipe.stages.map((stage, i) => {
        const n = stage.tracks.reduce((s, t) => s + t.steps.length, 0);
        return (
          <div
            key={stage.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 0",
              borderBottom:
                i < recipe.stages.length - 1 ? "1px solid var(--color-border-light)" : "none",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: stage.type === "preparation" ? "#FFF8F0" : "#FFF0E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {stage.type === "preparation" ? "🔪" : "🍳"}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-heading)" }}>
                {stage.label}
              </div>
              <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
                {n} step{n !== 1 ? "s" : ""}
                {stage.tracks.length > 1 ? ` · ${stage.tracks.length} parallel tracks` : ""}
              </div>
            </div>
          </div>
        );
      })}
      <div
        style={{
          background: "#FFF8F0",
          border: "1px solid #F0E0CC",
          borderRadius: 14,
          padding: "14px 18px",
          fontSize: 13,
          color: "#8B7355",
          lineHeight: 1.6,
          marginTop: 20,
        }}
      >
        <strong>How this works:</strong> One step at a time. Tap{" "}
        <span style={{ borderBottom: "2px dotted var(--color-primary)", fontWeight: 600 }}>
          underlined words
        </span>{" "}
        for explanations. Parallel steps are managed automatically.
      </div>
    </div>
  );
}

function ChecklistTab({
  recipe,
  checked,
  onToggle,
}: {
  recipe: Recipe;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  return (
    <div style={{ animation: "fadeIn 0.3s ease" }}>
      <p
        style={{
          fontSize: 13,
          color: "var(--color-muted)",
          lineHeight: 1.5,
          marginBottom: 20,
        }}
      >
        Check off each item to confirm you have it. Tap the ▾ arrow for more detail on any item.
      </p>

      {recipe.ingredients && recipe.ingredients.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "var(--color-primary)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🥘</span> Ingredients
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recipe.ingredients.map((it) => (
              <ChecklistItem
                key={it.id}
                item={it}
                checked={!!checked[it.id]}
                onToggle={() => onToggle(it.id)}
              />
            ))}
          </div>
        </div>
      )}

      {recipe.equipment && recipe.equipment.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: 1.2,
              color: "var(--color-primary)",
              marginBottom: 10,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <span>🍳</span> Equipment
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {recipe.equipment.map((it) => (
              <ChecklistItem
                key={it.id}
                item={it}
                checked={!!checked[it.id]}
                onToggle={() => onToggle(it.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
