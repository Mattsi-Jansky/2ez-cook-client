import { formatTime } from "../../utils";

interface CircularTimerProps {
  duration: number;
  timeLeft: number;
  running: boolean;
  size?: number;
  color?: string;
  label?: string;
}

export function CircularTimer({
  duration,
  timeLeft,
  running,
  size = 180,
  color = "var(--color-primary)",
  label,
}: CircularTimerProps) {
  const r = (size - 16) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - (duration > 0 ? (duration - timeLeft) / duration : 0));

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-track-bg)"
          strokeWidth={10}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={c}
          strokeDashoffset={off}
          strokeLinecap="round"
          style={{
            transition: running
              ? "stroke-dashoffset 1s linear"
              : "stroke-dashoffset 0.3s ease",
          }}
        />
      </svg>
      <div
        style={{
          position: "relative",
          marginTop: -size + 10,
          height: size - 20,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            fontSize: size > 120 ? 42 : 28,
            fontWeight: 700,
            fontFamily: "var(--font-mono)",
            color: "var(--color-heading)",
            letterSpacing: 2,
          }}
        >
          {formatTime(timeLeft)}
        </div>
        {label && (
          <div style={{ fontSize: 13, color: "var(--color-muted)", marginTop: 2, fontWeight: 500 }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
}
