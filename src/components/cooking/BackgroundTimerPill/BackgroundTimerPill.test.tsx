import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BackgroundTimerPill } from "./BackgroundTimerPill";
import type { RecipeTrack } from "../../../types";

const track: RecipeTrack = {
  id: "pasta",
  label: "Boil pasta",
  color: "#E07B4C",
  steps: [],
};

describe("BackgroundTimerPill", () => {
  it("renders track label", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={120}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("Boil pasta")).toBeInTheDocument();
  });

  it("shows formatted time remaining when not done", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={125}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("2:05 remaining")).toBeInTheDocument();
  });

  it("shows done message when done", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={0}
        total={300}
        done={true}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("Done — tap Dismiss")).toBeInTheDocument();
  });

  it("shows timer icon when running", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={60}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("⏱")).toBeInTheDocument();
  });

  it("shows checkmark icon when done", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={0}
        total={300}
        done={true}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByText("✓")).toBeInTheDocument();
  });

  it("renders Skip button when not done", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={60}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Skip" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("renders Dismiss button when done", () => {
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={0}
        total={300}
        done={true}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Skip" })).not.toBeInTheDocument();
  });

  it("calls onSkip when Skip is clicked", () => {
    const onSkip = vi.fn();
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={60}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={onSkip}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalledOnce();
  });

  it("calls onDismiss when Dismiss is clicked", () => {
    const onDismiss = vi.fn();
    render(
      <BackgroundTimerPill
        track={track}
        timeLeft={0}
        total={300}
        done={true}
        onDismiss={onDismiss}
        onSkip={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("sets data-done attribute when done", () => {
    const { container } = render(
      <BackgroundTimerPill
        track={track}
        timeLeft={0}
        total={300}
        done={true}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(container.firstElementChild).toHaveAttribute("data-done");
  });

  it("does not set data-done attribute when not done", () => {
    const { container } = render(
      <BackgroundTimerPill
        track={track}
        timeLeft={60}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(container.firstElementChild).not.toHaveAttribute("data-done");
  });

  it("sets --track-color CSS variable from track.color", () => {
    const { container } = render(
      <BackgroundTimerPill
        track={track}
        timeLeft={60}
        total={300}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(container.firstElementChild).toHaveStyle("--track-color: #E07B4C");
  });

  it("computes --progress as 1 when total is 0", () => {
    const { container } = render(
      <BackgroundTimerPill
        track={track}
        timeLeft={0}
        total={0}
        done={true}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(container.firstElementChild).toHaveStyle("--progress: 1");
  });

  it("computes --progress based on elapsed time", () => {
    const { container } = render(
      <BackgroundTimerPill
        track={track}
        timeLeft={100}
        total={200}
        done={false}
        onDismiss={vi.fn()}
        onSkip={vi.fn()}
      />,
    );
    expect(container.firstElementChild).toHaveStyle("--progress: 0.5");
  });
});
