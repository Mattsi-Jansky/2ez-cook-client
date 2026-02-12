import type { CSSProperties } from "react";
import type { RecipeTrack } from "../../../types";
import { formatTime } from "../../../utils";
import css from "./BackgroundTimerPill.module.css";

interface BackgroundTimerPillProps {
  track: RecipeTrack;
  timeLeft: number;
  total: number;
  done: boolean;
  onDismiss: () => void;
  onSkip: () => void;
}

export function BackgroundTimerPill({
  track,
  timeLeft,
  total,
  done,
  onDismiss,
  onSkip,
}: BackgroundTimerPillProps) {
  const prog = total > 0 ? (total - timeLeft) / total : 1;

  return (
    <div
      className={css.pill}
      data-done={done || undefined}
      style={{ "--track-color": track.color, "--progress": prog } as CSSProperties}
    >
      <div className={css.progress}>
        <div className={css.progressInner}>
          {done ? "✓" : "⏱"}
        </div>
      </div>

      <div className={css.info}>
        <div className={css.trackLabel}>{track.label}</div>
        <div className={css.timeLabel}>
          {done ? "Done — tap Dismiss" : `${formatTime(timeLeft)} remaining`}
        </div>
      </div>

      {done ? (
        <button onClick={onDismiss} className={css.dismissBtn}>
          Dismiss
        </button>
      ) : (
        <button onClick={onSkip} className={css.skipBtn}>
          Skip
        </button>
      )}
    </div>
  );
}
