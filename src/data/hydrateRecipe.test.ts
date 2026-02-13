import { describe, it, expect } from "vitest";
import { hydrateRecipe } from "./hydrateRecipe";
import type { RecipeInput } from "../types";

function makeInput(overrides: Partial<RecipeInput> = {}): RecipeInput {
  return {
    title: "Test",
    description: "A test recipe",
    servings: 2,
    totalTime: "10 min",
    ingredients: [
      { name: "Salt", amount: "1 tsp" },
      { name: "Pepper" },
    ],
    equipment: [{ name: "Pan" }],
    stages: [
      {
        type: "cooking",
        label: "Cooking",
        description: "Cook it",
        tracks: [
          {
            label: "Main",
            color: "#000",
            steps: [{ instruction: "Do it", completionType: "manual" }],
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("hydrateRecipe", () => {
  it("generates ingredient IDs", () => {
    const recipe = hydrateRecipe(makeInput());
    expect(recipe.ingredients[0].id).toBe("ingredient-0");
    expect(recipe.ingredients[1].id).toBe("ingredient-1");
  });

  it("generates equipment IDs", () => {
    const recipe = hydrateRecipe(makeInput());
    expect(recipe.equipment[0].id).toBe("equipment-0");
  });

  it("generates stage IDs", () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: "preparation",
            label: "Prep",
            description: "",
            tracks: [{ label: "T", color: "#000", steps: [] }],
          },
          {
            type: "cooking",
            label: "Cook",
            description: "",
            tracks: [{ label: "T", color: "#000", steps: [] }],
          },
        ],
      }),
    );
    expect(recipe.stages[0].id).toBe("stage-0");
    expect(recipe.stages[1].id).toBe("stage-1");
  });

  it("uses track label as track ID", () => {
    const recipe = hydrateRecipe(makeInput());
    expect(recipe.stages[0].tracks[0].id).toBe("Main");
  });

  it("preserves startTrack when it matches a track label", () => {
    const recipe = hydrateRecipe(
      makeInput({
        stages: [
          {
            type: "cooking",
            label: "Cook",
            description: "",
            tracks: [
              {
                label: "Pasta",
                color: "#000",
                steps: [
                  {
                    instruction: "Boil",
                    completionType: "manual",
                    onComplete: { startTrack: "Sauce" },
                  },
                ],
              },
              {
                label: "Sauce",
                color: "#f00",
                isParallel: true,
                steps: [{ instruction: "Heat", completionType: "manual" }],
              },
            ],
          },
        ],
      }),
    );
    expect(recipe.stages[0].tracks[0].steps[0].onComplete?.startTrack).toBe("Sauce");
  });

  it("throws when startTrack references a non-existent label", () => {
    expect(() =>
      hydrateRecipe(
        makeInput({
          stages: [
            {
              type: "cooking",
              label: "Cook",
              description: "",
              tracks: [
                {
                  label: "Main",
                  color: "#000",
                  steps: [
                    {
                      instruction: "Go",
                      completionType: "manual",
                      onComplete: { startTrack: "Nonexistent" },
                    },
                  ],
                },
              ],
            },
          ],
        }),
      ),
    ).toThrow('startTrack "Nonexistent" does not match any track label in stage "Cook"');
  });

  it("preserves all other recipe fields", () => {
    const recipe = hydrateRecipe(makeInput());
    expect(recipe.title).toBe("Test");
    expect(recipe.servings).toBe(2);
    expect(recipe.ingredients[0].name).toBe("Salt");
    expect(recipe.ingredients[0].amount).toBe("1 tsp");
    expect(recipe.stages[0].tracks[0].steps[0].instruction).toBe("Do it");
  });
});
