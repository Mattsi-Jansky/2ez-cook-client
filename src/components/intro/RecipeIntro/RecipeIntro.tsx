import { useState } from "react";
import type { Recipe } from "../../../types";
import { ChecklistTab } from "../ChecklistTab/ChecklistTab";
import { OverviewTab } from "../OverviewTab/OverviewTab";
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