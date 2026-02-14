import type { RecipeInput } from "../types";
import { hydrateRecipe } from "./hydrateRecipe";
import input from "./creamy-garlic-pasta.json";

export const SAMPLE_RECIPE = hydrateRecipe(input as RecipeInput);
