import type { Recipe, RecipeInput } from "../types";

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
    const tracks = stage.tracks.map((track) => {
      const id = track.label;
      return { ...track, id };
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
