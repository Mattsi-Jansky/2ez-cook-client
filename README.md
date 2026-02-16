# Calm Cook 🍳

A stress-free, step-by-step cooking app designed for people who aren't confident in the kitchen — particularly neurodivergent and anxious cooks.

## Philosophy

- **One step at a time.** No overwhelming recipe walls. Just the current thing you need to do.
- **No pressure.** Do one thing at a time, and take your time. Having an enjoyable, calm experience matters more than perfection.
- **No assumed knowledge.** Tap any underlined cooking term for a plain-English explanation.
- **Simple time management.** Parallel steps are orchestrated automatically with background timers.

## Getting started

```bash
npm install
npm run dev      # Dev server at http://localhost:5173
npm run build    # Static build in dist/
npm run preview  # Preview the production build
```

## Project structure

```
src/
├── components/
│   ├── common/          # Reusable UI: Btn, CircularTimer, ProgressBar, etc.
│   ├── cooking/         # Cooking-phase components: StepCard, CookingView, etc.
│   ├── intro/           # Recipe intro / checklist screen
│   ├── layout/          # Shell wrapper
│   └── App.tsx          # Root component — wires phases together
├── data/
├── hooks/
├── styles/
│   └── global.css       # CSS custom properties, reset, keyframes
├── types/
├── utils/
└── main.tsx             # Entry point
```

## Adding recipes

Drop a JSON file into `src/data/recipes/` and it will be picked up automatically. The file should conform to the `RecipeInput` type in `src/types/recipe.ts`.

Key concepts:

- **Stages** — group steps into phases (e.g. "Preparation", "Cooking"). Each stage has a `type` of `"preparation"` or `"cooking"`.
- **Tracks** — within a stage, steps are organized into tracks. A stage can have parallel tracks (e.g. pasta and broccoli cooking at the same time).
- **Parallel tracks** — set `isParallel: true` on a track, then use `startTrack` on a step in another track to trigger it.
- **Timers** — give a step a `timerDuration` (in seconds) and the completion type is inferred as `"timer"` automatically. Set `isBackground: true` to make it a background timer pill.
- **Glossary** — any step can include a `glossary` map. Underlined terms in the instruction text show a tooltip with a plain-English explanation.
- **Quantities** — use `quantities` on a step and reference them in the instruction with `{1}`, `{2}`, etc. These scale when servings change.
