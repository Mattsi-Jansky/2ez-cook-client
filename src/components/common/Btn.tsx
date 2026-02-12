import type { CSSProperties, ReactNode } from "react";
import css from "./Btn.module.css";

interface BtnProps {
  onClick: () => void;
  children: ReactNode;
  color?: string;
  ghost?: boolean;
  big?: boolean;
  small?: boolean;
  style?: CSSProperties;
}

export function Btn({ onClick, children, color, ghost, big, small, style: sx }: BtnProps) {
  const className = `${css.btn}${ghost ? ` ${css.ghost}` : ""}${big ? ` ${css.big}` : ""}${small ? ` ${css.small}` : ""}`;

  return (
    <button
      onClick={onClick}
      className={className}
      style={{
        ...(color && !ghost ? { "--btn-color": color } as CSSProperties : undefined),
        ...sx,
      }}
    >
      {children}
    </button>
  );
}
