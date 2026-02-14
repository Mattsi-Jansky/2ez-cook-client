import type { Recipe, RecipeInput, RecipeStep } from "../types";

const TRACK_COLORS = ["#B07D62", "#6B8F5E", "#4C8CE0", "#D94F4F", "#8B6BAE"];

export function hydrateRecipe(input: RecipeInput): Recipe {
  const ingredients = input.ingredients.map((item, i) => ({
    ...item,
    id: `ingredient-${i}`,
  }));

  const equipment = input.equipment.map((item, i) => ({
    ...item,
    id: `equipment-${i}`,
  }));

  const stages = input.stages.map((stage, si) => {
    const tracks = stage.tracks.map((track, ti) => {
      const id = track.label;
      const color = track.color ?? TRACK_COLORS[ti % TRACK_COLORS.length];

      const steps: RecipeStep[] = track.steps.map((step) => {
        const { startTrack, completionType: explicitType, ...rest } = step;

        const completionType =
          explicitType ?? (step.timerDuration ? "timer" : "manual");

        const onComplete = startTrack ? { startTrack } : undefined;

        return { ...rest, completionType, onComplete };
      });

      return { ...track, id, color, steps };
    });

    const trackLabels = new Set(tracks.map((t) => t.label));

    for (const track of tracks) {
      for (const step of track.steps) {
        const target = step.onComplete?.startTrack;
        if (target && !trackLabels.has(target)) {
          throw new Error(
            `startTrack "${target}" does not match any track label in stage "${stage.label}"`,
          );
        }
      }
    }

    return { ...stage, id: `stage-${si}`, tracks };
  });

  return { ...input, ingredients, equipment, stages };
}
