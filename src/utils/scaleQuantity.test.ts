import { describe, it, expect } from "vitest";
import {
  formatNumber,
  formatQuantity,
  formatIngredientAmount,
  applyStepQuantities,
} from "./scaleQuantity";
import type { RecipeItem } from "../types";

describe("formatNumber", () => {
  it("formats integers", () => {
    expect(formatNumber(3)).toBe("3");
  });

  it("formats values very close to integers", () => {
    expect(formatNumber(2.0004)).toBe("2");
  });

  it("formats ½", () => {
    expect(formatNumber(0.5)).toBe("½");
  });

  it("formats 1½", () => {
    expect(formatNumber(1.5)).toBe("1½");
  });

  it("formats ¼", () => {
    expect(formatNumber(0.25)).toBe("¼");
  });

  it("formats ¾", () => {
    expect(formatNumber(0.75)).toBe("¾");
  });

  it("formats ⅓", () => {
    expect(formatNumber(1 / 3)).toBe("⅓");
  });

  it("formats ⅔", () => {
    expect(formatNumber(2 / 3)).toBe("⅔");
  });

  it("falls back to one decimal for non-fraction values", () => {
    expect(formatNumber(1.7)).toBe("1.7");
  });

  it("rounds to integer when decimal rounds evenly", () => {
    expect(formatNumber(2.95)).toBe("3");
  });
});

describe("formatQuantity", () => {
  it("formats a single value with unit", () => {
    expect(formatQuantity(200, "g", 1)).toBe("200 g");
  });

  it("scales a single value", () => {
    expect(formatQuantity(200, "g", 2)).toBe("400 g");
  });

  it("formats a range", () => {
    expect(formatQuantity([1, 2], "tablespoons", 1)).toBe("1–2 tablespoons");
  });

  it("scales a range", () => {
    expect(formatQuantity([1, 2], "tablespoons", 2)).toBe("2–4 tablespoons");
  });

  it("formats scaled value as unicode fraction", () => {
    expect(formatQuantity(1, "cup", 0.5)).toBe("½ cup");
  });
});

describe("formatIngredientAmount", () => {
  it("returns formatted string for item with quantity and unit", () => {
    const item: RecipeItem = { id: "1", name: "Pasta", quantity: 200, unit: "g" };
    expect(formatIngredientAmount(item, 1)).toBe("200 g");
  });

  it("scales the quantity", () => {
    const item: RecipeItem = { id: "1", name: "Pasta", quantity: 200, unit: "g" };
    expect(formatIngredientAmount(item, 2)).toBe("400 g");
  });

  it("returns undefined for item without quantity", () => {
    const item: RecipeItem = { id: "1", name: "Salt" };
    expect(formatIngredientAmount(item, 2)).toBeUndefined();
  });

  it("handles range quantities", () => {
    const item: RecipeItem = { id: "1", name: "Oil", quantity: [1, 2], unit: "tablespoons" };
    expect(formatIngredientAmount(item, 1)).toBe("1–2 tablespoons");
  });

  it("scales down to fractions", () => {
    const item: RecipeItem = { id: "1", name: "Butter", quantity: 2, unit: "tablespoons" };
    expect(formatIngredientAmount(item, 0.5)).toBe("1 tablespoons");
  });
});

describe("applyStepQuantities", () => {
  it("replaces indexed placeholders with scaled values", () => {
    const text = "Add {1} of butter and {2} of cream cheese.";
    const quantities = [
      { value: 2, unit: "tablespoons" },
      { value: 125, unit: "g" },
    ];
    expect(applyStepQuantities(text, quantities, 1)).toBe(
      "Add 2 tablespoons of butter and 125 g of cream cheese.",
    );
  });

  it("scales values by multiplier", () => {
    const text = "Use {1} pasta.";
    const quantities = [{ value: 200, unit: "g" }];
    expect(applyStepQuantities(text, quantities, 2)).toBe("Use 400 g pasta.");
  });

  it("returns text unchanged when no quantities", () => {
    expect(applyStepQuantities("Just do it.", undefined, 2)).toBe("Just do it.");
  });

  it("returns text unchanged when quantities array is empty", () => {
    expect(applyStepQuantities("Just do it.", [], 2)).toBe("Just do it.");
  });

  it("leaves unmatched placeholders unchanged", () => {
    const text = "Use {1} and {3}.";
    const quantities = [{ value: 100, unit: "g" }];
    expect(applyStepQuantities(text, quantities, 1)).toBe("Use 100 g and {3}.");
  });

  it("formats scaled values as unicode fractions", () => {
    const text = "Use {1} of cream.";
    const quantities = [{ value: 1, unit: "cup" }];
    expect(applyStepQuantities(text, quantities, 0.5)).toBe("Use ½ cup of cream.");
  });
});
