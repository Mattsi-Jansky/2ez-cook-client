import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { StepCard } from "./StepCard";
import type { RecipeStep, RecipeTrack } from "../../../types";
import type { StepTimerState } from "../../../hooks/useStepTimerRegistry";

const mockTimer: StepTimerState = {
  timeLeft: 0,
  running: false,
  done: false,
  notStarted: true,
  paused: false,
  start: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  forceComplete: vi.fn(),
};

const track: RecipeTrack = {
  id: "main",
  label: "Main",
  color: "#4C8CE0",
  steps: [],
};

function makeStep(overrides: Partial<RecipeStep> = {}): RecipeStep {
  return {
    instruction: "Dice the onions finely.",
    completionType: "manual",
    ...overrides,
  };
}

function resetTimer(overrides: Partial<StepTimerState> = {}) {
  Object.assign(mockTimer, {
    timeLeft: 0,
    running: false,
    done: false,
    notStarted: true,
    paused: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    forceComplete: vi.fn(),
    ...overrides,
  });
}

function makeStepTimers() {
  return { getTimer: vi.fn(() => mockTimer) };
}

describe("StepCard", () => {
  let stepTimers: ReturnType<typeof makeStepTimers>;

  beforeEach(() => {
    resetTimer();
    stepTimers = makeStepTimers();
  });

  it("renders the step number and progress", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={2}
        totalSteps={5}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText(/Step 3 of 5/)).toBeInTheDocument();
  });

  it("shows track label in step label for cooking stage", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText(/· Main/)).toBeInTheDocument();
  });

  it("does not show track label in step label for preparation stage", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="preparation"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.queryByText(/· Main/)).not.toBeInTheDocument();
  });

  it("shows Prep badge for preparation stage", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="preparation"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Prep")).toBeInTheDocument();
  });

  it("shows Cook badge for cooking stage", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Cook")).toBeInTheDocument();
  });

  it("sets data-stage attribute on badge", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Cook")).toHaveAttribute("data-stage", "cooking");
  });

  it("renders instruction text", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={1}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Dice the onions finely.")).toBeInTheDocument();
  });

  it("renders hint when present", () => {
    render(
      <StepCard
        step={makeStep({ hint: "Use a sharp knife" })}
        stepIndex={0}
        totalSteps={1}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Use a sharp knife")).toBeInTheDocument();
    expect(screen.getByText("💡")).toBeInTheDocument();
  });

  it("does not render hint when absent", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={1}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.queryByText("💡")).not.toBeInTheDocument();
  });

  it("shows Next step button for manual completion", () => {
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Next step →" })).toBeInTheDocument();
  });

  it("calls onComplete when Next step button is clicked", () => {
    const onComplete = vi.fn();
    render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Next step →" }));
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("uses custom actionLabel on button", () => {
    render(
      <StepCard
        step={makeStep({ actionLabel: "Done chopping" })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Done chopping" })).toBeInTheDocument();
  });

  it("shows completionHint for manual step", () => {
    render(
      <StepCard
        step={makeStep({ completionHint: "Onions should be translucent" })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Onions should be translucent")).toBeInTheDocument();
  });

  it("shows button with default actionLabel for final step", () => {
    render(
      <StepCard
        step={makeStep({ completionType: "final" })}
        stepIndex={0}
        totalSteps={1}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Next step →" })).toBeInTheDocument();
  });

  it("shows Start timer button when timer has not started", () => {
    resetTimer({ notStarted: true, timeLeft: 60 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Start timer" })).toBeInTheDocument();
  });

  it("calls timer.start when Start timer is clicked", () => {
    const start = vi.fn();
    resetTimer({ notStarted: true, timeLeft: 60, start });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Start timer" }));
    expect(start).toHaveBeenCalledOnce();
  });

  it("shows Pause button when timer is running", () => {
    resetTimer({ running: true, notStarted: false, timeLeft: 30 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "⏸ Pause" })).toBeInTheDocument();
  });

  it("shows Resume button when timer is paused", () => {
    resetTimer({ paused: true, notStarted: false, timeLeft: 30 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "▶ Resume" })).toBeInTheDocument();
  });

  it("does not show Next step button while timer is active", () => {
    resetTimer({ running: true, notStarted: false, timeLeft: 30 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Next step →" })).not.toBeInTheDocument();
  });

  it("shows Next step button after timer completes", () => {
    resetTimer({ done: true, notStarted: false, timeLeft: 0 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "Next step →" })).toBeInTheDocument();
    expect(screen.getByText("Timer complete")).toBeInTheDocument();
  });

  it("shows Skip timer button when timer is running", () => {
    resetTimer({ running: true, notStarted: false, timeLeft: 30 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(screen.getByText("Skip timer →")).toBeInTheDocument();
  });

  it("shows SkipTimerModal when skip timer is clicked while running", () => {
    resetTimer({ running: true, notStarted: false, timeLeft: 30 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60, timerLabel: "Boil" })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Skip timer →"));
    expect(screen.getByText("Timer still running")).toBeInTheDocument();
    expect(screen.getByText("Keep waiting")).toBeInTheDocument();
    expect(screen.getByText("Skip anyway")).toBeInTheDocument();
  });

  it("dismisses SkipTimerModal on cancel", () => {
    resetTimer({ running: true, notStarted: false, timeLeft: 30 });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Skip timer →"));
    fireEvent.click(screen.getByText("Keep waiting"));
    expect(screen.queryByText("Timer still running")).not.toBeInTheDocument();
  });

  it("calls forceComplete and onComplete on skip confirm", () => {
    const forceComplete = vi.fn();
    const onComplete = vi.fn();
    resetTimer({ running: true, notStarted: false, timeLeft: 30, forceComplete });
    stepTimers = makeStepTimers();

    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 60 })}
        stepIndex={0}
        totalSteps={3}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={onComplete}
      />,
    );
    fireEvent.click(screen.getByText("Skip timer →"));
    fireEvent.click(screen.getByText("Skip anyway"));
    expect(forceComplete).toHaveBeenCalledOnce();
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("sets --track-color CSS variable from track.color", () => {
    const { container } = render(
      <StepCard
        step={makeStep()}
        stepIndex={0}
        totalSteps={1}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    const card = container.querySelector("[class*='card']");
    expect(card).toHaveStyle("--track-color: #4C8CE0");
  });

  it("calls getTimer with correct key and duration", () => {
    render(
      <StepCard
        step={makeStep({ completionType: "timer", timerDuration: 120 })}
        stepIndex={3}
        totalSteps={5}
        track={track}
        stageType="cooking"
        stepTimers={stepTimers}
        onComplete={vi.fn()}
      />,
    );
    expect(stepTimers.getTimer).toHaveBeenCalledWith("main:3", 120);
  });
});
