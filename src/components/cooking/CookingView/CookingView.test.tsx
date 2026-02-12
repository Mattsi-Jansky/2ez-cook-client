import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CookingView } from "./CookingView";
import type { Recipe, RecipeTrack, BackgroundTimerMap } from "../../../types";

vi.mock("../../../hooks", () => ({
  useStepTimer: vi.fn(() => ({
    timeLeft: 0,
    running: false,
    done: false,
    notStarted: true,
    paused: false,
    start: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    forceComplete: vi.fn(),
  })),
}));

const mainTrack: RecipeTrack = {
  id: "main",
  label: "Main",
  color: "#4C8CE0",
  steps: [
    { id: "s1", instruction: "Boil water", completionType: "manual" },
    { id: "s2", instruction: "Add pasta", completionType: "manual" },
  ],
};

const sauceTrack: RecipeTrack = {
  id: "sauce",
  label: "Sauce",
  color: "#D94F4F",
  isParallel: true,
  steps: [
    { id: "ss1", instruction: "Heat oil", completionType: "manual" },
  ],
};

const recipe: Recipe = {
  title: "Test Pasta",
  description: "A test recipe",
  servings: 2,
  totalTime: "30 min",
  ingredients: [],
  equipment: [],
  stages: [
    {
      id: "stage1",
      type: "cooking",
      label: "Cooking",
      description: "Cook the pasta",
      tracks: [mainTrack, sauceTrack],
    },
  ],
};

function makeBgTimers(overrides: {
  timers?: BackgroundTimerMap;
  active?: [string, BackgroundTimerMap[string]][];
} = {}) {
  return {
    timers: overrides.timers ?? {},
    active: overrides.active ?? [],
    dismiss: vi.fn(),
    skip: vi.fn(),
  };
}

interface DefaultPropsOverrides {
  trackSteps?: Record<string, number>;
  activeTrack?: string | null;
  pendingTrackStart?: string | null;
  bgTimers?: ReturnType<typeof makeBgTimers>;
  allTracks?: RecipeTrack[];
}

function renderView(overrides: DefaultPropsOverrides = {}) {
  const props = {
    recipe,
    currentStageIdx: 0,
    trackSteps: { main: 0, sauce: 0 },
    activeTrack: "main",
    pendingTrackStart: null,
    allTracks: [mainTrack, sauceTrack],
    bgTimers: makeBgTimers(),
    onAdvanceStep: vi.fn(),
    onDismissBgTimer: vi.fn(),
    onSwitchTrack: vi.fn(),
    onSetActiveTrack: vi.fn(),
    onExit: vi.fn(),
    ...overrides,
  };
  return { ...render(<CookingView {...props} />), props };
}

