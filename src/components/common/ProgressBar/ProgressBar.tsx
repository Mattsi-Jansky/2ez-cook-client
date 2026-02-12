import type { CSSProperties } from "react";
import css from "./ProgressBar.module.css";

interface ProgressBarProps {
  current: number;
  total: number;
  color: string;
}

export function ProgressBar({ current, total, color }: ProgressBarProps) {
  return (
    <div className={css.container} style={{ "--bar-color": color } as CSSProperties}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={css.segment}
          data-state={i < current ? "done" : i === current ? "current" : "future"}
        >
          {i === current && <div className={css.pulse} />}
        </div>
      ))}
    </div>
  );
}
