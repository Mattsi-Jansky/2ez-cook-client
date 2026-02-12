import type { RecipeTrack } from "../../types";
import { Btn } from "../common";

interface TrackInterruptCardProps {
  track: RecipeTrack;
  onSwitch: () => void;
}

export function TrackInterruptCard({ track, onSwitch }: TrackInterruptCardProps) {
  return (
    <div
      style={{
        background: `linear-gradient(135deg,${track.color}11,${track.color}08)`,
        border: `2px solid ${track.color}55`,
        borderRadius: 20,
        padding: 24,
        marginTop: 20,
        textAlign: "center",
        animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: track.color,
          color: "white",
          fontSize: 18,
          marginBottom: 12,
        }}
      >
        ↗
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: "var(--color-heading)", marginBottom: 6 }}>
        Time to start: {track.label}
      </div>
      <div style={{ fontSize: 13, color: "var(--color-text)", marginBottom: 16, lineHeight: 1.5 }}>
        This needs to happen now so the timing works out.
      </div>
      <Btn onClick={onSwitch} color={track.color} small style={{ marginTop: 0 }}>
        Switch to {track.label} →
      </Btn>
    </div>
  );
}
