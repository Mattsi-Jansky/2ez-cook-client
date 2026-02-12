import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecipeIntro } from "./RecipeIntro";
import type { Recipe } from "../../../types";

const recipe: Recipe = {
  title: "Spaghetti Bolognese",
  description: "A classic Italian pasta dish",
  servings: 4,
  totalTime: "45 min",
  ingredients: [
    { id: "i1", name: "Spaghetti", amount: "400g" },
    { id: "i2", name: "Ground beef", amount: "500g" },
  ],
  equipment: [
    { id: "e1", name: "Large pot" },
  ],
  stages: [
    {
      id: "prep",
      type: "preparation",
      label: "Prep Work",
      description: "Prepare ingredients",
      tracks: [
        {
          id: "main",
          label: "Main",
          color: "#4C8CE0",
          steps: [
            { id: "s1", instruction: "Dice the onions", completionType: "manual" },
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
      ],
    },
  ],
};

describe("RecipeIntro", () => {
  it("renders the recipe title", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("Spaghetti Bolognese")).toBeInTheDocument();
  });

  it("renders the recipe description", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("A classic Italian pasta dish")).toBeInTheDocument();
  });

  it("renders meta items for time, servings, and steps", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("45 min")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders meta labels", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("Time")).toBeInTheDocument();
    expect(screen.getByText("Serves")).toBeInTheDocument();
    expect(screen.getByText("Steps")).toBeInTheDocument();
  });

  it("renders the overview tab by default", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("Prep Work")).toBeInTheDocument();
    expect(screen.getByText(/How this works:/)).toBeInTheDocument();
  });

  it("renders tab buttons", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText(/What You'll Need/)).toBeInTheDocument();
  });

  it("switches to checklist tab when clicked", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    fireEvent.click(screen.getByText(/What You'll Need/));
    expect(screen.getByText(/Check off each item/)).toBeInTheDocument();
    expect(screen.getByText("Spaghetti")).toBeInTheDocument();
  });

  it("switches back to overview tab", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    fireEvent.click(screen.getByText(/What You'll Need/));
    fireEvent.click(screen.getByText("Overview"));
    expect(screen.getByText("Prep Work")).toBeInTheDocument();
    expect(screen.queryByText(/Check off each item/)).not.toBeInTheDocument();
  });

  it("renders the start button", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByRole("button", { name: /Start cooking/ })).toBeInTheDocument();
  });

  it("calls onStart when start button is clicked", () => {
    const onStart = vi.fn();
    render(<RecipeIntro recipe={recipe} onStart={onStart} />);
    fireEvent.click(screen.getByRole("button", { name: /Start cooking/ }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("shows checklist badge with count", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.getByText("0/3")).toBeInTheDocument();
  });

  it("shows unchecked hint on checklist tab when items remain", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    fireEvent.click(screen.getByText(/What You'll Need/));
    expect(screen.getByText("3 items not yet checked")).toBeInTheDocument();
  });

  it("does not show unchecked hint on overview tab", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    expect(screen.queryByText(/not yet checked/)).not.toBeInTheDocument();
  });

  it("updates badge count when items are checked", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    fireEvent.click(screen.getByText(/What You'll Need/));
    fireEvent.click(screen.getByText("Spaghetti"));
    expect(screen.getByText("1/3")).toBeInTheDocument();
    expect(screen.getByText("2 items not yet checked")).toBeInTheDocument();
  });

  it("shows checkmark badge when all items are checked", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    fireEvent.click(screen.getByText(/What You'll Need/));
    fireEvent.click(screen.getByText("Spaghetti"));
    fireEvent.click(screen.getByText("Ground beef"));
    fireEvent.click(screen.getByText("Large pot"));
    const badge = screen.getAllByText("✓").find((el) => el.getAttribute("data-success"));
    expect(badge).toBeInTheDocument();
    expect(screen.queryByText(/not yet checked/)).not.toBeInTheDocument();
  });

  it("uses singular 'item' when only 1 unchecked remains", () => {
    render(<RecipeIntro recipe={recipe} onStart={vi.fn()} />);
    fireEvent.click(screen.getByText(/What You'll Need/));
    fireEvent.click(screen.getByText("Spaghetti"));
    fireEvent.click(screen.getByText("Ground beef"));
    expect(screen.getByText("1 item not yet checked")).toBeInTheDocument();
  });

  it("does not show badge when recipe has no items", () => {
    const noItems: Recipe = { ...recipe, ingredients: [], equipment: [] };
    render(<RecipeIntro recipe={noItems} onStart={vi.fn()} />);
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
    expect(screen.queryByText("✓")).not.toBeInTheDocument();
  });
});