describe("CookingView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the recipe title", () => {
    renderView();
    expect(screen.getByText("Test Pasta")).toBeInTheDocument();
  });

  it("renders the stage label", () => {
    renderView();
    expect(screen.getByText("Cooking")).toBeInTheDocument();
  });

  it("renders the exit button", () => {
    renderView();
    expect(screen.getByText(/Exit/)).toBeInTheDocument();
  });

  it("calls onExit when exit button is clicked", () => {
    const { props } = renderView();
    fireEvent.click(screen.getByText(/Exit/));
    expect(props.onExit).toHaveBeenCalledOnce();
  });

  it("renders the current step instruction", () => {
    renderView();
    expect(screen.getByText("Boil water")).toBeInTheDocument();
  });

  it("renders second step when trackSteps advances", () => {
    renderView({ trackSteps: { main: 1, sauce: 0 } });
    expect(screen.getByText("Add pasta")).toBeInTheDocument();
  });

  it("does not show track switcher when only one track is visible", () => {
    renderView({ trackSteps: { main: 0, sauce: 0 } });

    const buttons = screen.queryAllByRole("button");
    const trackBtns = buttons.filter(
      (b) => b.textContent === "Main" || b.textContent === "Sauce",
    );
    expect(trackBtns).toHaveLength(0);
  });

  it("shows track switcher when multiple tracks are visible", () => {
    renderView({ trackSteps: { main: 0, sauce: 1 } });
    expect(screen.getByText("Main")).toBeInTheDocument();
  });

  it("calls onSetActiveTrack when a track button is clicked", () => {
    const { props } = renderView({ trackSteps: { main: 0, sauce: 1 } });
    fireEvent.click(screen.getByText(/Sauce/));
    expect(props.onSetActiveTrack).toHaveBeenCalledWith("sauce");
  });

  it("marks completed tracks with a checkmark", () => {
    renderView({ trackSteps: { main: 0, sauce: 1 } });
    expect(screen.getByText(/Sauce ✓/)).toBeInTheDocument();
  });

  it("shows track complete when all steps are done", () => {
    renderView({ trackSteps: { main: 2, sauce: 0 } });
    expect(screen.getByText("Main — complete")).toBeInTheDocument();
    expect(screen.getByText("✅")).toBeInTheDocument();
  });

  it("shows waiting message when bg timers are active", () => {
    renderView({
      trackSteps: { main: 2, sauce: 0 },
      bgTimers: makeBgTimers({
        active: [["sauce", { timeLeft: 30, total: 60, done: false, dismissed: false }]],
      }),
    });
    expect(
      screen.getByText("Waiting for background timers to finish."),
    ).toBeInTheDocument();
  });

  it("shows moving on message when no active bg timers", () => {
    renderView({ trackSteps: { main: 2, sauce: 0 } });
    expect(screen.getByText("Moving on...")).toBeInTheDocument();
  });

  it("shows TrackInterruptCard when pendingTrackStart differs from activeTrack", () => {
    renderView({ pendingTrackStart: "sauce" });
    expect(screen.getByText("Time to start: Sauce")).toBeInTheDocument();
  });

  it("does not show TrackInterruptCard when pendingTrackStart matches activeTrack", () => {
    renderView({ pendingTrackStart: "main" });
    expect(screen.queryByText("Time to start: Main")).not.toBeInTheDocument();
  });

  it("does not show TrackInterruptCard when no pending track", () => {
    renderView({ pendingTrackStart: null });
    expect(screen.queryByText(/Time to start/)).not.toBeInTheDocument();
  });

  it("calls onSwitchTrack when switch button is clicked", () => {
    const { props } = renderView({ pendingTrackStart: "sauce" });
    fireEvent.click(screen.getByRole("button", { name: "Switch to Sauce →" }));
    expect(props.onSwitchTrack).toHaveBeenCalledWith("sauce");
  });

  it("renders background timer pills for active timers", () => {
    renderView({
      bgTimers: makeBgTimers({
        timers: { sauce: { timeLeft: 30, total: 60, done: false, dismissed: false } },
        active: [["sauce", { timeLeft: 30, total: 60, done: false, dismissed: false }]],
      }),
    });
    expect(screen.getByText(/remaining/)).toBeInTheDocument();
  });

  it("does not render bg timer tray when no active timers", () => {
    const { container } = renderView();
    expect(container.querySelector("[class*='bgTimerTray']")).not.toBeInTheDocument();
  });

  it("calls onDismissBgTimer when dismiss is clicked on a done pill", () => {
    const { props } = renderView({
      bgTimers: makeBgTimers({
        timers: { sauce: { timeLeft: 0, total: 60, done: true, dismissed: false } },
        active: [["sauce", { timeLeft: 0, total: 60, done: true, dismissed: false }]],
      }),
    });
    fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(props.onDismissBgTimer).toHaveBeenCalledWith("sauce");
  });

  it("sets data-has-bg-timers when background timers are active", () => {
    const { container } = renderView({
      bgTimers: makeBgTimers({
        active: [["sauce", { timeLeft: 30, total: 60, done: false, dismissed: false }]],
      }),
    });
    expect(container.firstElementChild).toHaveAttribute("data-has-bg-timers");
  });

  it("does not set data-has-bg-timers when no background timers", () => {
    const { container } = renderView();
    expect(container.firstElementChild).not.toHaveAttribute("data-has-bg-timers");
  });
});
