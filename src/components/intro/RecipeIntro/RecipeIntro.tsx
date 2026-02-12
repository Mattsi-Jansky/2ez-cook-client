import { useState } from "react";
import type { Recipe } from "../../../types";
import { ChecklistItem } from "../../common";
import css from "./RecipeIntro.module.css";

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
    <div className={css.page}>
      <div className={css.card}>
        {/* Hero */}
        <div className={css.hero}>
          <div className={css.heroEmoji}>🍝</div>
          <h1 className={css.heroTitle}>{recipe.title}</h1>
          <p className={css.heroDesc}>{recipe.description}</p>
          <div className={css.metaRow}>
            {[
              { l: "Time", v: recipe.totalTime, i: "⏱" },
              { l: "Serves", v: String(recipe.servings), i: "🍽" },
              { l: "Steps", v: String(totalSteps), i: "📋" },
            ].map((x) => (
              <div key={x.l} className={css.metaItem}>
                <div className={css.metaIcon}>{x.i}</div>
                <div className={css.metaValue}>{x.v}</div>
                <div className={css.metaLabel}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={css.tabBar}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={css.tab}
              data-active={tab === t.key || undefined}
            >
              {t.label}
              {t.badge && (
                <span
                  className={css.badge}
                  data-success={t.badge === "✓" || undefined}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={css.tabContent}>
          {tab === "overview" && <OverviewTab recipe={recipe} />}
          {tab === "checklist" && (
            <ChecklistTab recipe={recipe} checked={checked} onToggle={toggle} />
          )}
        </div>

        {/* Start button */}
        <div className={css.startArea}>
          {tab === "checklist" && !allChecked && allItems.length > 0 && (
            <div className={css.uncheckedHint}>
              {allItems.length - checkedCount} item
              {allItems.length - checkedCount !== 1 ? "s" : ""} not yet checked
            </div>
          )}
          <button onClick={onStart} className={css.startButton}>
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
    <div className={css.overviewContainer}>
      {recipe.stages.map((stage) => {
        const n = stage.tracks.reduce((s, t) => s + t.steps.length, 0);
        return (
          <div key={stage.id} className={css.stageItem}>
            <div className={css.stageIcon} data-stage={stage.type}>
              {stage.type === "preparation" ? "🔪" : "🍳"}
            </div>
            <div>
              <div className={css.stageName}>{stage.label}</div>
              <div className={css.stageMeta}>
                {n} step{n !== 1 ? "s" : ""}
                {stage.tracks.length > 1 ? ` · ${stage.tracks.length} parallel tracks` : ""}
              </div>
            </div>
          </div>
        );
      })}
      <div className={css.howItWorks}>
        <strong>How this works:</strong> One step at a time. Tap{" "}
        <span className={css.underlinedExample}>underlined words</span>{" "}
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
    <div className={css.checklistContainer}>
      <p className={css.checklistIntro}>
        Check off each item to confirm you have it. Tap the ▾ arrow for more detail on any item.
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
                checked={!!checked[it.id]}
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
