/* ─────────────────────────────────────────────────────────────────────────────
   Tiny Web-Audio helpers — no dependencies
   ───────────────────────────────────────────────────────────────────────────── */

let audioCtx: AudioContext | null = null;

function ctx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

/**
 * Play a gentle three-note ascending chime.
 * Used when a timer finishes.
 */
export function playChime(): void {
  try {
    const c = ctx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = "sine";
      o.frequency.value = freq;
      g.gain.setValueAtTime(0, c.currentTime + i * 0.3);
      g.gain.linearRampToValueAtTime(0.15, c.currentTime + i * 0.3 + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + i * 0.3 + 1.2);
      o.connect(g).connect(c.destination);
      o.start(c.currentTime + i * 0.3);
      o.stop(c.currentTime + i * 0.3 + 1.5);
    });
  } catch {
    /* silently fail — audio is optional */
  }
}

/**
 * Play a quiet tick sound.
 * Used during the last 10 seconds of a timer.
 */
export function playTick(): void {
  try {
    const c = ctx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "sine";
    o.frequency.value = 880;
    g.gain.setValueAtTime(0.05, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.15);
  } catch {
    /* silently fail */
  }
}
