import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TrackInterruptCard } from "./TrackInterruptCard";
import type { RecipeTrack } from "../../../types";

const track: RecipeTrack = {
  id: "sauce",
  label: "Make sauce",
  color: "#D94F4F",
  steps: [],
};

describe("TrackInterruptCard", () => {
  it("renders the track label in the title", () => {
    render(<TrackInterruptCard track={track} onSwitch={vi.fn()} />);
    expect(screen.getByText("Time to start: Make sauce")).toBeInTheDocument();
  });

  it("renders the arrow icon", () => {
    render(<TrackInterruptCard track={track} onSwitch={vi.fn()} />);
    expect(screen.getByText("↗")).toBeInTheDocument();
  });

  it("renders the timing description", () => {
    render(<TrackInterruptCard track={track} onSwitch={vi.fn()} />);
    expect(
      screen.getByText("This needs to happen now so the timing works out."),
    ).toBeInTheDocument();
  });

  it("renders switch button with track label", () => {
    render(<TrackInterruptCard track={track} onSwitch={vi.fn()} />);
    expect(
      screen.getByRole("button", { name: "Switch to Make sauce →" }),
    ).toBeInTheDocument();
  });

  it("calls onSwitch when button is clicked", () => {
    const onSwitch = vi.fn();
    render(<TrackInterruptCard track={track} onSwitch={onSwitch} />);
    fireEvent.click(screen.getByRole("button", { name: "Switch to Make sauce →" }));
    expect(onSwitch).toHaveBeenCalledOnce();
  });

  it("sets --track-color CSS variable from track.color", () => {
    const { container } = render(
      <TrackInterruptCard track={track} onSwitch={vi.fn()} />,
    );
    expect(container.firstElementChild).toHaveStyle("--track-color: #D94F4F");
  });
});
