import { useState } from 'react'
import type { Recipe } from '../../../types'
import { ChecklistTab } from '../ChecklistTab/ChecklistTab'
import { OverviewTab } from '../OverviewTab/OverviewTab'
import css from './RecipeIntro.module.css'

interface RecipeIntroProps {
  recipe: Recipe
  onStart: (multiplier: number) => void
}

type Tab = 'overview' | 'checklist'

const RATIOS = [1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8]

function getPortionOptions(baseServings: number) {
  return RATIOS.map((r) => ({ ratio: r, portions: baseServings * r })).filter(
    (o) => o.portions >= 1 && o.portions <= 32,
  )
}

export function RecipeIntro({ recipe, onStart }: RecipeIntroProps) {
  const [tab, setTab] = useState<Tab>('overview')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [portionMultiplier, setPortionMultiplier] = useState(1)

  const portionOptions = getPortionOptions(recipe.servings)
  const scaledServings = recipe.servings * portionMultiplier

  const totalSteps = recipe.stages.reduce(
    (sum, st) => sum + st.tracks.reduce((a, t) => a + t.steps.length, 0),
    0,
  )
  const allItems = [...(recipe.ingredients || []), ...(recipe.equipment || [])]
  const checkedCount = allItems.filter((it) => checked[it.id]).length
  const allChecked = allItems.length > 0 && checkedCount === allItems.length
  const toggle = (id: string) =>
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))

  const tabs: { key: Tab; label: string; badge?: string }[] = [
    { key: 'overview', label: 'Overview' },
    {
      key: 'checklist',
      label: "What You'll Need",
      badge:
        allItems.length > 0
          ? allChecked
            ? '✓'
            : `${checkedCount}/${allItems.length}`
          : undefined,
    },
  ]

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
              { l: 'Time', v: recipe.totalTime, i: '⏱' },
              { l: 'Serves', v: String(scaledServings), i: '🍽' },
              { l: 'Steps', v: String(totalSteps), i: '📋' },
            ].map((x) => (
              <div key={x.l} className={css.metaItem}>
                <div className={css.metaIcon}>{x.i}</div>
                <div className={css.metaValue}>{x.v}</div>
                <div className={css.metaLabel}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Portion selector */}
          <div className={css.portionSelector}>
            <div className={css.portionLabel}>Portions</div>
            <div className={css.portionButtons}>
              {portionOptions.map((o) => (
                <button
                  key={o.ratio}
                  className={css.portionBtn}
                  data-active={portionMultiplier === o.ratio || undefined}
                  onClick={() => setPortionMultiplier(o.ratio)}
                >
                  {o.portions}
                </button>
              ))}
            </div>
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
                  data-success={t.badge === '✓' || undefined}
                >
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={css.tabContent}>
          {tab === 'overview' && <OverviewTab recipe={recipe} />}
          {tab === 'checklist' && (
            <ChecklistTab
              recipe={recipe}
              checked={checked}
              onToggle={toggle}
              portionMultiplier={portionMultiplier}
            />
          )}
        </div>

        {/* Start button */}
        <div className={css.startArea}>
          {tab === 'checklist' && !allChecked && allItems.length > 0 && (
            <div className={css.uncheckedHint}>
              {allItems.length - checkedCount} item
              {allItems.length - checkedCount !== 1 ? 's' : ''} not yet checked
            </div>
          )}
          <button
            onClick={() => onStart(portionMultiplier)}
            className={css.startButton}
          >
            Start cooking →
          </button>
        </div>
      </div>
    </div>
  )
}
