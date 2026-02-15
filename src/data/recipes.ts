import type { RecipeInput, Recipe } from "../types";
import { hydrateRecipe } from "./hydrateRecipe";

const modules = import.meta.glob<RecipeInput>("./recipes/*.json", {
  eager: true,
  import: "default",
});

export const recipes: Recipe[] = Object.values(modules).map(hydrateRecipe);
