import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useStepTimerRegistry } from "./useStepTimerRegistry";

vi.mock("../utils", () => ({
  playChime: vi.fn(),
  playTick: vi.fn(),
}));

describe("useStepTimerRegistry", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns a not-started timer for a new key", () => {
    const { result } = renderHook(() => useStepTimerRegistry());
    const timer = result.current.getTimer("main:0", 60);

    expect(timer.timeLeft).toBe(60);
    expect(timer.running).toBe(false);
    expect(timer.done).toBe(false);
    expect(timer.notStarted).toBe(true);
    expect(timer.paused).toBe(false);
  });

  it("starts a timer and counts down", () => {
    const { result } = renderHook(() => useStepTimerRegistry());

    // Ensure timer exists
    act(() => {
      result.current.getTimer("main:0", 5);
    });

    // Start the timer
    act(() => {
      result.current.getTimer("main:0", 5).start();
    });

    const timer1 = result.current.getTimer("main:0", 5);
    expect(timer1.running).toBe(true);
    expect(timer1.notStarted).toBe(false);

    // Advance 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const timer2 = result.current.getTimer("main:0", 5);
    expect(timer2.timeLeft).toBe(4);
    expect(timer2.running).toBe(true);
  });

  it("pauses and resumes a timer", () => {
    const { result } = renderHook(() => useStepTimerRegistry());

    act(() => {
      result.current.getTimer("main:0", 10);
    });
    act(() => {
      result.current.getTimer("main:0", 10).start();
    });
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.getTimer("main:0", 10).timeLeft).toBe(7);

    // Pause
    act(() => {
      result.current.getTimer("main:0", 10).pause();
    });

    const paused = result.current.getTimer("main:0", 10);
    expect(paused.running).toBe(false);
    expect(paused.paused).toBe(true);

    // Time should not advance while paused
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.getTimer("main:0", 10).timeLeft).toBe(7);

    // Resume
    act(() => {
      result.current.getTimer("main:0", 10).resume();
    });

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.getTimer("main:0", 10).timeLeft).toBe(5);
  });

  it("marks timer as done when it reaches zero", () => {
    const { result } = renderHook(() => useStepTimerRegistry());

    act(() => {
      result.current.getTimer("main:0", 3);
    });
    act(() => {
      result.current.getTimer("main:0", 3).start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    const timer = result.current.getTimer("main:0", 3);
    expect(timer.timeLeft).toBe(0);
    expect(timer.done).toBe(true);
    expect(timer.running).toBe(false);
  });

  it("force-completes a running timer", () => {
    const { result } = renderHook(() => useStepTimerRegistry());

    act(() => {
      result.current.getTimer("main:0", 60);
    });
    act(() => {
      result.current.getTimer("main:0", 60).start();
    });
    act(() => {
      result.current.getTimer("main:0", 60).forceComplete();
    });

    const timer = result.current.getTimer("main:0", 60);
    expect(timer.timeLeft).toBe(0);
    expect(timer.done).toBe(true);
    expect(timer.running).toBe(false);
  });

  it("maintains separate timers for different keys", () => {
    const { result } = renderHook(() => useStepTimerRegistry());

    act(() => {
      result.current.getTimer("main:0", 10);
      result.current.getTimer("sauce:0", 20);
    });

    // Start only the first timer
    act(() => {
      result.current.getTimer("main:0", 10).start();
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.getTimer("main:0", 10).timeLeft).toBe(7);
    expect(result.current.getTimer("sauce:0", 20).timeLeft).toBe(20);
    expect(result.current.getTimer("sauce:0", 20).notStarted).toBe(true);
  });

  it("preserves timer state across getTimer calls (simulates remount)", () => {
    const { result } = renderHook(() => useStepTimerRegistry());

    act(() => {
      result.current.getTimer("main:0", 30);
    });
    act(() => {
      result.current.getTimer("main:0", 30).start();
    });
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Simulate what happens on track switch + switch back:
    // getTimer is called again with the same key
    const timer = result.current.getTimer("main:0", 30);
    expect(timer.timeLeft).toBe(25);
    expect(timer.running).toBe(true);
  });
});
