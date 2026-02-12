interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
}

export function ProgressBar({ current, total, color }: ProgressBarProps) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 5,
            borderRadius: 3,
            background:
              i < current ? color : i === current ? `${color}66` : "var(--color-border)",
            transition: "all 0.5s ease",
            overflow: "hidden",
          }}
        >
          {i === current && (
            <div
              style={{
                width: "50%",
                height: "100%",
                borderRadius: 3,
                background: color,
                animation: "progressPulse 2s ease-in-out infinite",
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
}
