import type { RecipeTrack } from "../../types";
import { formatTime } from "../../utils";

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
      style={{
        background: done ? "#E8F5E2" : "white",
        border: `2px solid ${done ? "var(--color-success)" : track.color}`,
        borderRadius: 20,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        boxShadow: done
          ? "0 0 0 4px rgba(107,143,94,0.3),0 4px 16px rgba(0,0,0,0.08)"
          : "0 2px 12px rgba(0,0,0,0.06)",
        animation: done ? "gentlePulse 2s ease-in-out infinite" : "none",
        transition: "all 0.4s ease",
      }}
    >
      {/* Mini circular progress */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: `conic-gradient(${track.color} ${prog * 360}deg, var(--color-track-bg) 0deg)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: done ? "#E8F5E2" : "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
          }}
        >
          {done ? "✓" : "⏱"}
        </div>
      </div>

      {/* Label + time */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>{track.label}</div>
        <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
          {done ? "Done — tap Dismiss" : `${formatTime(timeLeft)} remaining`}
        </div>
      </div>

      {/* Action */}
      {done ? (
        <button
          onClick={onDismiss}
          style={{
            fontSize: 11,
            background: "var(--color-success)",
            color: "white",
            padding: "6px 14px",
            borderRadius: 12,
            fontWeight: 600,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            animation: "gentlePulse 2s ease-in-out infinite",
          }}
        >
          Dismiss
        </button>
      ) : (
        <button
          onClick={onSkip}
          style={{
            fontSize: 11,
            background: "transparent",
            color: "var(--color-muted)",
            padding: "4px 10px",
            borderRadius: 10,
            fontWeight: 500,
            border: "1px solid var(--color-border)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.target as HTMLElement).style.color = "var(--color-text)";
            (e.target as HTMLElement).style.borderColor = "#CCC0B4";
          }}
          onMouseLeave={(e) => {
            (e.target as HTMLElement).style.color = "var(--color-muted)";
            (e.target as HTMLElement).style.borderColor = "var(--color-border)";
          }}
        >
          Skip
        </button>
      )}
    </div>
  );
}
