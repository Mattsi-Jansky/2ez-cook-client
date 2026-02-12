import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OverviewTab } from "./OverviewTab";
import type { Recipe } from "../../../types";

const recipe: Recipe = {
  title: "Test Pasta",
  description: "A test recipe",
  servings: 2,
  totalTime: "30 min",
  ingredients: [],
  equipment: [],
  stages: [
    {
      id: "prep",
      type: "preparation",
      label: "Prep Work",
      description: "Get everything ready",
      tracks: [
        {
          id: "main",
          label: "Main",
          color: "#4C8CE0",
          steps: [
            { id: "s1", instruction: "Chop onions", completionType: "manual" },
            { id: "s2", instruction: "Mince garlic", completionType: "manual" },
          ],
        },
      ],
    },
    {
      id: "cook",
      type: "cooking",
      label: "Cooking",
      description: "Cook the dish",
      tracks: [
        {
          id: "pasta",
          label: "Pasta",
          color: "#4C8CE0",
          steps: [
            { id: "s3", instruction: "Boil water", completionType: "manual" },
          ],
        },
        {
          id: "sauce",
          label: "Sauce",
          color: "#D94F4F",
          isParallel: true,
          steps: [
            { id: "s4", instruction: "Heat oil", completionType: "manual" },
            { id: "s5", instruction: "Add tomatoes", completionType: "manual" },
          ],
        },
      ],
    },
  ],
};

describe("OverviewTab", () => {
  it("renders each stage label", () => {
    render(<OverviewTab recipe={recipe} />);
    expect(screen.getByText("Prep Work")).toBeInTheDocument();
    expect(screen.getByText("Cooking")).toBeInTheDocument();
  });

  it("shows preparation icon for preparation stages", () => {
    render(<OverviewTab recipe={recipe} />);
    const icons = screen.getAllByText("🔪");
    expect(icons).toHaveLength(1);
  });

  it("shows cooking icon for cooking stages", () => {
    render(<OverviewTab recipe={recipe} />);
    const icons = screen.getAllByText("🍳");
    expect(icons).toHaveLength(1);
  });

  it("sets data-stage attribute on stage icons", () => {
    const { container } = render(<OverviewTab recipe={recipe} />);
    const icons = container.querySelectorAll("[data-stage]");
    expect(icons[0]).toHaveAttribute("data-stage", "preparation");
    expect(icons[1]).toHaveAttribute("data-stage", "cooking");
  });

  it("shows step count per stage", () => {
    render(<OverviewTab recipe={recipe} />);
    expect(screen.getByText("2 steps")).toBeInTheDocument();
    expect(screen.getByText(/3 steps/)).toBeInTheDocument();
  });

  it("uses singular 'step' for a single step", () => {
    const singleStepRecipe: Recipe = {
      ...recipe,
      stages: [
        {
          id: "s",
          type: "cooking",
          label: "Quick",
          description: "",
          tracks: [
            {
              id: "t",
              label: "T",
              color: "#000",
              steps: [{ id: "x", instruction: "Do it", completionType: "manual" }],
            },
          ],
        },
      ],
    };
    render(<OverviewTab recipe={singleStepRecipe} />);
    expect(screen.getByText("1 step")).toBeInTheDocument();
  });

  it("shows parallel track count when stage has multiple tracks", () => {
    render(<OverviewTab recipe={recipe} />);
    expect(screen.getByText(/2 parallel tracks/)).toBeInTheDocument();
  });

  it("does not show parallel track info for single-track stages", () => {
    render(<OverviewTab recipe={recipe} />);
    const prepMeta = screen.getByText("2 steps");
    expect(prepMeta.textContent).not.toContain("parallel");
  });

  it("renders the how-it-works section", () => {
    render(<OverviewTab recipe={recipe} />);
    expect(screen.getByText(/How this works:/)).toBeInTheDocument();
    expect(screen.getByText("underlined words")).toBeInTheDocument();
  });
});
