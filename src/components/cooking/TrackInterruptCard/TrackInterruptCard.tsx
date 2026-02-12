import type { CSSProperties } from "react";
import type { RecipeTrack } from "../../../types";
import { Btn } from "../../common";
import css from "./TrackInterruptCard.module.css";

interface TrackInterruptCardProps {
  track: RecipeTrack;
  onSwitch: () => void;
}

export function TrackInterruptCard({ track, onSwitch }: TrackInterruptCardProps) {
  return (
    <div
      className={css.card}
      style={{ "--track-color": track.color } as CSSProperties}
    >
      <div className={css.icon}>↗</div>
      <div className={css.title}>Time to start: {track.label}</div>
      <div className={css.description}>
        This needs to happen now so the timing works out.
      </div>
      <Btn onClick={onSwitch} variant="track" size="sm" style={{ marginTop: 0 }}>
        Switch to {track.label} →
      </Btn>
    </div>
  );
}
